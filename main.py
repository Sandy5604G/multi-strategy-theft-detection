import os
import cv2
import argparse
from src.detector import TheftDetector

def main():
    parser = argparse.ArgumentParser(description='Theft Detection System')
    parser.add_argument('--input', type=str, help='Input video file')
    parser.add_argument('--live', action='store_true', help='Use live camera')
    args = parser.parse_args()
    
    detector = TheftDetector()
    
    if args.live:
        print("Starting live camera detection...")
        cap = cv2.VideoCapture(0)
    elif args.input:
        print(f"Processing video: {args.input}")
        cap = cv2.VideoCapture(args.input)
    else:
        print("Please specify --input <file> or --live")
        return
    
    if not cap.isOpened():
        print("Error: Could not open video source")
        return
    
    print("Press 'q' to quit, 'r' to reset detector")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame")
            break
            
        processed_frame, alerts = detector.process_frame(frame)
        
        cv2.imshow('Theft Detection', processed_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            detector.reset_state()
            print("Detector reset")
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
