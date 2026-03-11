"""
ตัวอย่าง ETL DAG: Extract → Transform → Load → Notify

รันทุกวัน 06:00 UTC
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator


default_args = {
    "owner": "data-team",
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="daily_sales_etl",
    default_args=default_args,
    description="Daily sales data ETL pipeline",
    schedule="0 6 * * *",  # ทุกวัน 06:00 UTC
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["etl", "sales"],
) as dag:

    def extract(**context):
        """ดึงข้อมูลจาก source (API, DB, CSV)"""
        print("Extracting sales data...")
        # แทนที่ด้วย: requests.get(), psycopg2.connect(), pandas.read_csv()
        data = [
            {"id": 1, "product": "A", "amount": 100, "date": "2026-03-11"},
            {"id": 2, "product": "B", "amount": 200, "date": "2026-03-11"},
            {"id": 3, "product": "A", "amount": 150, "date": "2026-03-11"},
        ]
        # ส่งข้อมูลผ่าน XCom ให้ task ถัดไป
        context["ti"].xcom_push(key="raw_data", value=data)
        return f"Extracted {len(data)} records"

    def transform(**context):
        """แปลงข้อมูล: aggregate, clean, validate"""
        raw_data = context["ti"].xcom_pull(key="raw_data", task_ids="extract")
        print(f"Transforming {len(raw_data)} records...")

        # aggregate by product
        summary = {}
        for row in raw_data:
            product = row["product"]
            summary[product] = summary.get(product, 0) + row["amount"]

        result = [{"product": k, "total": v} for k, v in summary.items()]
        context["ti"].xcom_push(key="transformed_data", value=result)
        return f"Transformed to {len(result)} products"

    def load(**context):
        """โหลดเข้า destination (DB, data warehouse, S3)"""
        data = context["ti"].xcom_pull(key="transformed_data", task_ids="transform")
        print(f"Loading {len(data)} records...")
        for row in data:
            print(f"  INSERT: product={row['product']}, total={row['total']}")
        # แทนที่ด้วย: INSERT INTO, S3 upload, BigQuery load
        return f"Loaded {len(data)} records"

    extract_task = PythonOperator(task_id="extract", python_callable=extract)
    transform_task = PythonOperator(task_id="transform", python_callable=transform)
    load_task = PythonOperator(task_id="load", python_callable=load)
    notify_task = BashOperator(
        task_id="notify",
        bash_command='echo "ETL pipeline completed at $(date)"',
    )

    # DAG flow: extract → transform → load → notify
    extract_task >> transform_task >> load_task >> notify_task
