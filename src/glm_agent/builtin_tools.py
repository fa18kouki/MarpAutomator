"""Built-in tools for GLM Agent"""

import datetime
import json
import math
import subprocess
from typing import Any

from glm_agent.tools import Tool, ToolParameter


class CalculatorTool(Tool):
    """Perform mathematical calculations"""

    name = "calculator"
    description = "Evaluate mathematical expressions. Supports basic arithmetic, functions like sqrt, sin, cos, etc."
    parameters = [
        ToolParameter(
            name="expression",
            type="string",
            description="Mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)', 'sin(3.14)')",
        )
    ]

    def execute(self, expression: str) -> dict[str, Any]:
        """Safely evaluate mathematical expression"""
        # Safe math functions
        safe_dict = {
            "abs": abs,
            "round": round,
            "min": min,
            "max": max,
            "sum": sum,
            "pow": pow,
            "sqrt": math.sqrt,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "log": math.log,
            "log10": math.log10,
            "exp": math.exp,
            "pi": math.pi,
            "e": math.e,
        }

        try:
            result = eval(expression, {"__builtins__": {}}, safe_dict)
            return {"result": result, "expression": expression}
        except Exception as e:
            return {"error": str(e), "expression": expression}


class DateTimeTool(Tool):
    """Get current date and time information"""

    name = "datetime"
    description = "Get current date, time, or perform date calculations"
    parameters = [
        ToolParameter(
            name="operation",
            type="string",
            description="Operation to perform",
            enum=["now", "date", "time", "weekday", "timestamp"],
        )
    ]

    def execute(self, operation: str) -> dict[str, Any]:
        now = datetime.datetime.now()

        operations = {
            "now": lambda: now.isoformat(),
            "date": lambda: now.date().isoformat(),
            "time": lambda: now.time().isoformat(),
            "weekday": lambda: now.strftime("%A"),
            "timestamp": lambda: int(now.timestamp()),
        }

        if operation in operations:
            return {"result": operations[operation](), "operation": operation}
        return {"error": f"Unknown operation: {operation}"}


class WebSearchTool(Tool):
    """Search the web (placeholder - requires API integration)"""

    name = "web_search"
    description = "Search the web for information. Returns search results."
    parameters = [
        ToolParameter(
            name="query",
            type="string",
            description="Search query",
        ),
        ToolParameter(
            name="num_results",
            type="integer",
            description="Number of results to return",
            required=False,
        ),
    ]

    def execute(self, query: str, num_results: int = 5) -> dict[str, Any]:
        # Placeholder - in production, integrate with search API
        return {
            "query": query,
            "message": "Web search requires API integration. Configure a search provider.",
            "num_results": num_results,
        }


class ShellTool(Tool):
    """Execute shell commands (use with caution)"""

    name = "shell"
    description = "Execute a shell command and return the output. Use for file operations, system info, etc."
    parameters = [
        ToolParameter(
            name="command",
            type="string",
            description="Shell command to execute",
        ),
        ToolParameter(
            name="timeout",
            type="integer",
            description="Timeout in seconds",
            required=False,
        ),
    ]

    def execute(self, command: str, timeout: int = 30) -> dict[str, Any]:
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"error": f"Command timed out after {timeout} seconds"}
        except Exception as e:
            return {"error": str(e)}


class FileReaderTool(Tool):
    """Read file contents"""

    name = "read_file"
    description = "Read the contents of a file"
    parameters = [
        ToolParameter(
            name="path",
            type="string",
            description="Path to the file to read",
        ),
        ToolParameter(
            name="encoding",
            type="string",
            description="File encoding",
            required=False,
        ),
    ]

    def execute(self, path: str, encoding: str = "utf-8") -> dict[str, Any]:
        try:
            with open(path, "r", encoding=encoding) as f:
                content = f.read()
            return {"path": path, "content": content}
        except FileNotFoundError:
            return {"error": f"File not found: {path}"}
        except Exception as e:
            return {"error": str(e)}


class FileWriterTool(Tool):
    """Write content to a file"""

    name = "write_file"
    description = "Write content to a file"
    parameters = [
        ToolParameter(
            name="path",
            type="string",
            description="Path to the file to write",
        ),
        ToolParameter(
            name="content",
            type="string",
            description="Content to write",
        ),
        ToolParameter(
            name="append",
            type="boolean",
            description="Append to file instead of overwriting",
            required=False,
        ),
    ]

    def execute(
        self, path: str, content: str, append: bool = False
    ) -> dict[str, Any]:
        try:
            mode = "a" if append else "w"
            with open(path, mode, encoding="utf-8") as f:
                f.write(content)
            return {"path": path, "success": True, "mode": mode}
        except Exception as e:
            return {"error": str(e)}


def get_default_tools() -> list[Tool]:
    """Get list of default built-in tools"""
    return [
        CalculatorTool(),
        DateTimeTool(),
        FileReaderTool(),
        FileWriterTool(),
    ]


def get_all_tools() -> list[Tool]:
    """Get all available tools including potentially dangerous ones"""
    return [
        CalculatorTool(),
        DateTimeTool(),
        FileReaderTool(),
        FileWriterTool(),
        ShellTool(),
        WebSearchTool(),
    ]
