# GLM Agent

Z.AI GLM-4.7を使用したAIエージェントフレームワーク

## 特徴

- **GLM-4.7 API統合**: Z.AI/Zhipu AIの最新モデルをサポート
- **ツール呼び出し**: Function callingによる外部ツールの実行
- **思考モード**: 複雑な推論のためのThinkingモード対応
- **マルチターン会話**: 会話履歴の管理
- **ReActエージェント**: Reason-Actパターンによる構造化された問題解決
- **CLI**: 対話型インターフェース

## インストール

```bash
# クローン
git clone https://github.com/fa18kouki/MarpAutomator.git
cd MarpAutomator

# 依存関係のインストール
pip install -e .

# または開発モード
pip install -e ".[dev]"
```

## セットアップ

1. Z.AI APIキーを取得: https://z.ai または https://www.bigmodel.cn/

2. 環境変数を設定:
```bash
export ZAI_API_KEY=your-api-key
```

または `.env` ファイルを作成:
```bash
cp .env.example .env
# .envファイルにAPIキーを設定
```

## 使用方法

### CLI

```bash
# 対話モード
glm-agent

# 単発クエリ
glm-agent -q "今日は何曜日ですか？"

# ReActモード
glm-agent --react

# ツールなしモード
glm-agent --no-tools
```

### Python API

```python
from glm_agent import Agent, GLMClient

# シンプルなチャット
client = GLMClient()
response = client.simple_chat("こんにちは！")
print(response)

# エージェントを使用
agent = Agent()
response = agent.run("144の平方根は？")
print(response)
```

### カスタムツールの作成

```python
from glm_agent import Agent, Tool, ToolParameter

class MyTool(Tool):
    name = "my_tool"
    description = "カスタムツールの説明"
    parameters = [
        ToolParameter(
            name="input",
            type="string",
            description="入力パラメータ"
        )
    ]

    def execute(self, input: str) -> dict:
        return {"result": f"処理結果: {input}"}

agent = Agent(tools=[MyTool()])
response = agent.run("my_toolを使って処理して")
```

## 組み込みツール

- `calculator`: 数学計算
- `datetime`: 日時情報の取得
- `read_file`: ファイル読み込み
- `write_file`: ファイル書き込み

## API リファレンス

### GLMClient

```python
client = GLMClient(
    api_key="your-api-key",      # または ZAI_API_KEY 環境変数
    base_url="https://api.z.ai/api/paas/v4/",
    model="glm-4.7"
)

# チャット
response = client.chat(
    messages=[{"role": "user", "content": "Hello"}],
    thinking=True,    # 思考モード有効
    stream=False,     # ストリーミング
    max_tokens=4096
)
```

### Agent

```python
from glm_agent import Agent
from glm_agent.agent import AgentConfig

config = AgentConfig(
    system_prompt="あなたは親切なAIアシスタントです。",
    max_iterations=10,
    thinking_enabled=True,
    temperature=1.0
)

agent = Agent(config=config)
response = agent.run("質問")
```

## ライセンス

MIT License

## 参考リンク

- [Z.AI Developer Documentation](https://docs.z.ai/guides/llm/glm-4.7)
- [GLM-4.7 Blog](https://z.ai/blog/glm-4.7)
- [智谱AI開放平台](https://www.bigmodel.cn/)
