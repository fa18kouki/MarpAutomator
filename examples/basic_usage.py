#!/usr/bin/env python3
"""Basic usage examples for GLM Agent"""

from glm_agent import Agent, GLMClient, Tool, ToolParameter


def example_simple_chat():
    """Simple chat without tools"""
    client = GLMClient()

    # Single turn conversation
    response = client.simple_chat(
        prompt="What is the capital of Japan?",
        system_prompt="You are a helpful assistant. Answer concisely."
    )
    print(f"Response: {response}")


def example_agent_with_tools():
    """Agent with built-in tools"""
    from glm_agent.builtin_tools import CalculatorTool, DateTimeTool

    agent = Agent(
        tools=[CalculatorTool(), DateTimeTool()]
    )

    # Agent will automatically use tools when needed
    response = agent.run("What is the square root of 144? Also, what day of the week is it?")
    print(f"Response: {response}")


def example_custom_tool():
    """Creating a custom tool"""

    class WeatherTool(Tool):
        name = "get_weather"
        description = "Get current weather for a city"
        parameters = [
            ToolParameter(
                name="city",
                type="string",
                description="City name to get weather for"
            )
        ]

        def execute(self, city: str) -> dict:
            # In production, call a real weather API
            return {
                "city": city,
                "temperature": 22,
                "condition": "sunny",
                "humidity": 45
            }

    agent = Agent(tools=[WeatherTool()])
    response = agent.run("What's the weather like in Tokyo?")
    print(f"Response: {response}")


def example_react_agent():
    """Using ReAct-style agent for complex reasoning"""
    from glm_agent.agent import ReactAgent
    from glm_agent.builtin_tools import CalculatorTool, FileReaderTool

    agent = ReactAgent(
        tools=[CalculatorTool(), FileReaderTool()]
    )

    response = agent.run(
        "Calculate the sum of 15, 27, and 38, then multiply the result by 2"
    )
    print(f"Response: {response}")


def example_streaming():
    """Streaming response example"""
    client = GLMClient()

    messages = [
        {"role": "user", "content": "Write a short poem about coding"}
    ]

    print("Streaming response:")
    for chunk in client.chat(messages, stream=True):
        if chunk["content"]:
            print(chunk["content"], end="", flush=True)
    print()


def example_multi_turn_conversation():
    """Multi-turn conversation with memory"""
    agent = Agent()

    # First turn
    response1 = agent.run("My name is Kouki")
    print(f"Turn 1: {response1}")

    # Second turn - agent remembers context
    response2 = agent.run("What's my name?")
    print(f"Turn 2: {response2}")

    # Reset for new conversation
    agent.reset()


if __name__ == "__main__":
    print("=== GLM Agent Examples ===\n")

    # Uncomment examples to run:
    # example_simple_chat()
    # example_agent_with_tools()
    # example_custom_tool()
    # example_react_agent()
    # example_streaming()
    # example_multi_turn_conversation()

    print("\nSet ZAI_API_KEY and uncomment examples to run.")
