import os
import sys
import asyncio
import json
import time
import cv2
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add project root to sys.path to import src.advanced_detector
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(ROOT_DIR)

# Initialize Real Engine AdvancedTheftDetector (YOLOv8 + MediaPipe Pose)
detector_engine = None
try:
    from src.advanced_detector import AdvancedTheftDetector
    detector_engine = AdvancedTheftDetector()
    print("⚡ Real AI Engine AdvancedTheftDetector loaded successfully into FastAPI backend!")
except Exception as e:
    print(f"⚠️ Could not load AdvancedTheftDetector: {e}")

app = FastAPI(
    title="AEGIS Guard Theft Detection Portal API",
    description="Enterprise API supporting React Frontend + WebSocket frame streaming + YOLOv8 Detection Engine",
    version="2.4.0"
)

# Mount local /home/sandeep/theft-detection/data folder to serve demo videos
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
if os.path.exists(DATA_DIR):
    app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# Enable CORS for local network & Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_USERS = [
    {"id": "usr-001", "username": "admin", "fullName": "Sandeep Sharma (Lead Security)", "role": "Admin", "email": "sandeep@aegis-retail.com", "department": "Executive Security", "status": "Active"},
    {"id": "usr-002", "username": "security_lead", "fullName": "Vikram Singh", "role": "Security Staff", "email": "vikram.s@aegis-retail.com", "department": "Floor Patrol Aisle 3-7", "status": "Active"},
    {"id": "usr-003", "username": "manager_store", "fullName": "Ananya Roy", "role": "Viewer", "email": "ananya.r@aegis-retail.com", "department": "Store Operations", "status": "Active"}
]

MOCK_CONFIG = {
    "yoloConfidenceThreshold": 0.50,
    "poseDetectionThreshold": 0.65,
    "crouchTimeLimitSeconds": 15,
    "concealmentCooldownSeconds": 3,
    "consecutiveFrameConfirmation": 4,
    "autoEscalateThreshold": 0.92,
    "soundAlertsEnabled": True
}

MOCK_ALERTS = []
MOCK_CAMERAS = []

class LoginRequest(BaseModel):
    username: str
    password: str

class AlertStatusUpdate(BaseModel):
    status: str
    notes: str = ""

class CameraCreate(BaseModel):
    name: str
    zone: str = "General"
    url: str = ""
    type: str = "RTSP Stream"
    videoSource: str = "/data/demo_shoplifting.mp4"
    model: str = "YOLOv8s"

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "AEGIS Guard API v2.4",
        "backend": "FastAPI + YOLOv8 MediaPipe Engine",
        "engine_active": detector_engine is not None
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = next((u for u in MOCK_USERS if u["username"] == req.username), MOCK_USERS[0])
    return {
        "access_token": f"jwt-enterprise-token-{int(time.time())}",
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/alerts")
def get_alerts():
    return MOCK_ALERTS

@app.patch("/api/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, payload: AlertStatusUpdate):
    for a in MOCK_ALERTS:
        if a["id"] == alert_id:
            a["status"] = payload.status
            if payload.notes:
                a["notes"] = payload.notes
            return a
    raise HTTPException(status_code=404, detail="Alert not found")

@app.get("/api/config")
def get_config():
    return MOCK_CONFIG

@app.put("/api/config")
def update_config(new_cfg: Dict[str, Any]):
    global MOCK_CONFIG
    MOCK_CONFIG.update(new_cfg)
    return MOCK_CONFIG

@app.get("/api/users")
def get_users():
    return MOCK_USERS

@app.get("/api/cameras")
def get_cameras():
    return MOCK_CAMERAS

@app.post("/api/cameras")
def add_camera(cam: CameraCreate):
    new_cam = {
        "id": f"cam-0{len(MOCK_CAMERAS) + 1}",
        "name": cam.name,
        "zone": cam.zone,
        "url": cam.url,
        "type": cam.type,
        "videoSource": cam.videoSource,
        "status": "ONLINE",
        "fps": 30,
        "activeAlerts": 0,
        "alertType": "NORMAL",
        "alertText": "ID #105 | NORMAL 97%",
        "roiName": f"CRITICAL ROI ZONE: {cam.zone.upper()}",
        "model": "YOLOv8 + MediaPipe Pose"
    }
    MOCK_CAMERAS.append(new_cam)
    return MOCK_CAMERAS

@app.post("/api/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    save_path = os.path.join(DATA_DIR, f"uploaded_{int(time.time())}_{file.filename}")
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    detected_alerts = []
    if detector_engine:
        cap = cv2.VideoCapture(save_path)
        frame_idx = 0
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_idx += 1
            if frame_idx % 3 == 0:  # Sample frames
                _, alerts = detector_engine.process_frame(frame)
                if alerts and 'theft_detections' in alerts:
                    for det in alerts['theft_detections']:
                        alt = {
                            "id": f"alt-real-{int(time.time())}-{frame_idx}",
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "cameraName": f"Uploaded Video: {file.filename}",
                            "cameraId": "file-upload",
                            "alertType": det.get("type", "SHOPLIFTING"),
                            "severity": "CRITICAL",
                            "confidence": float(det.get("confidence", 0.92)),
                            "trackedPersonId": f"Person #{det.get('person_id', '101')}",
                            "status": "UNACKNOWLEDGED",
                            "notes": det.get("message", "Real AI Detection engine flagged suspicious posture.")
                        }
                        detected_alerts.append(alt)
                        MOCK_ALERTS.insert(0, alt)
        cap.release()

    return {
        "status": "SUCCESS",
        "filename": file.filename,
        "alerts_found": len(detected_alerts),
        "alerts": detected_alerts
    }

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
            payload = json.dumps({
                "type": "HEARTBEAT",
                "fps": 30,
                "timestamp": time.time()
            })
            await websocket.send_text(payload)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
