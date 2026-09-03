'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useScanPipeline } from '@/lib/hooks/useScanPipeline';

export function NewScanView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, runFullPipeline, resetPipeline } = useScanPipeline();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    brand_name: '',
    manufacturer_name: '',
    product_category: 'food',
    is_imported: false,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      alert('Please upload a product label image first');
      return;
    }

    if (!productForm.product_name || !productForm.manufacturer_name) {
      alert('Please fill in Product Name and Manufacturer');
      return;
    }

    setIsProcessing(true);
    const result = await runFullPipeline(selectedFile, productForm);
    setIsProcessing(false);

    if (!result.success) {
      alert(`Scan failed: ${result.error}`);
    }
  };

  return (
    <AppShell pageTitle="New Compliance Scan">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2">
          New Compliance Scan
        </h2>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-3xl">
          Upload a product label to automatically extract declarations and check applicable compliance requirements.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Upload Area Card */}
          <div className="bg-surface rounded-xl border border-outline-variant shadow-xs p-1 overflow-hidden relative group transition-all hover:border-outline">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              {uploadedImageUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-36 h-28 rounded-lg overflow-hidden border border-outline-variant shadow-xs">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded Label Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">
                        Change Image
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary">
                      {selectedFileName}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Label ready for neural extraction • Click to replace
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary-container group-hover:text-primary transition-colors text-outline">
                    <span className="material-symbols-outlined text-4xl">
                      cloud_upload
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-2 text-center">
                    Drag & drop product label images here <br />
                    <span className="text-primary hover:underline font-normal text-body-base">
                      or Browse Files
                    </span>
                  </h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      image
                    </span>
                    JPG, PNG, WEBP • Multiple images supported
                  </p>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </div>

          {/* Upload Tips Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-xs flex flex-col gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant">
                center_focus_strong
              </span>
              <span className="text-label-bold font-label-bold text-on-surface uppercase text-xs">
                Capture complete label
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant text-xs">
                Ensure edges are visible.
              </span>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-xs flex flex-col gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant">
                blur_off
              </span>
              <span className="text-label-bold font-label-bold text-on-surface uppercase text-xs">
                Avoid blur
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant text-xs">
                Keep camera steady.
              </span>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-xs flex flex-col gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant">
                text_fields
              </span>
              <span className="text-label-bold font-label-bold text-on-surface uppercase text-xs">
                Ensure readability
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant text-xs">
                Text must be legible.
              </span>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-xs flex flex-col gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant">
                light_mode
              </span>
              <span className="text-label-bold font-label-bold text-on-surface uppercase text-xs">
                Good lighting
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant text-xs">
                Avoid glare & shadows.
              </span>
            </div>
          </div>

          {/* Product Information Form */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-xs p-6">
            <div className="border-b border-outline-variant pb-4 mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">inventory_2</span>
                Product Information{' '}
                <span className="text-body-sm font-body-sm text-outline font-normal">
                  (Optional context)
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="product_name"
                  className="text-label-bold font-label-bold text-on-surface uppercase text-xs"
                >
                  Product Name
                </label>
                <input
                  id="product_name"
                  type="text"
                  value={productForm.product_name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, product_name: e.target.value })
                  }
                  placeholder="e.g. Premium Basmati Rice"
                  className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 text-body-base font-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="brand_name"
                  className="text-label-bold font-label-bold text-on-surface uppercase text-xs"
                >
                  Brand Name
                </label>
                <input
                  id="brand_name"
                  type="text"
                  value={productForm.brand_name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, brand_name: e.target.value })
                  }
                  placeholder="e.g. Premium Select"
                  className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 text-body-base font-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="category"
                  className="text-label-bold font-label-bold text-on-surface uppercase text-xs"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={productForm.product_category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, product_category: e.target.value })
                    }
                    className="appearance-none border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 text-body-base font-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow w-full pr-10 cursor-pointer"
                  >
                    <option value="food">Food & Beverage</option>
                    <option value="cosmetics">Cosmetics</option>
                    <option value="electronics">Electronics</option>
                    <option value="dairy">Dairy Products</option>
                    <option value="packaged">General Packaged Commodities</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label
                  htmlFor="manufacturer"
                  className="text-label-bold font-label-bold text-on-surface uppercase text-xs"
                >
                  Manufacturer / Brand
                </label>
                <input
                  id="manufacturer"
                  type="text"
                  value={productForm.manufacturer_name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, manufacturer_name: e.target.value })
                  }
                  placeholder="e.g. ABC Foods Private Limited"
                  className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 text-body-base font-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow w-full"
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={productForm.is_imported}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_imported: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer"
                  />
                  <span className="text-body-base font-body-base text-on-surface group-hover:text-primary transition-colors">
                    Imported Product (Subject to customs & country-of-origin rules)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-2 border-t border-outline-variant pt-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon="search_check"
              onClick={handleStartAnalysis}
              className="px-6 py-2.5"
            >
              Analyze Product
            </Button>
          </div>
        </div>

        {/* Right Column (Quality Check Panel) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-xs sticky top-24 overflow-hidden">
            <div className="bg-surface-container-lowest p-4 border-b border-outline-variant flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                fact_check
              </span>
              <h3 className="text-headline-md font-headline-md text-on-surface m-0 text-base">
                Quality Check
              </h3>
              <span className="ml-auto text-label-bold font-label-bold px-2.5 py-1 bg-surface-container-highest rounded-full text-on-surface-variant border border-outline-variant text-xs">
                {uploadedImageUrl ? 'Image Loaded' : 'Awaiting Image'}
              </span>
            </div>

            <div className="p-4">
              <p className="text-body-sm font-body-sm text-on-surface-variant mb-4 pb-4 border-b border-outline-variant text-xs">
                {state.step !== 'idle' ? 'Processing pipeline active...' : 'Real-time analysis will activate upon file upload.'}
              </p>

              <ul className="space-y-3 font-data-tabular text-data-tabular">
                {[
                  { id: 'res', title: 'Resolution', icon: 'lens_blur', check: uploadedImageUrl },
                  { id: 'framing', title: 'Framing Complete', icon: 'aspect_ratio', check: uploadedImageUrl },
                  { id: 'lighting', title: 'Lighting Check', icon: 'wb_incandescent', check: uploadedImageUrl },
                  { id: 'orientation', title: 'Orientation', icon: 'crop_rotate', check: uploadedImageUrl },
                ].map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3 p-2 rounded transition-colors ${
                      item.check
                        ? 'bg-surface-container-lowest'
                        : 'bg-surface-container-lowest opacity-60'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined mt-0.5 text-[20px] ${
                        item.check ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="text-on-surface font-medium text-xs">
                        {item.title}
                      </div>
                      <div className={`text-xs mt-0.5 ${item.check ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {item.check ? 'Check passed' : 'Awaiting image'}
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        item.check ? 'text-primary' : 'text-outline opacity-50'
                      }`}
                    >
                      {item.check ? 'check_circle' : 'pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pipeline progress indicator */}
            {state.step !== 'idle' && (
              <div className="bg-surface-container-lowest p-3 border-t border-outline-variant">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-on-surface-variant font-medium">
                    Pipeline: {state.step.toUpperCase()}
                  </span>
                  <span className="text-primary font-mono">{state.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
                {state.error && (
                  <p className="text-xs text-error mt-2">Error: {state.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
