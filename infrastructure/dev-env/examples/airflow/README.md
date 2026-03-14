# Airflow Example

ตัวอย่าง Apache Airflow (DAG Scheduling & Data Pipeline) + Celery + PostgreSQL + Redis + CF Tunnel

## Airflow vs Temporal vs n8n

| | Airflow | Temporal | n8n |
|--|---------|---------|-----|
| **แนว** | DAG scheduling, Python | Code-first, durable | Low-code, drag & drop |
| **ภาษา** | Python | JS/Go/Java/Python | Visual UI |
| **Schedule** | cron ได้ดีมาก | ผ่าน code (`sleep`) | built-in schedule |
| **Parallel** | DAG auto-parallel | `Promise.all` | parallel node |
| **Monitoring** | DAG view, Gantt chart, logs | Event history, replay | execution list |
| **เหมาะกับ** | Data team, ETL, batch job | Dev team, business logic | ทีม non-dev, SaaS |

## Architecture

```
                    ┌─────────────────┐
CF Tunnel ────────►│ Webserver (:8080)│ ← UI: ดู DAGs, logs, trigger
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │   Scheduler      │ ← parse DAGs, สร้าง task instances
                    └────────┬────────┘
                             │ dispatch via Redis
                    ┌────────┴────────┐
                    │  Worker(s)       │ ← Celery worker ทำงานจริง
                    └────────┬────────┘
                             │
               ┌─────────────┼──────────────┐
               ▼             ▼              ▼
          PostgreSQL       Redis        DAGs folder
          (metadata)     (broker)     (Python files)
```

## Services

| Service | หน้าที่ |
|---------|--------|
| **webserver** | Web UI ดู DAGs, logs, trigger manual run |
| **scheduler** | Parse DAGs, schedule task instances |
| **worker** | Celery worker ทำงานจริง (scale ได้) |
| **db** | เก็บ metadata (DAG runs, task instances, connections) |
| **redis** | Celery message broker |

## ตัวอย่าง DAG 2 แบบ

### 1. Daily Sales ETL (sequential)

```
extract → transform → load → notify
```
- รันทุกวัน 06:00 UTC
- ดึงข้อมูล → แปลง → โหลดเข้า DB → แจ้งเตือน

### 2. Weekly Multi-Source Report (parallel)

```
fetch_api ─┐
fetch_db  ─┼─► merge_and_report
fetch_s3  ─┘
```
- รันทุกวันจันทร์ 08:00 UTC
- ดึงจาก 3 sources พร้อมกัน → รวม → สร้าง report

## โครงสร้าง

```
airflow/
├── docker-compose.yml
├── docker-compose.prd.yml
├── .env.example
├── .gitignore
└── dags/                          # วาง DAG files ตรงนี้
    ├── example_etl.py             # ETL pipeline
    └── example_parallel.py        # Parallel multi-source
```

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. สร้าง Fernet key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# ใส่ค่าที่ได้ใน .env → FERNET_KEY=xxxx

# 3. ใส่ CF_TUNNEL_TOKEN ใน .env

# 4. รัน
docker compose up -d

# 5. เข้าใช้งาน
#    https://airflow.dev.example.com
#    login: admin / admin
```

## CF Dashboard Setup

1. **Zero Trust → Networks → Tunnels** → Create Tunnel
2. ตั้งชื่อ เช่น `airflow-dev` → Copy Token
3. Add Public Hostname:
   - Subdomain: `airflow` / Domain: `dev.example.com`
   - Service: `http://airflow-webserver:8080`

## เพิ่ม DAG ใหม่

วางไฟล์ Python ใน `dags/` → Airflow auto-detect ภายใน 30 วินาที:

```python
# dags/my_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG("my_dag", schedule="@daily", start_date=datetime(2026, 1, 1)) as dag:

    def my_task():
        print("Hello from Airflow!")

    PythonOperator(task_id="hello", python_callable=my_task)
```

## Scale Worker

```bash
# PRD: 3 worker replicas
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d

# scale เฉพาะ worker
docker compose up -d --scale airflow-worker=5
```

## Connections & Variables

ตั้งค่าผ่าน Web UI หรือ CLI:

```bash
# เพิ่ม connection (เช่น Postgres)
docker compose exec airflow-webserver airflow connections add \
  --conn-type postgres \
  --conn-host db.example.com \
  --conn-login user \
  --conn-password pass \
  --conn-port 5432 \
  --conn-schema mydb \
  my_postgres

# เพิ่ม variable
docker compose exec airflow-webserver airflow variables set \
  api_key "sk-xxxx"
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prd.yml up -d
```
