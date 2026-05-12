# 🚀 FitView K8s

**Enterprise-grade Fullstack Ecosystem: FastAPI, React, and Celery orchestrated by Kubernetes.**

This repository contains a high-performance fitness platform architecture featuring a distributed task queue, automated CI/CD pipelines, and cloud-native deployment manifests using Helm.

---

## 🔗 Project Resources


| Resource | Link | Description |
| :--- | :--- | :--- |
| **Jira Board** | [Project Tasks](https://fitsview.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog) | Task management and backlog |
| **Confluence** | [Project Wiki](https://dariachernyshenko920.atlassian.net/wiki/spaces/FitView/overview?homepageId=196722) | Technical documentation and specifications |

---

## 🛠 Technical Stack

### **Core Engine**
*   **Backend:** `Python 3.12` | `FastAPI` (Asynchronous) | `Poetry`
*   **Frontend:** `React` | `Vite` | `TypeScript` (Node 22)
*   **Database:** `PostgreSQL` + `SQLAlchemy 2.0` (Async) | `Alembic`
*   **Task Processing:** `Celery` + `Redis 7` + `Celery Beat`

### **Infrastructure & DevOps**
*   **Orchestration:** `Kubernetes` (Helm Charts) | `Docker Compose`
*   **Monitoring Stack:** `Prometheus`, `Grafana`, `cAdvisor` (Staging environment)
*   **Gateway:** `Nginx` (Reverse Proxy & Static serving)
*   **CI/CD:** GitHub Actions with reusable workflows.

---

## 🏗 CI/CD Pipeline Architecture
The project implements a strict automated workflow defined in `.github/workflows`:

### **1. Quality Control & Docker Build (`ci.yml`)**
Triggered on push/PR to `main`. It uses a matrix strategy for parallel execution:
*   **Python Quality:** `Ruff` (linting/formatting), `MyPy` (type checking) in a Poetry environment.
*   **Node Quality:** `ESLint` and Production Build verification.
*   **Docker Security:** `Hadolint` for Dockerfile best practices and `Trivy` for vulnerability scanning.
*   **Multi-arch Builds:** Builds and pushes `amd64/arm64` images to Docker Hub (`goldbernik/fitview-*`).

### **2. Continuous Deployment (`deploy-stage.yml`)**
*   **Staging:** Automated deployment triggered after a successful build on the `main` branch.
*   **Helm Verification:** Automated chart linting and dry-runs to ensure K8s manifest validity.
*   **Secrets:** Managed via GitHub Environment Secrets for the staging environment.

---

## 📁 Project Structure

```text
├── .github/workflows/      # CI/CD: Quality Control & Deployment
├── client/                 # Frontend: React source code (Node 22)
├── server/                 # Backend: FastAPI & Celery logic (Poetry)
├── k8s/fitview-chart/      # K8s: Helm charts for local/cloud deployment
├── monitoring/             # Observability: Prometheus & Grafana configs
├── docker-compose.yml      # Dev: Standard local development stack
├── docker-compose.staging.yml # Staging: Local stack + Monitoring (cAdvisor, etc.)
└── nginx.conf              # Gateway: Nginx configuration
```

---

## 🚦 Getting Started

### **1. Environment Setup**
Initialize your local environment variables:
```bash
cp .env.sample .env
```

### **2. Local Development (Docker Compose)**
Standard stack (API, Client, DB, Redis, Workers):
```bash
docker-compose up --build
```

### **3. Staging Simulation (with Monitoring)**
To test the full stack including **Prometheus, Grafana, and cAdvisor**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build
```

### **4. Kubernetes Local Deployment (Helm)**
Designed for local testing and future production scaling:
```bash
cd k8s/fitview-chart
helm install fitview . -f values.yaml
```

---

## 🔗 Infrastructure Map (Local)


| Service | Access URL | Technical Purpose |
| :--- | :--- | :--- |
| **Main Entry** | http://localhost | Nginx Gateway |
| **API Docs** | http://localhost:8000/docs | Swagger UI (FastAPI) |
| **Flower** | http://localhost:5555 | Celery Monitoring |
| **MailHog** | http://localhost:8025 | SMTP Sandbox |
| **Grafana** | http://localhost:3000 | Infrastructure Metrics (Staging only) |

---

## ⚙️ Development Standards
*   **Branch Protection:** Direct pushes to `main` are restricted. All changes must pass the CI Quality Control.
*   **Database Migrations:** Automatically applied on backend startup via `alembic upgrade head`.
*   **Async Performance:** Non-blocking database operations using the `asyncpg` driver.
