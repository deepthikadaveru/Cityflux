# 🚦 CityFLUX

CityFLUX is a **full-stack AI-powered urban vehicle intelligence platform** built for **Smart India Hackathon 2026 – Problem Statement 26127**.

It connects multi-camera video feeds, vehicle detection and tracking, ANPR/OCR, cross-camera vehicle correlation, GIS trajectory reconstruction, traffic analytics, and security alerts into a unified command-center experience.

---

## 🛠️ Tech Stack

**AI / Computer Vision**
- YOLO for vehicle and plate detection
- OpenCV for video processing and plate preprocessing
- PaddleOCR for automatic number plate text extraction
- ByteTrack-compatible architecture for local vehicle tracking
- Multi-frame plate consensus and plate normalization

**Backend**
- Python
- FastAPI REST API
- WebSockets for real-time events
- SQLAlchemy
- PostgreSQL / PostGIS architecture
- SQLite support for local/demo configurations

**Frontend**
- React + TypeScript
- Vite
- MapLibre for GIS visualization
- Recharts for traffic analytics
- Responsive command-center interface

**Deployment & Tools**
- Docker
- Docker Compose
- Git & GitHub
- YAML-based camera configuration
- Environment variables for configuration and secrets

---

## ✨ Features

- 🎥 **Multi-Camera Monitoring** → View multiple camera feeds simultaneously
- 🚗 **Vehicle Detection & Tracking** → Detect vehicles and maintain local track identities
- 🔍 **ANPR / OCR** → Detect and recognize vehicle number plates
- 🔗 **Cross-Camera Correlation** → Associate observations from different cameras
- 🆔 **Global Vehicle ID** → Connect multiple observations to the same vehicle journey
- 🗺️ **GIS Trajectory Tracking** → Visualize vehicle movement across camera locations
- 📊 **Traffic Analytics** → Density, speed, flow, congestion and OD analysis
- 🚨 **Security Intelligence** → Blacklist, speed, direction and impossible-travel alerts
- ⚡ **Real-Time Events** → WebSocket-based event updates
- 📡 **Camera Health Monitoring** → Monitor camera/system status
- 🔐 **Audit & Access Foundations** → Structured event and alert lifecycle with audit logging
- 🧪 **Evaluation Tooling** → Benchmark and testing scripts for ANPR, APIs and trajectory logic
- 🐳 **Docker Support** → Containerized deployment for the complete stack

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/cityflux.git
cd cityflux
```

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
```

**Windows**

```powershell
.venv\Scripts\activate
```

**Linux / macOS**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🐳 Docker Setup

Build and start the full application:

```bash
docker compose up --build
```

Stop the services:

```bash
docker compose down
```

---

## 📂 Folder Structure

```text
cityflux/
│
├── backend/                       # FastAPI backend
│   ├── app/
│   │   ├── api/                  # REST and WebSocket routes
│   │   ├── core/                 # Configuration and database
│   │   ├── models/               # SQLAlchemy data models
│   │   ├── schemas/              # API schemas
│   │   └── services/             # Backend services
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                      # React + TypeScript command center
│   ├── src/
│   │   ├── App.tsx               # Main application shell
│   │   ├── main.tsx              # Frontend entry point
│   │   └── styles.css             # Global styling
│   ├── package.json
│   └── vite.config.ts
│
├── vision/                        # Computer vision pipeline
│   ├── detection/                 # YOLO detection
│   ├── tracking/                  # ByteTrack adapter
│   ├── preprocessing/             # Plate preprocessing
│   ├── ocr/                       # PaddleOCR and fusion
│   └── pipelines/                # ANPR pipeline
│
├── trajectory/                    # Cross-camera trajectory logic
├── analytics/                     # Urban traffic analytics
├── alerts/                        # Security and anomaly logic
├── data/
│   └── demo/
│       ├── camera_config.yaml      # Demo camera configuration
│       ├── reference.jpeg         # Demo reference image
│       ├── ground_truth/           # Evaluation annotations
│       └── videos/                 # Demo camera recordings
│
├── database/                      # Database configuration/schema
├── scripts/                       # Demo and processing scripts
├── docs/                          # Documentation
├── infrastructure/               # Deployment configuration
├── models/                       # Model documentation/weights location
├── docker-compose.yml
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🧠 System Workflow

```text
Camera / MP4 / RTSP
        ↓
Video Ingestion
        ↓
Vehicle Detection
        ↓
Local Vehicle Tracking
        ↓
Plate Detection
        ↓
Plate Preprocessing
        ↓
ANPR / OCR
        ↓
Plate Normalization & Validation
        ↓
Canonical Vehicle Event
        ↓
Cross-Camera Correlation
        ↓
Global Vehicle ID
        ↓
Trajectory Reconstruction
        ↓
┌─────────────────────┬─────────────────────┐
│                     │                     │
▼                     ▼                     ▼
Trajectory        Traffic Analytics    Security Alerts
│                     │                     │
└─────────────────────┴─────────────────────┘
                      ↓
               Command Center
