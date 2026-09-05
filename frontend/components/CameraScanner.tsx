'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CircleAlert, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CameraScannerProps {
  onScanComplete?: (file: File) => void;
  onClose?: () => void;
  isProcessing?: boolean;
}

type DetectionStatus = 'searching' | 'detected' | 'steady' | 'capturing' | 'manual';

interface FrameQuality {
  ready: boolean;
  message: string;
  centerX: number;
  centerY: number;
}

const ANALYSIS_INTERVAL_MS = 180;
const STABILITY_DURATION_MS = 950;
const MIN_CAPTURE_WIDTH = 320;

function inspectFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): FrameQuality {
  const analysisWidth = 320;
  const analysisHeight = Math.max(180, Math.round(analysisWidth * (video.videoHeight / video.videoWidth)));
  canvas.width = analysisWidth;
  canvas.height = analysisHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return { ready: false, message: 'Searching for label...', centerX: 0.5, centerY: 0.5 };

  context.drawImage(video, 0, 0, analysisWidth, analysisHeight);
  const pixels = context.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const left = Math.round(analysisWidth * 0.1);
  const right = Math.round(analysisWidth * 0.9);
  const top = Math.round(analysisHeight * 0.12);
  const bottom = Math.round(analysisHeight * 0.88);
  const backgroundSamples: number[] = [];
  const luminanceAt = (column: number, row: number) => {
    const offset = (row * analysisWidth + column) * 4;
    return pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
  };

  for (let column = left; column < right; column += 8) {
    backgroundSamples.push(luminanceAt(column, top), luminanceAt(column, bottom - 1));
  }
  for (let row = top; row < bottom; row += 8) {
    backgroundSamples.push(luminanceAt(left, row), luminanceAt(right - 1, row));
  }
  const backgroundMean = backgroundSamples.reduce((sum, value) => sum + value, 0) / Math.max(1, backgroundSamples.length);
  let brightnessTotal = 0;
  let brightnessSquareTotal = 0;
  let edgeTotal = 0;
  let readableEdges = 0;
  let foregroundCount = 0;
  let weightedX = 0;
  let weightedY = 0;
  let sampledPixels = 0;

  for (let row = top + 1; row < bottom - 1; row += 3) {
    for (let column = left + 1; column < right - 1; column += 3) {
      const luminance = luminanceAt(column, row);
      const horizontalEdge = Math.abs(luminance - luminanceAt(column - 1, row));
      const verticalEdge = Math.abs(luminance - luminanceAt(column, row - 1));
      const edgeStrength = (horizontalEdge + verticalEdge) / 2;
      brightnessTotal += luminance;
      brightnessSquareTotal += luminance * luminance;
      edgeTotal += edgeStrength;
      if (edgeStrength > 18) readableEdges++;
      if (Math.abs(luminance - backgroundMean) > 14 || edgeStrength > 22) {
        foregroundCount++;
        weightedX += column;
        weightedY += row;
      }
      sampledPixels++;
    }
  }

  const brightness = brightnessTotal / sampledPixels;
  const variance = Math.max(0, brightnessSquareTotal / sampledPixels - brightness * brightness);
  const edgeDensity = edgeTotal / sampledPixels;
  const readableTextDensity = readableEdges / sampledPixels;
  const foregroundRatio = foregroundCount / sampledPixels;
  const centerX = foregroundCount ? weightedX / foregroundCount / analysisWidth : 0.5;
  const centerY = foregroundCount ? weightedY / foregroundCount / analysisHeight : 0.5;
  const insideFrame = centerX >= 0.2 && centerX <= 0.8 && centerY >= 0.18 && centerY <= 0.82;
  const sufficientlyLarge = foregroundRatio >= 0.018 && foregroundRatio <= 0.98;
  const notBlank = variance >= 45 && edgeDensity >= 2.2 && readableTextDensity >= 0.008;
  const adequatelyLit = brightness >= 24 && brightness <= 250;
  const sharpEnough = edgeDensity >= 3;

  if (!insideFrame) return { ready: false, message: 'Center the label', centerX, centerY };
  if (!sufficientlyLarge) return { ready: false, message: 'Move closer', centerX, centerY };
  if (!adequatelyLit) return { ready: false, message: 'Improve lighting', centerX, centerY };
  if (!notBlank || !sharpEnough) return { ready: false, message: 'Searching for label...', centerX, centerY };
  if (video.videoWidth < MIN_CAPTURE_WIDTH) return { ready: false, message: 'Move closer', centerX, centerY };
  return { ready: true, message: 'Label detected', centerX, centerY };
}

