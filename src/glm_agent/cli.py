"""CLI interface for GLM Agent"""

import argparse
import sys

from dotenv import load_dotenv
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt

from glm_agent.agent import Agent, AgentConfig, ReactAgent
from glm_agent.client import GLMClient
from glm_agent.builtin_tools import get_default_tools


console = Console()


def create_agent(
    api_key: str | None = None,
    system_prompt: str | None = None,
    react_mode: bool = False,
    no_tools: bool = False,
) -> Agent:
    """Create agent with configuration"""
    client = GLMClient(api_key=api_key)

    config = AgentConfig()
    if system_prompt:
        config.system_prompt = system_prompt

    agent_cls = ReactAgent if react_mode else Agent
    agent = agent_cls(client=client, config=config)

    # Register default tools unless disabled
    if not no_tools:
        for tool in get_default_tools():
            agent.register_tool(tool)

    return agent


def interactive_mode(agent: Agent) -> None:
    """Run interactive chat session"""
    console.print(
        Panel(
            "[bold green]GLM Agent[/bold green]\n"
            "Type your message and press Enter. Use 'exit' or 'quit' to stop.\n"
            "Commands: /reset (new conversation), /tools (list tools)",
            title="Welcome",
        )
    )

    while True:
        try:
            user_input = Prompt.ask("\n[bold blue]You[/bold blue]")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[yellow]Goodbye![/yellow]")
            break

        if not user_input.strip():
            continue

        # Handle commands
        if user_input.lower() in ("exit", "quit"):
            console.print("[yellow]Goodbye![/yellow]")
            break

        if user_input.startswith("/"):
            handle_command(agent, user_input)
            continue

        # Run agent
        with console.status("[bold cyan]Thinking...[/bold cyan]"):
            try:
                response = agent.run(user_input)
            except Exception as e:
                console.print(f"[red]Error: {e}[/red]")
                continue

        # Display response
        console.print("\n[bold green]Assistant[/bold green]")
        console.print(Markdown(response))


def handle_command(agent: Agent, command: str) -> None:
    """Handle CLI commands"""
    cmd = command.lower().strip()

    if cmd == "/reset":
        agent.reset()
        console.print("[yellow]Conversation reset.[/yellow]")

    elif cmd == "/tools":
        tools = agent.tool_registry.list_tools()
        if tools:
            console.print("[bold]Available tools:[/bold]")
            for name in tools:
                tool = agent.tool_registry.get(name)
                console.print(f"  - {name}: {tool.description}")
        else:
            console.print("[yellow]No tools registered.[/yellow]")

    elif cmd == "/history":
        history = agent.get_conversation_history()
        for msg in history:
            role = msg["role"]
            content = msg["content"][:100] + "..." if len(msg["content"]) > 100 else msg["content"]
            console.print(f"[{role}]: {content}")

    else:
        console.print(f"[yellow]Unknown command: {command}[/yellow]")


def single_query(agent: Agent, query: str) -> None:
    """Run single query and exit"""
    try:
        response = agent.run(query)
        console.print(Markdown(response))
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]", file=sys.stderr)
        sys.exit(1)


def main():
    """Main entry point"""
    load_dotenv()

    parser = argparse.ArgumentParser(
        description="GLM Agent - AI Assistant powered by Z.AI GLM-4.7"
    )
    parser.add_argument(
        "-q", "--query",
        help="Single query to run (non-interactive mode)"
    )
    parser.add_argument(
        "-k", "--api-key",
        help="Z.AI API key (or set ZAI_API_KEY env var)"
    )
    parser.add_argument(
        "-s", "--system-prompt",
        help="Custom system prompt"
    )
    parser.add_argument(
        "--react",
        action="store_true",
        help="Use ReAct-style agent"
    )
    parser.add_argument(
        "--no-tools",
        action="store_true",
        help="Disable built-in tools"
    )

    args = parser.parse_args()

    try:
        agent = create_agent(
            api_key=args.api_key,
            system_prompt=args.system_prompt,
            react_mode=args.react,
            no_tools=args.no_tools,
        )
    except ValueError as e:
        console.print(f"[red]Configuration error: {e}[/red]")
        sys.exit(1)

    if args.query:
        single_query(agent, args.query)
    else:
        interactive_mode(agent)


if __name__ == "__main__":
    main()
