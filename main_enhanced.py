import cv2
import argparse
import os
from src.advanced_detector import AdvancedTheftDetector

def main():
    parser = argparse.ArgumentParser(description='Enhanced Theft Detection System')
    parser.add_argument('--input', type=str, help='Input video file for testing')
    parser.add_argument('--live', action='store_true', help='Use live camera')
    parser.add_argument('--demo', action='store_true', help='Run demonstration mode')
    args = parser.parse_args()
    
    detector = AdvancedTheftDetector()
    
    if args.demo:
        # Run the reviewer demonstration
        import reviewer_demo
        reviewer_demo.reviewer_demonstration()
        return
    
    if args.live:
        print("Starting LIVE theft detection...")
        print("Detection Types: Shoplifting, Pickpocketing, Bag Snatching, Suspicious Behavior")
        cap = cv2.VideoCapture(0)
    elif args.input:
        print(f"Processing: {args.input}")
        cap = cv2.VideoCapture(args.input)
    else:
        print("Please specify --input, --live, or --demo")
        return
    
    print("\nDETECTION LEGEND:")
    print("🟢 GREEN: Normal behavior")
    print("🔴 RED: Theft detected")
    print("🔵 BLUE: Products")
    print("🟠 ORANGE: Bags")
    print("Press 'q' to quit, 'r' to reset detector")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        processed_frame, alerts = detector.process_frame(frame)
        cv2.imshow('Enhanced Theft Detection System', processed_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            detector.reset_state()
            print("Detector state reset.")

    cap.release()
    cv2.destroyAllWindows()
    print("Application closed.")

if __name__ == "__main__":
    # Define placeholder constants if they don't exist yet
    try:
        from src.config import PERSON_CLASS_ID, BAG_CLASS_ID, PRODUCT_CLASSES, PRODUCT_PROXIMITY_PIXELS, VELOCITY_THRESHOLD, LEFT_SHOULDER_IDX, RIGHT_SHOULDER_IDX, LEFT_HIP_IDX, RIGHT_HIP_IDX, LEFT_WRIST_IDX, RIGHT_WRIST_IDX, NORMALIZED_HEIGHT_RATIO_THRESHOLD, YOLO_MODEL_NAME
    except ImportError:
        # Placeholder definitions for running the demo code
        class Config:
            PERSON_CLASS_ID = 0 
            BAG_CLASS_ID = 24    
            PRODUCT_CLASSES = [39, 41, 46] 
            PRODUCT_PROXIMITY_PIXELS = 150
            VELOCITY_THRESHOLD = 50.0
            LEFT_SHOULDER_IDX = 11
            RIGHT_SHOULDER_IDX = 12
            LEFT_HIP_IDX = 23
            RIGHT_HIP_IDX = 24
            LEFT_WRIST_IDX = 15
            RIGHT_WRIST_IDX = 16
            NORMALIZED_HEIGHT_RATIO_THRESHOLD = 0.5
            YOLO_MODEL_NAME = 'yolov8n.pt'
            
        # Temporarily update the global scope with necessary constants
        # This replaces globals().update(Config.__dict__) from before for safety
        globals().update({k: v for k, v in Config.__dict__.items() if not k.startswith('__')})
        
    main()
