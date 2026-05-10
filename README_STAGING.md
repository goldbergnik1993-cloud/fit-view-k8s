# 📊 Fit-View Staging: Monitoring & Analytics

This setup launches the core application along with a full monitoring stack (**Prometheus**, **Grafana**, and **cAdvisor**). The dashboard is pre-configured to work out-of-the-box on both Linux servers and **macOS (Docker Desktop)**.

---

## 🚀 Quick Start

To build the project and launch all monitoring services, run the following command from the root directory:

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
```

---

## 📈 Service Access


| Service | URL | Credentials |
| :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | **User:** `admin` / **Pass:** `admin` |
| **Prometheus** | `http://localhost:9090` | Metrics Database |
| **cAdvisor** | `http://localhost:8081` | Raw Container Stats |

---

## 🛠 Using the Monitoring Stack

1. **Access Dashboards:** Open **Grafana** at `http://localhost:3000`.
2. **Locate Dashboard:** Navigate to **Dashboards** in the left sidebar and select the pre-configured **"Docker monitoring"** dashboard.
3. **Automatic Setup:** No manual import is required. The dashboard is loaded automatically on startup via Grafana Provisioning.

---

## ⚙️ Configuration Details

The project is designed to be "plug-and-play" using the following directory structure:

* **Automatic Import:** Dashboards are loaded from `./monitoring/grafana/dashboards/`.
* **Data Source:** Prometheus is connected automatically via `./monitoring/grafana/provisioning/datasources/`.
* **macOS Fix:** Custom PromQL queries are used (filtering by `Container ID` instead of `Image Name`) to ensure data visibility on Docker Desktop for Mac.

---

## 🛑 Shutdown & Cleanup

To stop all staging services and remove containers:

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml down
```
