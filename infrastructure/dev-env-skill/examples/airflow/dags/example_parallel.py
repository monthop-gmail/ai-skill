"""
ตัวอย่าง Parallel DAG: ดึงข้อมูลจากหลาย source พร้อมกัน → รวม → report

รันทุกวันจันทร์ 08:00 UTC
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator


default_args = {
    "owner": "data-team",
    "retries": 2,
    "retry_delay": timedelta(minutes=3),
}

with DAG(
    dag_id="weekly_multi_source_report",
    default_args=default_args,
    description="Fetch from multiple sources in parallel then merge",
    schedule="0 8 * * 1",  # ทุกวันจันทร์ 08:00 UTC
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["report", "parallel"],
) as dag:

    def fetch_from_api(**context):
        print("Fetching from API...")
        context["ti"].xcom_push(key="api_data", value={"source": "api", "rows": 100})

    def fetch_from_db(**context):
        print("Fetching from Database...")
        context["ti"].xcom_push(key="db_data", value={"source": "db", "rows": 500})

    def fetch_from_s3(**context):
        print("Fetching from S3...")
        context["ti"].xcom_push(key="s3_data", value={"source": "s3", "rows": 200})

    def merge_and_report(**context):
        ti = context["ti"]
        api = ti.xcom_pull(key="api_data", task_ids="fetch_api")
        db = ti.xcom_pull(key="db_data", task_ids="fetch_db")
        s3 = ti.xcom_pull(key="s3_data", task_ids="fetch_s3")

        total = api["rows"] + db["rows"] + s3["rows"]
        print(f"Merged {total} rows from 3 sources")
        print(f"  API: {api['rows']}, DB: {db['rows']}, S3: {s3['rows']}")
        return f"Report generated: {total} total rows"

    fetch_api = PythonOperator(task_id="fetch_api", python_callable=fetch_from_api)
    fetch_db = PythonOperator(task_id="fetch_db", python_callable=fetch_from_db)
    fetch_s3 = PythonOperator(task_id="fetch_s3", python_callable=fetch_from_s3)
    merge = PythonOperator(task_id="merge_and_report", python_callable=merge_and_report)

    # DAG flow: 3 fetch tasks พร้อมกัน → merge
    [fetch_api, fetch_db, fetch_s3] >> merge