export function CameraScanner({ onScanComplete, onClose, isProcessing = false }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureLockedRef = useRef(false);
  const stableSinceRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [autoCapture, setAutoCapture] = useState(true);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>('searching');
  const [guidance, setGuidance] = useState('Searching for label...');
  const [stabilityProgress, setStabilityProgress] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsReady(false);
  }, []);

  const requestCameraPermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera scanning is not supported in this browser.');
      return;
    }
    try {
      stopCamera();
      setCameraError(null);
      const constraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        if ((error as DOMException).name !== 'OverconstrainedError') throw error;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setIsReady(true);
      setDetectionStatus('searching');
      setGuidance('Searching for label...');
      stableSinceRef.current = null;
      lastPositionRef.current = null;
    } catch (error) {
      const cameraException = error as DOMException;
      const message = cameraException.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access or upload an image instead.'
        : cameraException.name === 'NotFoundError'
          ? 'No camera was detected on this device. Upload an image instead.'
          : cameraException.name === 'NotReadableError'
            ? 'The camera is already in use or unavailable. Close other camera apps and try again.'
            : 'The camera could not be started. Check your browser permissions and try again.';
      setCameraError(message);
    }
  }, [stopCamera]);

  useEffect(() => {
    void requestCameraPermission();
    return stopCamera;
  }, [requestCameraPermission, stopCamera]);

  useEffect(() => {
    if (!isReady || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => setCameraError('The camera preview could not be played.'));
  }, [isReady]);

  useEffect(() => () => {
    if (capturedImageUrl) URL.revokeObjectURL(capturedImageUrl);
  }, [capturedImageUrl]);

  const captureImage = useCallback(() => {
    if (captureLockedRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError('The camera is not ready yet. Try again in a moment.');
      return;
    }
    captureLockedRef.current = true;
    setDetectionStatus('capturing');
    setGuidance('Capturing...');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      captureLockedRef.current = false;
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        captureLockedRef.current = false;
        setDetectionStatus('manual');
        setGuidance('Capture failed. Try again.');
        return;
      }
      const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedImageUrl(URL.createObjectURL(blob));
      stopCamera();
      onScanComplete?.(file);
    }, 'image/jpeg', 0.92);
  }, [onScanComplete, stopCamera]);

  useEffect(() => {
    if (!isReady || !autoCapture || captureLockedRef.current) return;
    const analysisTimer = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight || captureLockedRef.current) return;
      const quality = inspectFrame(video, canvas);
      const now = performance.now();
      const lastPosition = lastPositionRef.current;
      const isStable = Boolean(lastPosition && Math.hypot(quality.centerX - lastPosition.x, quality.centerY - lastPosition.y) < 0.035);
      lastPositionRef.current = { x: quality.centerX, y: quality.centerY };

      if (!quality.ready) {
        stableSinceRef.current = null;
        setStabilityProgress(0);
        setDetectionStatus('searching');
        setGuidance(quality.message);
        return;
      }
      if (!isStable && stableSinceRef.current !== null) stableSinceRef.current = now;
      if (stableSinceRef.current === null) stableSinceRef.current = now;
      const elapsed = now - stableSinceRef.current;
      const progress = Math.min(100, Math.round((elapsed / STABILITY_DURATION_MS) * 100));
      setStabilityProgress(progress);
      if (progress < 100) {
        setDetectionStatus(elapsed > 120 ? 'steady' : 'detected');
        setGuidance(elapsed > 120 ? 'Hold steady...' : 'Label detected');
      } else {
        setDetectionStatus('capturing');
        setGuidance('Capturing...');
        captureImage();
      }
    }, ANALYSIS_INTERVAL_MS);
    return () => window.clearInterval(analysisTimer);
  }, [autoCapture, captureImage, isReady]);

  const startAnotherScan = () => {
    captureLockedRef.current = false;
    setCapturedImageUrl(null);
    setDetectionStatus('searching');
    setGuidance('Searching for label...');
    setStabilityProgress(0);
    void requestCameraPermission();
  };

  return (
    <div className="mt-6">
      <div className="relative h-[240px] overflow-hidden rounded-lg bg-[#0a0d14] sm:h-[320px]">
        {isReady ? <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" /> : capturedImageUrl ? <img src={capturedImageUrl} alt="Captured product label" className="size-full object-contain" /> : <div className="flex size-full flex-col items-center justify-center px-6 text-center text-[#94a3b8]"><Camera size={28} /><p className="mt-3 text-sm">Starting camera...</p></div>}
        <canvas ref={canvasRef} className="hidden" /><canvas ref={analysisCanvasRef} className="hidden" />
        <div className="pointer-events-none absolute inset-6 border-2 border-[#00bfa5] [clip-path:polygon(0_0,12%_0,12%_2px,2px_2px,2px_12%,0_12%,0_0,100%_0,100%_12%,calc(100%_-_2px)_12%,calc(100%_-_2px)_2px,88%_2px,88%_0,100%_0,100%_100%,88%_100%,88%_calc(100%_-_2px),calc(100%_-_2px)_calc(100%_-_2px),calc(100%_-_2px)_88%,100%_88%,100%_100%,0_100%,0_88%,2px_88%,2px_calc(100%_-_2px),12%_calc(100%_-_2px),12%_100%,0_100%)]" />
        {isReady && <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="flex size-12 items-center justify-center rounded-full border-2 border-[#00bfa5] bg-[#00bfa5]/20 text-[#00bfa5]"><Camera size={20} /></div><p className="mt-4 text-sm font-semibold text-white">{guidance}</p><p className="mt-1 font-mono text-[11px] text-[#94a3b8]">ISO Auto | Target AutoFocus</p>{stabilityProgress > 0 && <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-[#00bfa5] transition-[width]" style={{ width: `${stabilityProgress}%` }} /></div>}</div>}
        {isProcessing && <div className="absolute inset-0 flex items-center justify-center bg-black/55"><p className="rounded bg-black/70 px-4 py-2 text-sm font-semibold text-white">Analyzing package...</p></div>}
        <div className="absolute bottom-6 left-6 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white"><span className="mr-1 text-[#00bfa5]">●</span>{isReady ? 'CAM_FEED_ACTIVE // 60 FPS' : 'CAM_FEED_INACTIVE'}</div>
        {cameraError && <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded bg-red-950/90 px-3 py-2 text-xs text-red-100"><CircleAlert size={14} className="shrink-0" />{cameraError}</div>}
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-3"><div className="flex flex-wrap gap-3"><Button variant="primary" onClick={captureImage} disabled={!isReady || captureLockedRef.current || isProcessing}><Camera size={16} />Capture &amp; Analyze</Button><Button variant="outline" onClick={() => setAutoCapture((enabled) => !enabled)} disabled={!isReady || isProcessing}>{autoCapture ? 'Auto Capture: On' : 'Auto Capture: Off'}</Button><Button variant="outline" onClick={() => void requestCameraPermission()} disabled={isProcessing}><RotateCcw size={16} />Retry Camera</Button></div><div className="flex gap-2"><Button variant="ghost" onClick={startAnotherScan} disabled={!capturedImageUrl || isProcessing} aria-label="Start another scan"><RotateCcw size={16} />New Scan</Button><Button variant="ghost" onClick={() => { stopCamera(); onClose?.(); }} disabled={isProcessing} aria-label="Close camera"><X size={16} />Close</Button></div></div>
    </div>
  );
}
