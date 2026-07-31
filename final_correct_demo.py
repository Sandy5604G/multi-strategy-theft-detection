import cv2
import os
import time
import sys

# Auto-use virtualenv if mediapipe is not in current python environment
venv_python = os.path.join(os.path.dirname(__file__), "theft_detection_env", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python:
    try:
        import mediapipe
    except ImportError:
        os.execv(venv_python, [venv_python] + sys.argv)

from src.advanced_detector import AdvancedTheftDetector

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def print_header():
    clear_screen()
    print("=" * 70)
    print("REAL ENGINE THEFT DETECTION")
    print("=" * 70)
    print("1. PICKPOCKETING - Quick Detection (data/demo_pickpocketing.mp4)")
    print("2. SHOPLIFTING - Suspicious Browsing (data/demo_shoplifting.mp4)")
    print("3. BAG THEFT - Quick Snatch (data/demo_bag_snatching.mp4)")
    print("4. REAL-TIME CAMERA ANALYSIS (Live Camera)")
    print("q. Exit")
    print("=" * 70)

def process_video_stream(detector, video_source, title="AEGIS Theft Detector"):
    print(f"\n🎬 Opening stream: {video_source} (Press 'q' to stop)")
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"❌ Error: Cannot open video source '{video_source}'. Check file path or camera connection.")
        time.sleep(2)
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    delay = 1  # 1ms waitKey for maximum real-time fluid video playback speed

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("\n🔄 Stream finished.")
            break
            
        # Process frame through YOLOv8 + Pose algorithm
        processed_frame, alerts = detector.process_frame(frame)
        
        # Print alerts to terminal console
        if alerts and 'theft_detections' in alerts:
            for det in alerts['theft_detections']:
                print(f"🚨 REAL ALERT: {det.get('type', 'THEFT')} (ID {det.get('person_id', '1')}) - {det.get('confidence', 0):.2f}")
        
        try:
            cv2.imshow(title, processed_frame)
            if cv2.waitKey(delay) & 0xFF == ord('q'):
                break
        except cv2.error:
            # Fallback if running in headless environment without display
            time.sleep(0.03)

    cap.release()
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass
    input("\nPress Enter to return to main menu...")

def run_pickpocketing_demo(detector):
    video_path = os.path.join(os.path.dirname(__file__), "data", "demo_pickpocketing.mp4")
    process_video_stream(detector, video_path, title="REAL ENGINE - Pickpocketing Detection")

def run_shoplifting_demo(detector):
    video_path = os.path.join(os.path.dirname(__file__), "data", "demo_shoplifting.mp4")
    process_video_stream(detector, video_path, title="REAL ENGINE - Shoplifting Concealment Detection")

def run_bag_theft_demo(detector):
    video_path = os.path.join(os.path.dirname(__file__), "data", "demo_bag_snatching.mp4")
    process_video_stream(detector, video_path, title="REAL ENGINE - Bag Theft Detection")

def run_realtime_demo(detector):
    print("\n📷 REAL-TIME CAMERA (PRESS q TO STOP)")
    process_video_stream(detector, 0, title="REAL ENGINE - Live Camera Analysis")

def main():
    print("Loading REAL AdvancedTheftDetector AI engine (YOLOv8 + MediaPipe Pose)...")
    try:
        detector = AdvancedTheftDetector()
    except Exception as e:
        print(f"❌ Error loading detector: {e}")
        return
    
    while True:
        print_header()
        choice = input("\nChoose (1-4 or q): ").strip().lower()
        
        if choice == '1':
            run_pickpocketing_demo(detector)
        elif choice == '2':
            run_shoplifting_demo(detector)
        elif choice == '3':
            run_bag_theft_demo(detector)
        elif choice == '4':
            run_realtime_demo(detector)
        elif choice == 'q':
            print("\nExiting.")
            break
        else:
            print("Invalid choice.")
            time.sleep(1)

if __name__ == "__main__":
    main()
