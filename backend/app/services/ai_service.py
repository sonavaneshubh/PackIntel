from typing import Dict, Any


class AIService:
    @staticmethod
    def extract_declarations(raw_text: str) -> Dict[str, Any]:
        """
        AI extraction service mapping OCR output into structured Legal Metrology declaration fields.
        
        Requires integration with an AI/LLM service (OpenAI, Anthropic, local model, etc.)
        or a custom NLP pipeline.
        
        Raises:
            NotImplementedError: If no AI provider is configured.
        """
        raise NotImplementedError(
            "AI extraction service not configured. Please integrate with an AI/LLM service "
            "(OpenAI, Anthropic, local model, etc.) and implement the extract_declarations method."
        )


def get_ai_service() -> AIService:
    """Factory function to get configured AI service."""
    return AIService()