# src/detector.py
import cv2
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
from src.config import *
import time

class TheftDetector:
    def __init__(self):
        self.initialize_models()
        self.reset_state()

    def initialize_models(self):
        try:
            self.model_yolo = YOLO(YOLO_MODEL_NAME)
            print("YOLO model loaded successfully")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            self.model_yolo = None

        self.mp_pose = mp.solutions.pose
        self.pose_model = self.mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
        self.mp_drawing = mp.solutions.drawing_utils

    def reset_state(self):
        self.frame_count = 0
        self.fps = 0
        self.prev_time = time.time()

    def process_frame(self, frame):
        self.frame_count += 1
        
        # Calculate FPS
        current_time = time.time()
        if current_time - self.prev_time >= 1.0:
            self.fps = self.frame_count
            self.frame_count = 0
            self.prev_time = current_time
        
        alerts = {}
        processed_frame = frame.copy()
        
        if self.model_yolo:
            try:
                # Run YOLO inference
                results = self.model_yolo(frame, verbose=False)
                
                # Process results
                for result in results:
                    boxes = result.boxes
                    if boxes is not None and len(boxes) > 0:
                        alerts = {'objects_detected': len(boxes)}
                        
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            conf = box.conf[0].cpu().numpy()
                            cls = int(box.cls[0].cpu().numpy())
                            
                            # Draw bounding box
                            color = (0, 255, 0)  # Green
                            if cls == PERSON_CLASS_ID:
                                color = (0, 255, 0)  # Green for person
                            elif cls == BAG_CLASS_ID:
                                color = (0, 0, 255)  # Red for bag
                            elif cls in PRODUCT_CLASSES:
                                color = (255, 0, 0)  # Blue for products
                            
                            cv2.rectangle(processed_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                            
                            # Draw label
                            label = f"{cls}: {conf:.2f}"
                            cv2.putText(processed_frame, label, (int(x1), int(y1)-10), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
            except Exception as e:
                print(f"Detection error: {e}")
        
        # Draw info on frame
        cv2.putText(processed_frame, f"FPS: {self.fps}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(processed_frame, f"Alerts: {len(alerts)}", (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return processed_frame, alerts