```

---

## 🏗️ Architecture

```text
                         CITYFLUX
                            │
              ┌─────────────┴─────────────┐
              │                           │
        CAMERA / VIDEO              REFERENCE DATA
        MP4 / RTSP                  GIS / WATCHLIST
              │                           │
              └─────────────┬─────────────┘
                            ↓
                    VIDEO INGESTION
                            ↓
                VEHICLE + PLATE DETECTION
                            ↓
                         TRACKING
                            ↓
                       ANPR / OCR
                            ↓
                  CANONICAL VEHICLE EVENT
                            ↓
                CROSS-CAMERA CORRELATION
                            ↓
                    GLOBAL VEHICLE ID
                            ↓
             SPATIAL-TEMPORAL TRAJECTORY
                            │
                   ┌────────┴────────┐
                   │                 │
                   ▼                 ▼
              TRAJECTORY        URBAN ANALYTICS
                   │                 │
                   │          ┌──────┼──────┐
                   │          │      │      │
                   │          ▼      ▼      ▼
                   │       Density  OD   Congestion
                   │
                   └─────────┬──────────────┐
                             │              │
                             ▼              ▼
                       SECURITY        ALERT ENGINE
                     INTELLIGENCE           │
                             └──────┬───────┘
                                    ↓
                             FASTAPI + WS
                                    ↓
                         REACT COMMAND CENTER
                                    ↓
                          MAPLIBRE + CHARTS
```

---

## 🖥️ Command Center

The CityFLUX frontend provides a unified operational interface with dedicated views for:

### 🎥 Multi-Camera Viewer

- 2×2 multi-camera monitoring
- Individual camera viewing
- Stream status
- Live vehicle events
- Camera management

### 🗺️ GIS Trajectory

- Vehicle search
- Global Vehicle ID
- Camera-to-camera route visualization
- Timeline of observations
- Travel distance and time
- Speed and route anomalies
- Predictive trajectory information

### 📊 Traffic Analytics

- Traffic density
- Average speed
- Hourly traffic trends
- Origin-Destination flows
- Congestion indicators
- Camera-level analytics

### 🚨 Security Alerts

- Blacklist/watchlist events
- Speed anomalies
- Direction anomalies
- Impossible-travel detection
- Alert acknowledgement and resolution

---

## 🔍 ANPR Pipeline

```text
Camera Frame
     ↓
Vehicle Detection
     ↓
Plate Localization
     ↓
Crop & Preprocessing
     ↓
CLAHE / Filtering
     ↓
OCR
     ↓
Text Fusion / Consensus
     ↓
Plate Normalization
     ↓
Confidence Validation
     ↓
Vehicle Event
```

The pipeline is intended to handle practical challenges such as:

- Motion blur
- Glare
- Low-light conditions
- Perspective distortion
- Dirty or partially visible plates
- OCR character confusion

---

## 🔗 Cross-Camera Trajectory Tracking

CityFLUX converts independent camera observations into a connected vehicle journey.

```text
CAM-01
   │
   │ Observation
   ▼
CAM-02
   │
   │ Observation
   ▼
CAM-03
   │
   │ Observation
   ▼
CAM-04
   │
   ▼
GLOBAL VEHICLE TRAJECTORY
```

Matching can use a combination of:

- Normalized plate
- Timestamp
- Camera topology
- Direction
- Geographic distance
- Travel-time feasibility
- Vehicle characteristics
- Optional appearance similarity

---

## 📊 Urban Traffic Analytics

The same event stream used for vehicle tracking can be aggregated into city-level traffic intelligence.

| Analytics | Purpose |
|---|---|
| **Density** | Identify areas with high vehicle concentration |
| **Speed** | Measure movement speed across cameras |
| **Flow** | Analyze vehicle movement through monitored corridors |
| **OD Matrix** | Understand origin-destination movement |
| **Congestion** | Identify potential bottlenecks |
| **Trends** | Analyze traffic patterns over time |

---

## 🚨 Alert Intelligence

CityFLUX can generate alerts from configurable rules and watchlists.

```text
Vehicle Event
      ↓
Rule Evaluation
      ↓
┌─────┼─────────┬──────────────┐
↓     ↓         ↓              ↓
Black- Speed   Direction   Impossible
list   Anomaly  Anomaly     Travel
↓     ↓         ↓              ↓
└─────┴─────────┴──────────────┘
              ↓
         Security Alert
