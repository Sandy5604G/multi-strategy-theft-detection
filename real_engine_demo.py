import cv2
import time
import os
from src.advanced_detector import AdvancedTheftDetector

def main():
    print("=" * 70)
    print("🚨 REAL DETECTION ENGINE DEMO")
    print("=" * 70)
    print("Loading your rewritten AdvancedTheftDetector...")
    
    detector = AdvancedTheftDetector()
    
    print("\n1. Real-time Camera")
    print("q. Quit")
    
    choice = input("\nChoose option (1 or q): ").strip().lower()
    
    if choice == '1':
        run_realtime_camera(detector)
    elif choice == 'q':
        print("Exiting.")
    else:
        print("Invalid choice.")

def run_realtime_camera(detector):
    print("\n📷 Starting real-time camera with NEW engine...")
    print("Press 'q' to stop.")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Could not open camera.")
        return
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Call YOUR rewritten advanced_detector.py
        processed_frame, alerts = detector.process_frame(frame)
        
        # Print alerts to terminal
        if alerts and 'theft_detections' in alerts:
            for detection in alerts['theft_detections']:
                print(f"🚨 REAL ALERT: {detection['type']} (ID: {detection['person_id']}) - {detection['confidence']:.2f}")
        
        cv2.imshow("Real Detection Engine", processed_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Camera feed closed.")

if __name__ == "__main__":
    main()
