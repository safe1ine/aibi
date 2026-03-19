"""
数据源分析器：配置数据源时触发，生成 schema_doc 供后续问答使用
"""
import json
import os
import duckdb
import pandas as pd
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.models.datasource import DataSource, DataSourceType, DataSourceStatus
from app.agent.llm_client import chat as llm_chat

DATABASE_URL = "sqlite+aiosqlite:///./catbi.db"


async def analyze_datasource(ds_id: int):
    """后台任务：分析数据源，生成结构说明"""
    engine = create_async_engine(DATABASE_URL)
    Session = async_sessionmaker(engine)

    async with Session() as db:
        result = await db.execute(select(DataSource).where(DataSource.id == ds_id))
        ds = result.scalar_one_or_none()
        if not ds:
            return

        try:
            if ds.type == DataSourceType.database:
                connection_info, schema_doc = await _analyze_database(ds.description)
            else:
                files = json.loads(ds.connection_info or "{}").get("files", [])
                connection_info, schema_doc = _analyze_files(files, ds.description)

            ds.connection_info = json.dumps(connection_info)
            ds.schema_doc = schema_doc
            ds.status = DataSourceStatus.ready
        except Exception as e:
            ds.status = DataSourceStatus.error
            ds.error_message = str(e)

        await db.commit()
    await engine.dispose()


async def _analyze_database(description: str) -> tuple[dict, str]:
    # Step 1: 从自然语言提取连接参数
    extract_prompt = f"""从以下数据库描述中提取连接参数，以 JSON 格式返回，只返回 JSON，不要其他内容。

描述：{description}

返回格式：
{{
  "type": "mysql" | "postgresql" | "sqlite",
  "host": "...",
  "port": 3306,
  "database": "...",
  "username": "...",
  "password": "..."
}}

如果是 sqlite，只需要 type 和 database（文件路径）。"""

    raw = llm_chat(extract_prompt)
    # 提取 JSON 部分（防止模型多输出文字）
    start, end = raw.find("{"), raw.rfind("}") + 1
    conn_info = json.loads(raw[start:end])

    # Step 2: 连接数据库获取 schema
    schema_raw = await _get_db_schema(conn_info)

    # Step 3: 生成结构说明
    schema_doc = _generate_schema_doc(description, schema_raw)
    return conn_info, schema_doc


def _analyze_files(file_paths: list[str], description: str) -> tuple[dict, str]:
    file_schemas = []
    for path in file_paths:
        filename = os.path.basename(path)
        df_sample = pd.read_csv(path, nrows=5) if path.endswith(".csv") else pd.read_excel(path, nrows=5)
        df_full = pd.read_csv(path) if path.endswith(".csv") else pd.read_excel(path)
        file_schemas.append({
            "filename": filename,
            "columns": [{"name": col, "dtype": str(df_sample[col].dtype)} for col in df_sample.columns],
            "sample": df_sample.head(3).to_dict(orient="records"),
            "row_count": len(df_full),
        })

    schema_doc = _generate_schema_doc(description, json.dumps(file_schemas, ensure_ascii=False, indent=2))
    return {"files": file_paths}, schema_doc


async def _get_db_schema(conn_info: dict) -> str:
    db_type = conn_info.get("type", "").lower()

    if db_type == "sqlite":
        conn = duckdb.connect()
        conn.execute(f"ATTACH '{conn_info['database']}' AS db (TYPE sqlite)")
        tables = conn.execute("SELECT name FROM db.sqlite_master WHERE type='table'").fetchall()
        parts = []
        for (table,) in tables:
            cols = conn.execute(f"PRAGMA db.table_info({table})").fetchall()
            parts.append(f"表 {table}: " + ", ".join(f"{c[1]}({c[2]})" for c in cols))
        return "\n".join(parts)

    if db_type == "mysql":
        import pymysql
        conn = pymysql.connect(
            host=conn_info["host"], port=conn_info.get("port", 3306),
            user=conn_info["username"], password=conn_info["password"],
            database=conn_info["database"],
        )
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = [r[0] for r in cursor.fetchall()]
        parts = []
        for table in tables:
            cursor.execute(f"DESCRIBE `{table}`")
            cols = cursor.fetchall()
            cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
            count = cursor.fetchone()[0]
            parts.append(f"表 {table} [{count}行]: " + ", ".join(f"{c[0]}({c[1]})" for c in cols))
        conn.close()
        return "\n".join(parts)

    if db_type == "postgresql":
        import psycopg2
        conn = psycopg2.connect(
            host=conn_info["host"], port=conn_info.get("port", 5432),
            user=conn_info["username"], password=conn_info["password"],
            dbname=conn_info["database"],
        )
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = [r[0] for r in cursor.fetchall()]
        parts = []
        for table in tables:
            cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}'")
            cols = cursor.fetchall()
            parts.append(f"表 {table}: " + ", ".join(f"{c[0]}({c[1]})" for c in cols))
        conn.close()
        return "\n".join(parts)

    raise ValueError(f"不支持的数据库类型: {db_type}")


def _generate_schema_doc(user_description: str, schema_raw: str) -> str:
    prompt = f"""你是一个数据分析专家。根据以下信息，生成一份清晰的数据结构说明文档，供后续 AI 数据分析使用。

用户描述：
{user_description}

实际结构：
{schema_raw}

请生成包含以下内容的说明文档：
1. 数据源概述（业务背景）
2. 表/文件结构（字段说明、数据类型、含义）
3. 表间关系（如有）
4. 数据规模
5. 分析建议（可以做哪些典型分析）

用中文回答，格式清晰。"""

    return llm_chat(prompt)