```

Alerts support lifecycle states such as:

```text
NEW → ACKNOWLEDGED → RESOLVED
```

---

## 🌐 API Endpoints

### Cameras

```text
GET /api/cameras
GET /api/cameras/{camera_id}
```

### Events & Vehicles

```text
GET /api/events
GET /api/vehicles/search
GET /api/vehicles/{gid}/trajectory
GET /api/vehicles/live
```

### Alerts & Watchlists

```text
GET  /api/alerts
POST /api/alerts/{id}/acknowledge
POST /api/alerts/{id}/resolve
GET  /api/blacklist
```

### Traffic Analytics

```text
GET /api/analytics/summary
GET /api/traffic/density
GET /api/traffic/od
GET /api/traffic/congestion
GET /api/traffic/speed
GET /api/traffic/flow
GET /api/analytics/live
```

### System & Demo

```text
GET  /api/system/health
GET  /api/demo/status
POST /api/demo/start
POST /api/demo/stop
```

### Real-Time Events

```text
WebSocket /api/ws/events
```

---

## 🎬 Demo Data

The repository contains a controlled four-camera demonstration environment.

Typical demo assets:

```text
data/demo/
├── camera_config.yaml
├── reference.jpeg
├── ground_truth/
└── videos/
    ├── CAM_DEMO_01.mp4
    ├── CAM_DEMO_02.mp4
    ├── CAM_DEMO_03.mp4
    └── CAM_DEMO_04.mp4
```

The demo recordings are treated as **controlled demonstration camera feeds**, not real synchronized municipal CCTV.

Camera locations and other parameters are configurable in:

```text
data/demo/camera_config.yaml
```

Ground-truth data is intended for **evaluation**, not runtime vehicle identification.

---

## 🧪 Testing & Evaluation

CityFLUX includes testing and evaluation utilities for individual components.

```text
test_anpr_benchmark.py
test_anpr_real_pipeline.py
test_api.py
test_ocr.py
test_real_videos.py
test_trajectory.py
```

Benchmark result files include:

```text
anpr_benchmark_results.csv
anpr_real_benchmark.csv
```

> **Important:** Accuracy, latency and other performance claims should be reported from measured evaluation results for the relevant dataset, hardware and operating conditions.

---

## 🔐 Security & Configuration

Do not commit sensitive configuration or credentials.

The repository ignores common local files such as:

```text
.env
.env.*
*.key
*.pem
*.crt
*.db
*.sqlite
__pycache__/
node_modules/
```

Use an environment file for local configuration:

```text
.env.example
```

and keep actual secrets in:

```text
.env
```

---

## 📈 Production Deployment Direction

The current project is structured so that the local/demo environment can evolve toward a larger deployment.

Potential production components include:

```text
Camera Network
      ↓
GPU Inference Workers
      ↓
Kafka / Redis Streams
      ↓
PostgreSQL + PostGIS
      ↓
FastAPI Services
      ↓
React Command Center
```

Additional production considerations include:

- Centralized secrets management
- TLS
- Object storage for evidence
- Monitoring and observability
- Policy-controlled retention
- Role-based access
- Scalable GPU inference

---

## 💡 Key Innovation

Most individual components of the platform are established technologies.

The central CityFLUX contribution is their **integration into one intelligence pipeline**:

```text
CAMERA OBSERVATION
        ↓
VEHICLE INTELLIGENCE
        ↓
GLOBAL VEHICLE ID
        ↓
TRAJECTORY INTELLIGENCE
        ↓
┌───────────────┬────────────────┐
│               │                │
▼               ▼                ▼
TRAFFIC       SECURITY        ANOMALIES
ANALYTICS     INTELLIGENCE    & ALERTS
│               │                │
└───────────────┴────────────────┘
                ↓
         CITY-WIDE VIEW
                ↓
         COMMAND CENTER
```

> **Instead of asking only "What did this camera see?", CityFLUX asks "Where has this vehicle been, where is it going, and what can its movement tell us about the city?"**

---

## 🗺️ Demonstration Corridor

The supplied demonstration environment represents a configurable multi-camera corridor inspired by Hyderabad/Cyberabad road movement.

Example logical sequence:

```text
CAM-01
MGIT
  ↓
CAM-02
Gandipet
  ↓
CAM-03
Kokapet
  ↓
CAM-04
Narsingi
```

The corridor coordinates and camera metadata are configurable through the demo configuration rather than being hard-coded into the runtime pipeline.

---

## 🏆 Smart India Hackathon 2026

| Field | Details |
|---|---|
| **Competition** | Smart India Hackathon 2026 |
| **Problem Statement ID** | 26127 |
| **Solution** | CityFLUX |
| **Theme** | Smart Automation |
| **Category** | Software |
| **Focus** | Multi-Camera ANPR, Vehicle Trajectory Tracking & Urban Traffic Analytics |

---

## 👥 Team

**Team Cityflux**

Developed for **Smart India Hackathon 2026**.

---

## 📫 Connect

📧 Email: [deepthikadaveru@gmail.com](mailto:deepthikadaveru@gmail.com)

💼 LinkedIn: [Deepthi Kadaveru](https://www.linkedin.com/in/deepthi-kadaveru-83248933b/)

---

## 📜 Disclaimer

CityFLUX is a **prototype/research implementation** developed for Smart India Hackathon.

System accuracy, latency, scalability, privacy compliance, and operational suitability should be established through controlled evaluation and deployment-specific testing before production use.

---

<div align="center">

### 🚦 CITYFLUX

**Connect Cameras. Track Vehicles. Understand the City.**

**Smart India Hackathon 2026 • Problem Statement 26127**

</div>
