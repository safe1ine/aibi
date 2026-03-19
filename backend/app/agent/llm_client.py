"""
统一的 LLM 调用抽象，支持 OpenAI 兼容接口和 Anthropic 原生接口
"""
import json
import sqlite3
from typing import Generator


def _get_active_config() -> dict:
    conn = sqlite3.connect("./catbi.db")
    row = conn.execute(
        "SELECT provider, base_url, api_key, model FROM llm_configs WHERE is_active=1 LIMIT 1"
    ).fetchone()
    conn.close()
    if not row:
        raise ValueError("未配置激活的大模型，请先在设置页面配置")
    return {"provider": row[0], "base_url": row[1], "api_key": row[2], "model": row[3]}


def chat(prompt: str) -> str:
    """单轮对话，返回文本"""
    cfg = _get_active_config()
    if cfg["provider"] == "anthropic":
        return _anthropic_chat(cfg, prompt)
    return _openai_chat(cfg, prompt)


def _openai_chat(cfg: dict, prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(base_url=cfg["base_url"], api_key=cfg["api_key"])
    resp = client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content.strip()


def _anthropic_chat(cfg: dict, prompt: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=cfg["api_key"], base_url=cfg["base_url"])
    resp = client.messages.create(
        model=cfg["model"],
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip()


# ── Agent loop ──────────────────────────────────────────────────────────────

TOOLS_OPENAI = [
    {
        "type": "function",
        "function": {
            "name": "execute_sql",
            "description": "对数据源执行 SQL 查询，返回结果",
            "parameters": {
                "type": "object",
                "properties": {"sql": {"type": "string"}},
                "required": ["sql"],
            },
        },
    }
]

TOOLS_ANTHROPIC = [
    {
        "name": "execute_sql",
        "description": "对数据源执行 SQL 查询，返回结果",
        "input_schema": {
            "type": "object",
            "properties": {"sql": {"type": "string", "description": "要执行的 SQL 语句"}},
            "required": ["sql"],
        },
    }
]


def run_agent_loop(
    system: str,
    user_message: str,
    tool_executor,          # callable(sql: str) -> str
    max_rounds: int = 5,
) -> Generator[str, None, None]:
    """
    执行 agent loop，yield 文本片段。
    tool_executor 负责实际执行 SQL 并返回结果字符串。
    """
    cfg = _get_active_config()
    if cfg["provider"] == "anthropic":
        yield from _anthropic_agent_loop(cfg, system, user_message, tool_executor, max_rounds)
    else:
        yield from _openai_agent_loop(cfg, system, user_message, tool_executor, max_rounds)


def _openai_agent_loop(cfg, system, user_message, tool_executor, max_rounds):
    from openai import OpenAI
    client = OpenAI(base_url=cfg["base_url"], api_key=cfg["api_key"])
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user_message},
    ]

    for _ in range(max_rounds):
        resp = client.chat.completions.create(
            model=cfg["model"], messages=messages, tools=TOOLS_OPENAI, tool_choice="auto"
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            yield msg.content or ""
            return

        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ],
        })

        for tc in msg.tool_calls:
            sql = json.loads(tc.function.arguments).get("sql", "")
            yield f"\n```sql\n{sql}\n```\n\n"
            result = tool_executor(sql)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})

    yield "\n（已达到最大工具调用轮次）"


def _anthropic_agent_loop(cfg, system, user_message, tool_executor, max_rounds):
    import anthropic
    client = anthropic.Anthropic(api_key=cfg["api_key"], base_url=cfg["base_url"])
    messages = [{"role": "user", "content": user_message}]

    for _ in range(max_rounds):
        resp = client.messages.create(
            model=cfg["model"],
            max_tokens=4096,
            system=system,
            tools=TOOLS_ANTHROPIC,
            messages=messages,
        )

        # 输出文本内容
        for block in resp.content:
            if block.type == "text":
                yield block.text

        if resp.stop_reason != "tool_use":
            return

        # 收集工具调用
        messages.append({"role": "assistant", "content": resp.content})
        tool_results = []
        for block in resp.content:
            if block.type == "tool_use":
                sql = block.input.get("sql", "")
                yield f"\n```sql\n{sql}\n```\n\n"
                result = tool_executor(sql)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        messages.append({"role": "user", "content": tool_results})

    yield "\n（已达到最大工具调用轮次）"
