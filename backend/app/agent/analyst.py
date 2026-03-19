import json
import os
from typing import AsyncGenerator
import duckdb
import pandas as pd
import pymysql
import psycopg2

from app.models.datasource import DataSourceType
from app.agent.llm_client import run_agent_loop

SYSTEM_PROMPT = """你是一个专业的数据分析助手，可以通过执行 SQL 来分析数据。

分析流程：
1. 理解用户问题
2. 根据数据结构说明制定查询计划
3. 执行 SQL 获取数据
4. 分析结果，给出清晰的中文回答和洞察

注意：结果要有分析和洞察，不只是列数据。"""


async def run_analysis(
    message: str,
    ds_type: DataSourceType,
    connection_info: dict,
    schema_doc: str,
) -> AsyncGenerator[str, None]:
    system = f"{SYSTEM_PROMPT}\n\n## 数据源结构说明\n\n{schema_doc}"

    def tool_executor(sql: str) -> str:
        try:
            return _execute_sql(sql, ds_type, connection_info)
        except Exception as e:
            return f"执行错误: {e}"

    for chunk in run_agent_loop(system, message, tool_executor):
        yield chunk


def _execute_sql(sql: str, ds_type: DataSourceType, connection_info: dict) -> str:
    if ds_type == DataSourceType.file:
        return _execute_on_files(sql, connection_info.get("files", []))
    return _execute_on_database(sql, connection_info)


def _execute_on_files(sql: str, file_paths: list[str]) -> str:
    conn = duckdb.connect()
    for path in file_paths:
        table_name = os.path.splitext(os.path.basename(path))[0]
        if path.endswith(".csv"):
            conn.execute(f"CREATE VIEW \"{table_name}\" AS SELECT * FROM read_csv_auto('{path}')")
        else:
            conn.execute(f"CREATE VIEW \"{table_name}\" AS SELECT * FROM read_excel('{path}')")
    return _df_to_text(conn.execute(sql).df())


def _execute_on_database(sql: str, conn_info: dict) -> str:
    db_type = conn_info.get("type", "").lower()

    if db_type == "mysql":
        conn = pymysql.connect(
            host=conn_info["host"], port=conn_info.get("port", 3306),
            user=conn_info["username"], password=conn_info["password"],
            database=conn_info["database"],
        )
        cursor = conn.cursor()
        cursor.execute(sql)
        df = pd.DataFrame(cursor.fetchall(), columns=[d[0] for d in cursor.description])
        conn.close()
        return _df_to_text(df)

    if db_type == "postgresql":
        conn = psycopg2.connect(
            host=conn_info["host"], port=conn_info.get("port", 5432),
            user=conn_info["username"], password=conn_info["password"],
            dbname=conn_info["database"],
        )
        cursor = conn.cursor()
        cursor.execute(sql)
        df = pd.DataFrame(cursor.fetchall(), columns=[d[0] for d in cursor.description])
        conn.close()
        return _df_to_text(df)

    if db_type == "sqlite":
        conn = duckdb.connect()
        conn.execute(f"ATTACH '{conn_info['database']}' AS db (TYPE sqlite)")
        return _df_to_text(conn.execute(sql).df())

    raise ValueError(f"不支持的数据库类型: {db_type}")


def _df_to_text(df: pd.DataFrame) -> str:
    if df.empty:
        return "查询结果为空"
    if len(df) > 100:
        return f"共 {len(df)} 行，显示前 100 行：\n{df.head(100).to_markdown(index=False)}"
    return df.to_markdown(index=False)
