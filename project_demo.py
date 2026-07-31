import cv2
import time
from src.detector import TheftDetector

def project_demo():
    """
    Complete demonstration script for project presentation
    Shows all features of the theft detection system
    """
    detector = TheftDetector()
    
    print("=== MULTI-STRATEGY THEFT DETECTION SYSTEM DEMO ===")
    print("\nDEMO MODES:")
    print("1. Synthetic Scenarios (Pre-recorded)")
    print("2. Live Camera Simulation")
    print("3. Performance Metrics")
    
    while True:
        print("\nChoose demo mode:")
        print("1 - Synthetic Scenarios")
        print("2 - Live Camera") 
        print("3 - Performance Test")
        print("q - Quit")
        
        choice = input("Enter choice: ").strip()
        
        if choice == '1':
            demo_synthetic_scenarios(detector)
        elif choice == '2':
            demo_live_camera(detector)
        elif choice == '3':
            demo_performance(detector)
        elif choice.lower() == 'q':
            break
        else:
            print("Invalid choice!")

def demo_synthetic_scenarios(detector):
    """Demo with pre-created synthetic scenarios"""
    scenarios = {
        '1': 'data/synthetic/shoplifting_test.mp4',
        '2': 'data/synthetic/pickpocketing_test.mp4'
    }
    
    print("\nAvailable Scenarios:")
    print("1 - Shoplifting Detection")
    print("2 - Pickpocketing Detection")
    
    choice = input("Choose scenario: ").strip()
    
    if choice in scenarios and os.path.exists(scenarios[choice]):
        video_path = scenarios[choice]
        cap = cv2.VideoCapture(video_path)
        
        scenario_name = "Shoplifting" if choice == '1' else "Pickpocketing"
        print(f"\nDemo: {scenario_name} Detection")
        print("Watch for detection alerts and bounding boxes")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            processed_frame, alerts = detector.process_frame(frame)
            
            # Add demo info
            cv2.putText(processed_frame, f"DEMO: {scenario_name} Detection", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            if alerts:
                cv2.putText(processed_frame, "SECURITY ALERT ACTIVATED!", 
                           (10, 450), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            
            cv2.imshow(f'Theft Detection Demo - {scenario_name}', processed_frame)
            
            if cv2.waitKey(100) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()

def demo_live_camera(detector):
    """Live camera demonstration"""
    print("\n=== LIVE CAMERA DEMO ===")
    print("This simulates a real CCTV system")
    print("Move around to test object detection")
    print("Press 'q' to return to menu")
    
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        processed_frame, alerts = detector.process_frame(frame)
        
        # Demo overlay
        cv2.putText(processed_frame, "LIVE CCTV SIMULATION - THEFT DETECTION SYSTEM", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(processed_frame, "Features: Person Detection, Object Tracking, Alert System", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        if alerts:
            cv2.putText(processed_frame, "SECURITY ALERT: Suspicious Activity Detected!", 
                       (10, 450), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        cv2.imshow('Live Demo - Multi-Strategy Theft Detection', processed_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

def demo_performance(detector):
    """Show system performance metrics"""
    print("\n=== SYSTEM PERFORMANCE ===")
    
    # Test with sample frame
    test_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    import time
    times = []
    
    for i in range(20):
        start_time = time.time()
        processed_frame, alerts = detector.process_frame(test_frame)
        end_time = time.time()
        times.append(end_time - start_time)
    
    avg_time = sum(times) / len(times)
    fps = 1 / avg_time
    
    print(f"Average Processing Time: {avg_time*1000:.2f} ms")
    print(f"Estimated FPS: {fps:.2f}")
    print(f"Resolution: 640x480")
    print("\nPerformance suitable for: Real-time monitoring")

if __name__ == "__main__":
    import os
    import numpy as np
    
    # Create synthetic videos if they don't exist
    if not os.path.exists('data/synthetic'):
        os.makedirs('data/synthetic', exist_ok=True)
        print("Please run 'python create_test_scenarios.py' first to create test videos")
    else:
        project_demo()
