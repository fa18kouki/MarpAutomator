"""GLM-4.7 API Client using OpenAI-compatible interface"""

import os
from typing import Any, Generator

from openai import OpenAI
from pydantic import BaseModel


class ThinkingConfig(BaseModel):
    """Configuration for GLM-4.7 thinking mode"""

    type: str = "enabled"  # "enabled" or "disabled"


class GLMClient:
    """Client for Z.AI GLM-4.7 API

    Supports:
    - Chat completions with thinking mode
    - Tool/function calling
    - Streaming responses
    """

    DEFAULT_BASE_URL = "https://api.z.ai/api/paas/v4/"
    DEFAULT_MODEL = "glm-4.7"

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ):
        """Initialize GLM client

        Args:
            api_key: Z.AI API key (defaults to ZAI_API_KEY env var)
            base_url: API base URL (defaults to Z.AI endpoint)
            model: Model name (defaults to glm-4.7)
        """
        self.api_key = api_key or os.getenv("ZAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key required. Set ZAI_API_KEY env var or pass api_key parameter."
            )

        self.base_url = base_url or os.getenv("ZAI_BASE_URL", self.DEFAULT_BASE_URL)
        self.model = model or self.DEFAULT_MODEL

        self._client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )

    def chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str = "auto",
        thinking: bool = True,
        max_tokens: int = 4096,
        temperature: float = 1.0,
        stream: bool = False,
        **kwargs,
    ) -> dict[str, Any] | Generator[dict[str, Any], None, None]:
        """Send chat completion request

        Args:
            messages: List of message dicts with role and content
            tools: List of tool definitions for function calling
            tool_choice: Tool selection mode ("auto", "none", "required")
            thinking: Enable thinking mode for reasoning
            max_tokens: Maximum output tokens
            temperature: Sampling temperature
            stream: Enable streaming response
            **kwargs: Additional parameters

        Returns:
            Response dict or generator for streaming
        """
        request_params = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": stream,
            **kwargs,
        }

        # Add thinking mode configuration
        if thinking:
            request_params["extra_body"] = {"thinking": {"type": "enabled"}}

        # Add tools if provided
        if tools:
            request_params["tools"] = tools
            request_params["tool_choice"] = tool_choice

        if stream:
            return self._stream_chat(request_params)
        else:
            response = self._client.chat.completions.create(**request_params)
            return self._parse_response(response)

    def _stream_chat(
        self, params: dict[str, Any]
    ) -> Generator[dict[str, Any], None, None]:
        """Handle streaming chat response"""
        stream = self._client.chat.completions.create(**params)

        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta:
                delta = chunk.choices[0].delta
                yield {
                    "content": delta.content or "",
                    "tool_calls": (
                        [tc.model_dump() for tc in delta.tool_calls]
                        if delta.tool_calls
                        else None
                    ),
                    "finish_reason": chunk.choices[0].finish_reason,
                }

    def _parse_response(self, response) -> dict[str, Any]:
        """Parse API response to dict"""
        choice = response.choices[0]
        message = choice.message

        result = {
            "content": message.content or "",
            "role": message.role,
            "finish_reason": choice.finish_reason,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
        }

        # Include tool calls if present
        if message.tool_calls:
            result["tool_calls"] = [tc.model_dump() for tc in message.tool_calls]

        return result

    def simple_chat(self, prompt: str, system_prompt: str | None = None) -> str:
        """Simple single-turn chat

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Assistant response content
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.chat(messages)
        return response["content"]
