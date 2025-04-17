# Get Time MCP

## 概要

現在の日時を応答するMCPサーバーです。
Claudeが現在の日時を取得出来ない問題を解決するために作成しました。

## 仕様

現在のシステム日時を応答します。
Claude側がタイムゾーンを認識できる形式で応答します。

## Claude Desktopでの設定

Claude Desktopの設定ファイル（`%AppData%/Claude/claude_desktop_config.json`）に以下の設定を追加します：

```json
{
  "mcpServers": {
    "get-time-server": {
      "command": "node",
      "args": [
        "パスを環境に合わせて設定/build/index.js"
      ]
    }
  }
}
