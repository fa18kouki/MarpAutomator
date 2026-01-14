"""Core Agent implementation with tool calling and reasoning"""

import json
from dataclasses import dataclass, field
from typing import Any, Callable

from glm_agent.client import GLMClient
from glm_agent.tools import Tool, ToolRegistry


@dataclass
class Message:
    """Conversation message"""

    role: str  # "system", "user", "assistant", "tool"
    content: str
    tool_call_id: str | None = None
    tool_calls: list[dict] | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to API message format"""
        msg = {"role": self.role, "content": self.content}
        if self.tool_call_id:
            msg["tool_call_id"] = self.tool_call_id
        if self.tool_calls:
            msg["tool_calls"] = self.tool_calls
        return msg


@dataclass
class AgentConfig:
    """Agent configuration"""

    system_prompt: str = "You are a helpful AI assistant."
    max_iterations: int = 10
    thinking_enabled: bool = True
    temperature: float = 1.0
    max_tokens: int = 4096


@dataclass
class AgentState:
    """Agent execution state"""

    messages: list[Message] = field(default_factory=list)
    iteration: int = 0
    completed: bool = False
    final_response: str = ""


class Agent:
    """AI Agent with tool calling and multi-step reasoning

    Features:
    - Multi-turn conversation with memory
    - Tool/function calling with automatic execution
    - Thinking mode for complex reasoning
    - Configurable iteration limits
    """

    def __init__(
        self,
        client: GLMClient | None = None,
        config: AgentConfig | None = None,
        tools: list[Tool] | None = None,
    ):
        """Initialize agent

        Args:
            client: GLM API client (creates default if None)
            config: Agent configuration
            tools: List of tools to register
        """
        self.client = client or GLMClient()
        self.config = config or AgentConfig()
        self.tool_registry = ToolRegistry()
        self.state = AgentState()

        # Register provided tools
        if tools:
            for tool in tools:
                self.tool_registry.register(tool)

        # Add system prompt
        self._add_system_prompt()

    def _add_system_prompt(self) -> None:
        """Add system prompt to conversation"""
        if self.config.system_prompt:
            self.state.messages.append(
                Message(role="system", content=self.config.system_prompt)
            )

    def register_tool(self, tool: Tool) -> None:
        """Register a tool for the agent to use"""
        self.tool_registry.register(tool)

    def register_function(
        self, func: Callable, name: str | None = None, description: str | None = None
    ) -> None:
        """Register a function as a tool"""
        self.tool_registry.register_function(func, name, description)

    def run(self, user_input: str) -> str:
        """Run agent with user input

        Executes the agentic loop:
        1. Send user message
        2. Get LLM response
        3. If tool calls, execute tools and continue
        4. Repeat until complete or max iterations

        Args:
            user_input: User message

        Returns:
            Final agent response
        """
        # Add user message
        self.state.messages.append(Message(role="user", content=user_input))
        self.state.iteration = 0
        self.state.completed = False

        while not self.state.completed and self.state.iteration < self.config.max_iterations:
            self.state.iteration += 1
            response = self._call_llm()

            if response.get("tool_calls"):
                self._handle_tool_calls(response)
            else:
                self.state.completed = True
                self.state.final_response = response.get("content", "")

        return self.state.final_response

    def _call_llm(self) -> dict[str, Any]:
        """Make LLM API call"""
        messages = [msg.to_dict() for msg in self.state.messages]
        tools = self.tool_registry.to_openai_tools() or None

        response = self.client.chat(
            messages=messages,
            tools=tools,
            thinking=self.config.thinking_enabled,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )

        # Add assistant response to conversation
        assistant_msg = Message(
            role="assistant",
            content=response.get("content", ""),
            tool_calls=response.get("tool_calls"),
        )
        self.state.messages.append(assistant_msg)

        return response

    def _handle_tool_calls(self, response: dict[str, Any]) -> None:
        """Execute tool calls and add results to conversation"""
        for tool_call in response["tool_calls"]:
            func = tool_call.get("function", {})
            tool_name = func.get("name")
            tool_args = func.get("arguments", "{}")
            tool_call_id = tool_call.get("id")

            try:
                result = self.tool_registry.execute(tool_name, tool_args)
                result_str = json.dumps(result) if not isinstance(result, str) else result
            except Exception as e:
                result_str = f"Error executing tool {tool_name}: {str(e)}"

            # Add tool result to conversation
            tool_msg = Message(
                role="tool",
                content=result_str,
                tool_call_id=tool_call_id,
            )
            self.state.messages.append(tool_msg)

    def chat(self, user_input: str) -> str:
        """Alias for run() - single turn conversation"""
        return self.run(user_input)

    def reset(self) -> None:
        """Reset agent state for new conversation"""
        self.state = AgentState()
        self._add_system_prompt()

    def get_conversation_history(self) -> list[dict[str, Any]]:
        """Get conversation history as list of dicts"""
        return [msg.to_dict() for msg in self.state.messages]


class ReactAgent(Agent):
    """ReAct-style agent with explicit reasoning steps

    Uses Reason-Act pattern for more structured problem solving.
    """

    DEFAULT_SYSTEM_PROMPT = """You are an AI assistant that uses a Reason-Act approach.

For each task:
1. THINK: Analyze what needs to be done
2. ACT: Use available tools or provide information
3. OBSERVE: Review results
4. Repeat until task is complete

Always explain your reasoning before taking action."""

    def __init__(
        self,
        client: GLMClient | None = None,
        config: AgentConfig | None = None,
        tools: list[Tool] | None = None,
    ):
        config = config or AgentConfig()
        if config.system_prompt == AgentConfig().system_prompt:
            config.system_prompt = self.DEFAULT_SYSTEM_PROMPT

        super().__init__(client, config, tools)
