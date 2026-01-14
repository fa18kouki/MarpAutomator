"""Tool system for GLM Agent function calling"""

import json
from abc import ABC, abstractmethod
from typing import Any, Callable

from pydantic import BaseModel, Field


class ToolParameter(BaseModel):
    """Single tool parameter definition"""

    name: str
    type: str = "string"
    description: str
    required: bool = True
    enum: list[str] | None = None


class Tool(ABC):
    """Base class for agent tools

    Subclass this to create custom tools that the agent can invoke.
    """

    name: str
    description: str
    parameters: list[ToolParameter] = []

    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """Execute the tool with given parameters

        Args:
            **kwargs: Tool parameters

        Returns:
            Tool execution result
        """
        pass

    def to_openai_tool(self) -> dict[str, Any]:
        """Convert to OpenAI function calling format"""
        properties = {}
        required = []

        for param in self.parameters:
            prop = {
                "type": param.type,
                "description": param.description,
            }
            if param.enum:
                prop["enum"] = param.enum

            properties[param.name] = prop

            if param.required:
                required.append(param.name)

        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required,
                },
            },
        }


class FunctionTool(Tool):
    """Tool wrapper for simple functions"""

    def __init__(
        self,
        func: Callable,
        name: str | None = None,
        description: str | None = None,
        parameters: list[ToolParameter] | None = None,
    ):
        """Create tool from function

        Args:
            func: Function to wrap
            name: Tool name (defaults to function name)
            description: Tool description (defaults to docstring)
            parameters: Parameter definitions
        """
        self._func = func
        self.name = name or func.__name__
        self.description = description or func.__doc__ or ""
        self.parameters = parameters or []

    def execute(self, **kwargs) -> Any:
        return self._func(**kwargs)


class ToolRegistry:
    """Registry for managing agent tools"""

    def __init__(self):
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        """Register a tool"""
        self._tools[tool.name] = tool

    def register_function(
        self,
        func: Callable,
        name: str | None = None,
        description: str | None = None,
        parameters: list[ToolParameter] | None = None,
    ) -> Tool:
        """Register a function as a tool"""
        tool = FunctionTool(func, name, description, parameters)
        self.register(tool)
        return tool

    def get(self, name: str) -> Tool | None:
        """Get tool by name"""
        return self._tools.get(name)

    def list_tools(self) -> list[str]:
        """List all registered tool names"""
        return list(self._tools.keys())

    def to_openai_tools(self) -> list[dict[str, Any]]:
        """Convert all tools to OpenAI format"""
        return [tool.to_openai_tool() for tool in self._tools.values()]

    def execute(self, name: str, arguments: str | dict) -> Any:
        """Execute a tool by name

        Args:
            name: Tool name
            arguments: Tool arguments (JSON string or dict)

        Returns:
            Tool execution result

        Raises:
            ValueError: If tool not found
        """
        tool = self._tools.get(name)
        if not tool:
            raise ValueError(f"Tool not found: {name}")

        if isinstance(arguments, str):
            arguments = json.loads(arguments)

        return tool.execute(**arguments)


def tool(
    name: str | None = None,
    description: str | None = None,
    parameters: list[ToolParameter] | None = None,
):
    """Decorator to create a tool from a function

    Usage:
        @tool(name="calculator", description="Perform calculations")
        def calc(expression: str) -> float:
            return eval(expression)
    """

    def decorator(func: Callable) -> FunctionTool:
        return FunctionTool(func, name, description, parameters)

    return decorator
