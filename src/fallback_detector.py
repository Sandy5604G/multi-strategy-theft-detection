import cv2
import numpy as np
import random
from datetime import datetime

class FallbackTheftDetector:
    """
    Fallback detector that provides basic theft detection
    without mediapipe dependencies for testing
    """
    
    def __init__(self):
        print("🚀 Fallback Theft Detector Initialized")
        self.detection_count = 0
        self.strategies = [
            'suspicious_movement', 
            'object_concealment', 
            'crowd_behavior'
        ]
        
    def process_frame(self, frame):
        """Process frame with fallback detection logic"""
        height, width = frame.shape[:2]
        alerts = {}
        
        # Basic visual feedback
        cv2.rectangle(frame, (50, 50), (width-50, height-50), (0, 255, 0), 2)
        cv2.putText(frame, "FALLBACK DETECTOR ACTIVE", (60, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f"Detections: {self.detection_count}", (width-200, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        # Simulate realistic theft detections (12% chance per frame)
        if random.random() > 0.88:
            self.detection_count += 1
            detection_type = random.choice(self.strategies)
            confidence = round(random.uniform(0.65, 0.92), 2)
            
            # Context-aware messages
            messages = {
                'suspicious_movement': 'Rapid movement near products detected',
                'object_concealment': 'Item concealment behavior observed', 
                'crowd_behavior': 'Suspicious crowd gathering detected'
            }
            
            alerts['theft_detections'] = [{
                'type': detection_type,
                'confidence': confidence,
                'message': messages.get(detection_type, 'Theft pattern detected'),
                'timestamp': datetime.now().strftime("%H:%M:%S")
            }]
            
            # Visual alert
            cv2.putText(frame, f"ALERT: {detection_type.upper()}", (60, 110), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            cv2.putText(frame, f"Confidence: {confidence:.1%}", (60, 130), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        
        return frame, alerts
