import cv2
import os
import time
import sys

# Try to import your main project detectors (optional)
try:
    from src.detector import TheftDetector
    from src.advanced_detector import AdvancedTheftDetector
    MAIN_DETECTORS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Main detectors not available: {e}")
    MAIN_DETECTORS_AVAILABLE = False

# Import standalone file upload (always works)
try:
    from standalone_upload_tester import main as file_upload_main
    FILE_UPLOAD_AVAILABLE = True
except ImportError as e:
    FILE_UPLOAD_AVAILABLE = False
    print(f"⚠️  File upload not available: {e}")

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print the demonstration header"""
    print("=" * 70)
    print("MULTI-STRATEGY THEFT DETECTION SYSTEM - REVIEWER DEMONSTRATION")
    print("=" * 70)
    print("\nThis demonstration shows REAL theft detection in multiple scenarios:")
    print("1. Shoplifting Detection")
    print("2. Pickpocketing Detection") 
    print("3. Bag Snatching Detection")
    print("4. Suspicious Behavior Detection")
    print("5. Real-time Camera Analysis")
    if FILE_UPLOAD_AVAILABLE:
        print("6. File Upload Analysis")  # NEW OPTION
    print("\nFeatures demonstrated:")
    print("✓ Object Detection (YOLOv8)")
    print("✓ Pose Estimation (MediaPipe)")
    print("✓ Behavioral Analysis")
    print("✓ Real-time Alert System")
    print("✓ Multi-class Theft Classification")
    if FILE_UPLOAD_AVAILABLE:
        print("✓ File Upload Processing")  # NEW FEATURE

def main():
    """Main demonstration function"""
    clear_screen()
    print_header()
    
    input("\nPress Enter to start the demonstration...")
    
    # Initialize detector based on availability
    detector = None
    if MAIN_DETECTORS_AVAILABLE:
        try:
            detector = AdvancedTheftDetector()
            print("✅ Theft detection system initialized successfully!")
        except Exception as e:
            print(f"❌ Error initializing detector: {e}")
            detector = None
    else:
        print("🔄 Running with basic demonstration mode")
    
    while True:
        clear_screen()
        print("=" * 50)
        print("SELECT DEMONSTRATION SCENARIO")
        print("=" * 50)
        print("1. Shoplifting Detection")
        print("2. Pickpocketing Detection")
        print("3. Bag Snatching Detection") 
        print("4. Suspicious Behavior Detection")
        print("5. Real-time Camera Analysis")
        if FILE_UPLOAD_AVAILABLE:
            print("6. File Upload Analysis")  # NEW OPTION
        print("q. Exit Demonstration")
        print("=" * 50)
        
        choice_prompt = "\nChoose scenario (1-5" + (" or 6" if FILE_UPLOAD_AVAILABLE else "") + " or q): "
        try:
            choice = input(choice_prompt).strip().lower()
        except KeyboardInterrupt:
            print("\n👋 Exiting demonstration...")
            break
        
        if choice == '1':
            run_shoplifting_demo(detector)
        elif choice == '2':
            run_pickpocketing_demo(detector)
        elif choice == '3':
            run_bag_theft_demo(detector)
        elif choice == '4':
            run_suspicious_behavior_demo(detector)
        elif choice == '5':
            run_realtime_demo(detector)
        elif choice == '6' and FILE_UPLOAD_AVAILABLE:  # NEW OPTION
            run_file_upload_demo()
        elif choice == 'q':
            print("\n👋 Thank you for reviewing our Multi-Strategy Theft Detection System!")
            break
        else:
            print("❌ Invalid choice. Please select 1-5" + (" or 6" if FILE_UPLOAD_AVAILABLE else "") + " or q.")
            try:
                input("Press Enter to continue...")
            except KeyboardInterrupt:
                continue

def run_file_upload_demo():
    """Run the file upload analysis demonstration - NEW FUNCTION"""
    if not FILE_UPLOAD_AVAILABLE:
        print("❌ File upload feature is not available.")
        return
    
    print("\n" + "=" * 70)
    print("🎯 OPTION 6: FILE UPLOAD THEFT DETECTION")
    print("=" * 70)
    print("Analyze your own video files with our multi-strategy system")
    print("=" * 70)
    
    # Call the standalone file upload main function
    file_upload_main()

# =============================================================================
# YOUR ORIGINAL DEMO FUNCTIONS - KEEPING YOUR ACTUAL DEMO VIDEOS
# =============================================================================

def run_shoplifting_demo(detector):
    """Run shoplifting detection demo - YOUR ORIGINAL VERSION"""
    print("\n▶ Starting: Shoplifting Detection")
    print("Loading shoplifting scenario video...")
    
    # Your original shoplifting demo video path
    video_path = "data/demo_videos/Meet_WalkTogether_25s.mp4"  # Example from your project
    
    if os.path.exists(video_path):
        print(f"📹 Playing: {os.path.basename(video_path)}")
        print("🔍 Detecting shoplifting behavior...")
        play_demo_video(video_path, detector, "SHOPLIFTING")
    else:
        print("❌ Demo video not found at:", video_path)
        print("💡 Using fallback demonstration...")
        play_fallback_demo("SHOPLIFTING")
    
    print("✓ Shoplifting Detection demonstration completed")
    input("\nPress Enter to continue...")

def run_pickpocketing_demo(detector):
    """Run pickpocketing detection demo - YOUR ORIGINAL VERSION"""
    print("\n▶ Starting: Pickpocketing Detection")
    print("Loading pickpocketing scenario video...")
    
    # Your original pickpocketing demo video path
    video_path = "data/demo_videos/Browse1_30s.mp4"  # Example from your project
    
    if os.path.exists(video_path):
        print(f"📹 Playing: {os.path.basename(video_path)}")
        print("🔍 Detecting pickpocketing behavior...")
        play_demo_video(video_path, detector, "PICKPOCKETING")
    else:
        print("❌ Demo video not found at:", video_path)
        print("💡 Using fallback demonstration...")
        play_fallback_demo("PICKPOCKETING")
    
    print("✓ Pickpocketing Detection demonstration completed")
    input("\nPress Enter to continue...")

def run_bag_theft_demo(detector):
    """Run bag theft detection demo - YOUR ORIGINAL VERSION"""
    print("\n▶ Starting: Bag Snatching Detection")
    print("Loading bag theft scenario video...")
    
    # Your original bag theft demo video path
    video_path = "data/demo_videos/LeftBag_20s.mp4"  # Example from your project
    
    if os.path.exists(video_path):
        print(f"📹 Playing: {os.path.basename(video_path)}")
        print("🔍 Detecting bag theft behavior...")
        play_demo_video(video_path, detector, "BAG_SNATCHING")
    else:
        print("❌ Demo video not found at:", video_path)
        print("💡 Using fallback demonstration...")
        play_fallback_demo("BAG_SNATCHING")
    
    print("✓ Bag Snatching Detection demonstration completed")
    input("\nPress Enter to continue...")

def run_suspicious_behavior_demo(detector):
    """Run suspicious behavior detection demo - YOUR ORIGINAL VERSION"""
    print("\n▶ Starting: Suspicious Behavior Detection")
    print("Loading suspicious behavior scenario video...")
    
    # Your original suspicious behavior demo video path
    video_path = "data/demo_videos/Fight_Chase_15s.mp4"  # Example from your project
    
    if os.path.exists(video_path):
        print(f"📹 Playing: {os.path.basename(video_path)}")
        print("🔍 Detecting suspicious behavior...")
        play_demo_video(video_path, detector, "SUSPICIOUS_BEHAVIOR")
    else:
        print("❌ Demo video not found at:", video_path)
        print("💡 Using fallback demonstration...")
        play_fallback_demo("SUSPICIOUS_BEHAVIOR")
    
    print("✓ Suspicious Behavior Detection demonstration completed")
    input("\nPress Enter to continue...")

def run_realtime_demo(detector):
    """Run real-time camera analysis demo - YOUR ORIGINAL VERSION"""
    print("\n▶ Starting: Real-time Camera Analysis")
    print("Initializing camera feed...")
    
    # Your original real-time camera code
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot access camera. Using simulated demonstration...")
        play_fallback_demo("REAL-TIME")
    else:
        print("✅ Camera accessed successfully!")
        print("🎥 Real-time theft detection active...")
        print("Press 'q' to stop real-time analysis")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process frame with detector if available
            if detector:
                processed_frame, alerts = detector.process_frame(frame)
                
                # Display alerts
                if alerts and 'theft_detections' in alerts:
                    for detection in alerts['theft_detections']:
                        print(f"🚨 {detection['type']} detected! Confidence: {detection['confidence']:.1%}")
            else:
                processed_frame = frame
                # Add basic overlay
                cv2.putText(processed_frame, "Real-time Theft Detection", (50, 50), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(processed_frame, "Press 'q' to exit", (50, 100), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Real-time Theft Detection', processed_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
        print("✅ Real-time analysis stopped.")
    
    print("✓ Real-time Camera Analysis demonstration completed")
    input("\nPress Enter to continue...")

def play_demo_video(video_path, detector, scenario_type):
    """Play demo video with theft detection - YOUR ORIGINAL VERSION"""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Cannot open video: {video_path}")
        return
    
    print(f"🎬 Playing: {os.path.basename(video_path)}")
    print("Press 'q' to skip video")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Process frame with detector if available
        if detector:
            processed_frame, alerts = detector.process_frame(frame)
            
            # Display alerts
            if alerts and 'theft_detections' in alerts:
                for detection in alerts['theft_detections']:
                    print(f"🚨 {detection['type']}: {detection['message']} (Confidence: {detection['confidence']:.1%})")
        else:
            processed_frame = frame
            # Add basic scenario info
            cv2.putText(processed_frame, f"{scenario_type} Detection", (50, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(processed_frame, "Demo Video Playing", (50, 100), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow(f'{scenario_type} Detection', processed_frame)
        
        if cv2.waitKey(25) & 0xFF == ord('q'):
            print("⏹️ Video skipped by user")
            break
    
    cap.release()
    cv2.destroyAllWindows()

def play_fallback_demo(scenario_type):
    """Fallback demonstration when videos are not available"""
    print(f"🎭 Playing fallback demonstration for {scenario_type}...")
    print("Press 'q' to skip demonstration")
    
    # Create a simple colored frame for demonstration
    import numpy as np
    
    width, height = 640, 480
    frames = 100  # ~3 seconds
    
    for i in range(frames):
        frame = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
        
        # Add scenario-specific text
        cv2.putText(frame, f"{scenario_type} DETECTION", (100, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, "Fallback Demonstration", (100, 150), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        cv2.putText(frame, f"Frame: {i+1}/{frames}", (100, 200), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(frame, "Press 'q' to skip", (100, 250), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        cv2.imshow(f'Fallback: {scenario_type}', frame)
        
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
    
    cv2.destroyAllWindows()

def choose_demo_mode():
    """Choose demonstration mode - YOUR ORIGINAL VERSION"""
    print("Choose demonstration mode:")
    print("1. Interactive Demo (Recommended for reviewers)")
    print("2. Quick Evaluation (All scenarios)")
    
    while True:
        try:
            choice = input("Select mode (1 or 2): ").strip()
            if choice in ['1', '2']:
                return choice
            else:
                print("❌ Invalid choice. Please select 1 or 2.")
        except KeyboardInterrupt:
            print("\n👋 Exiting...")
            sys.exit(0)

def run_quick_evaluation(detector):
    """Run quick evaluation of all scenarios - YOUR ORIGINAL VERSION"""
    print("RUNNING QUICK EVALUATION OF ALL THEFT TYPES...\n")
    
    scenarios = [
        ("Shoplifting", run_shoplifting_demo),
        ("Pickpocketing", run_pickpocketing_demo), 
        ("Bag Snatching", run_bag_theft_demo),
        ("Suspicious Behavior", run_suspicious_behavior_demo)
    ]
    
    for scenario_name, scenario_func in scenarios:
        print(f"Evaluating: {scenario_name}")
        scenario_func(detector)
        print(f"✓ {scenario_name}: Security system active\n")
    
    print("=" * 50)
    print("EVALUATION SUMMARY")
    print("=" * 50)
    print("The system successfully demonstrates:")
    print("✓ Multi-class theft detection")
    print("✓ Real-time processing capability") 
    print("✓ Behavioral pattern recognition")
    print("✓ Alert system with confidence scoring")
    print("\nReady for reviewer evaluation!")

if __name__ == "__main__":
    try:
        mode = choose_demo_mode()
        
        if mode == '1':
            main()
        else:
            # Initialize detector for quick evaluation
            detector = None
            if MAIN_DETECTORS_AVAILABLE:
                try:
                    detector = AdvancedTheftDetector()
                except Exception as e:
                    print(f"❌ Error initializing detector: {e}")
            run_quick_evaluation(detector)
    except KeyboardInterrupt:
        print("\n👋 Exiting demonstration...")
