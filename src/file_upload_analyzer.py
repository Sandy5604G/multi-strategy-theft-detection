import cv2
import os
import time
import json
import glob
from datetime import datetime

class FileUploadAnalyzer:
    """
    Integrated file upload analyzer for multi-strategy theft detection
    """
    
    def __init__(self, detector):
        print("🎯 FILE UPLOAD ANALYZER - Integrated with Main Project")
        self.detector = detector
        self.results_dir = "test_results"
        os.makedirs(self.results_dir, exist_ok=True)
    
    def find_video_files(self, directory):
        """Find all video files in a directory"""
        video_extensions = ['*.mp4', '*.avi', '*.mov', '*.mkv', '*.MP4', '*.AVI', '*.MOV']
        video_files = []
        
        for extension in video_extensions:
            video_files.extend(glob.glob(os.path.join(directory, extension)))
        
        return sorted(video_files)
    
    def analyze_video(self, video_path):
        """Analyze a single video file"""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": f"Cannot open video: {video_path}"}
        
        detection_log = []
        frame_count = 0
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        start_time = time.time()
        
        print(f"🎬 Analyzing: {os.path.basename(video_path)}")
        print("⏳ Processing... (Press 'q' to stop early)")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            height, width = frame.shape[:2]
            
            processed_frame, alerts = self.detector.process_frame(frame)
            
            if alerts and 'theft_detections' in alerts:
                for detection in alerts['theft_detections']:
                    detection_log.append({
                        'frame': frame_count,
                        'type': detection['type'],
                        'confidence': float(detection['confidence']),
                        'timestamp': frame_count / fps,
                        'message': detection.get('message', 'Theft detected')
                    })
            
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"   📊 Progress: {progress:.1f}% | Detections: {len(detection_log)}", end='\r')
            
            display_text = f"File Upload Analysis | Frame: {frame_count}/{total_frames}"
            cv2.putText(processed_frame, display_text, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.putText(processed_frame, f"Detections: {len(detection_log)}", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            
            if detection_log:
                latest = detection_log[-1]
                cv2.putText(processed_frame, f"Latest: {latest['type']} ({latest['confidence']:.1%})", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            cv2.imshow('File Upload - Theft Detection', processed_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n⏹️ Analysis stopped by user")
                break
        
        cv2.destroyAllWindows()
        cap.release()
        
        processing_time = time.time() - start_time
        detection_rate = (len(detection_log) / frame_count) * 100 if frame_count > 0 else 0
        
        results = {
            'video_file': os.path.basename(video_path),
            'video_path': video_path,
            'total_frames': total_frames,
            'processed_frames': frame_count,
            'duration': duration,
            'processing_time': processing_time,
            'detections_found': len(detection_log),
            'detection_rate': detection_rate,
            'detections': detection_log,
            'analysis_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.save_results(results)
        return results
    
    def save_results(self, results):
        """Save results to JSON"""
        if 'error' in results:
            return
        
        base_name = os.path.splitext(results['video_file'])[0]
        timestamp = datetime.now().strftime('%H%M%S')
        result_file = os.path.join(self.results_dir, f"upload_results_{base_name}_{timestamp}.json")
        
        with open(result_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"💾 Results saved to: {result_file}")
    
    def display_results(self, results):
        """Display analysis results"""
        print("\n" + "=" * 70)
        print("📊 FILE UPLOAD ANALYSIS REPORT")
        print("=" * 70)
        
        if 'error' in results:
            print(f"❌ {results['error']}")
            return
        
        print(f"📹 Video: {results['video_file']}")
        print(f"⏱️  Duration: {results['duration']:.1f}s")
        print(f"🎞️  Frames: {results['processed_frames']}/{results['total_frames']}")
        print(f"⚡ Processing time: {results['processing_time']:.1f}s")
        print(f"🚨 Total detections: {results['detections_found']}")
        print(f"📈 Detection rate: {results['detection_rate']:.2f}%")
        
        if results['detections_found'] > 0:
            from collections import defaultdict
            type_stats = defaultdict(list)
            for detection in results['detections']:
                type_stats[detection['type']].append(detection['confidence'])
            
            print("\n🔍 STRATEGY BREAKDOWN:")
            print("-" * 50)
            
            for strategy in ['PICKPOCKETING', 'SHOPLIFTING', 'BAG_SNATCHING', 'SUSPICIOUS_BEHAVIOR']:
                if strategy in type_stats:
                    confidences = type_stats[strategy]
                    avg_conf = sum(confidences) / len(confidences)
                    percentage = (len(confidences) / results['detections_found']) * 100
                    print(f"🎯 {strategy}: {len(confidences)} events ({percentage:.1f}%)")
                    print(f"   Average confidence: {avg_conf:.1%}")
                else:
                    print(f"🎯 {strategy}: No detections")
            
            print(f"\n✅ VERDICT: Multi-strategy detection successful!")
        else:
            print(f"\n✅ VERDICT: No theft patterns detected")
        
        print("=" * 70)

def file_upload_demo(detector):
    """
    Main function to run file upload demo
    """
    analyzer = FileUploadAnalyzer(detector)
    
    print("\n" + "=" * 70)
    print("🎯 FILE UPLOAD THEFT DETECTION DEMONSTRATION")
    print("=" * 70)
    print("Analyze your own video files with multi-strategy detection")
    print("=" * 70)
    
    while True:
        print("\n📁 FILE UPLOAD OPTIONS:")
        print("1. Analyze specific video file")
        print("2. Analyze all videos in directory")
        print("3. Return to main menu")
        
        try:
            choice = input("\nChoose option (1-3): ").strip()
        except KeyboardInterrupt:
            print("\n🔙 Returning to main menu...")
            break
        
        if choice == "1":
            video_path = input("\n📁 Enter video file path: ").strip().strip('"')
            if video_path.startswith("~"):
                video_path = os.path.expanduser(video_path)
            
            if not os.path.exists(video_path):
                print("❌ File not found!")
                continue
            
            if os.path.isdir(video_path):
                print("❌ That's a directory! Use option 2.")
                continue
            
            results = analyzer.analyze_video(video_path)
            analyzer.display_results(results)
            
        elif choice == "2":
            directory_path = input("\n📁 Enter directory path: ").strip().strip('"')
            if directory_path.startswith("~"):
                directory_path = os.path.expanduser(directory_path)
            
            if not os.path.exists(directory_path):
                print("❌ Directory not found!")
                continue
            
            video_files = analyzer.find_video_files(directory_path)
            
            if not video_files:
                print("❌ No video files found!")
                continue
            
            print(f"\n📹 Found {len(video_files)} videos:")
            for i, video_file in enumerate(video_files, 1):
                print(f"   {i}. {os.path.basename(video_file)}")
            
            print(f"\n🧪 Analyzing all {len(video_files)} videos...")
            
            for i, video_file in enumerate(video_files, 1):
                print(f"\n" + "="*60)
                print(f"📦 VIDEO {i}/{len(video_files)}: {os.path.basename(video_file)}")
                print("="*60)
                
                results = analyzer.analyze_video(video_file)
                analyzer.display_results(results)
                
                if i < len(video_files):
                    try:
                        input("\n⏎ Press Enter to continue to next video...")
                    except KeyboardInterrupt:
                        print("\n⏹️ Stopping batch analysis...")
                        break
        
        elif choice == "3":
            print("🔙 Returning to main menu...")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")
