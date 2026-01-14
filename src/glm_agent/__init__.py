"""GLM Agent - AI Agent built with Zhipu GLM-4.7"""

from glm_agent.client import GLMClient
from glm_agent.agent import Agent
from glm_agent.tools import Tool, ToolRegistry

__version__ = "0.1.0"
__all__ = ["GLMClient", "Agent", "Tool", "ToolRegistry"]
