import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import cv2
import threading
import queue
import json
import os
import time
from PIL import Image, ImageTk

# =============================================================================
# 🚀 Real detector is imported
# =============================================================================
try:
    from advanced_detector import AdvancedTheftDetector
except ImportError:
    messagebox.showerror("Import Error", "Could not find 'advanced_detector.py'. Make sure it's in the same folder as 'gui_app.py'.")
    exit()

# --- End of Import Section ---


class TheftDetectionApp:
    def __init__(self, root, detector):
        self.root = root
        self.root.title("Multi-Strategy Theft Detection")
        self.root.geometry("1000x800")
        
        # --- Core Components ---
        self.detector = detector
        self.video_source = 0
        self.video_thread = None
        self.stop_event = threading.Event()
        
        # Queues for thread-safe communication
        self.frame_queue = queue.Queue(maxsize=1)
        self.alert_queue = queue.Queue(maxsize=10)
        
        self.all_detections = []

        # --- Create GUI ---
        self.create_widgets()
        
        # Start the GUI update loop
        self.update_gui()

    def create_widgets(self):
        self.notebook = ttk.Notebook(self.root)
        
        self.tab_live = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_live, text='Live Camera')
        self.create_live_cam_tab()
        
        self.tab_demos = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_demos, text='Demo Videos')
        self.create_demos_tab()

        self.tab_upload = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_upload, text='Upload Video')
        self.create_upload_tab()

        self.tab_results = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_results, text='Results')
        self.create_results_tab()

        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)

    # --- Tab Creation Methods ---

    def create_live_cam_tab(self):
        self.video_label = ttk.Label(self.tab_live, text="Video feed will appear here.", anchor=tk.CENTER)
        self.video_label.pack(expand=True, fill='both', padx=5, pady=5)
        
        controls_frame = ttk.Frame(self.tab_live)
        controls_frame.pack(fill='x', pady=10)

        self.btn_start_cam = ttk.Button(controls_frame, text="Start Camera", command=self.on_start_camera)
        self.btn_start_cam.pack(side='left', padx=5)

        self.btn_stop_cam = ttk.Button(controls_frame, text="Stop Camera", command=self.on_stop_video, state=tk.DISABLED)
        self.btn_stop_cam.pack(side='left', padx=5)
        
        self.alert_label = ttk.Label(self.tab_live, text="ALERTS: ---", font=("Helvetica", 14, "bold"), foreground="red")
        self.alert_label.pack(fill='x', pady=10)

    def create_demos_tab(self):
        label = ttk.Label(self.tab_demos, text="Select a demo video to analyze.", font=("Helvetica", 12))
        label.pack(pady=10)
        
        demo_frame = ttk.Frame(self.tab_demos)
        demo_frame.pack(pady=20)

        self.data_dir = "data"
        
        btn_pp = ttk.Button(demo_frame, text="Pickpocketing Demo", 
                            command=lambda: self.on_start_video_file(os.path.join(self.data_dir, "demo_pickpocketing.mp4")))
        btn_pp.pack(fill='x', pady=5)
        
        btn_sl = ttk.Button(demo_frame, text="Shoplifting Demo", 
                            command=lambda: self.on_start_video_file(os.path.join(self.data_dir, "demo_shoplifting.mp4")))
        btn_sl.pack(fill='x', pady=5)
        
        btn_bs = ttk.Button(demo_frame, text="Bag Snatching Demo", 
                            command=lambda: self.on_start_video_file(os.path.join(self.data_dir, "demo_bag_snatching.mp4")))
        btn_bs.pack(fill='x', pady=5)
        
        btn_stop_demo = ttk.Button(demo_frame, text="Stop Demo", command=self.on_stop_video)
        btn_stop_demo.pack(fill='x', pady=20)

    def create_upload_tab(self):
        label = ttk.Label(self.tab_upload, text="Upload your own video file for analysis.", font=("Helvetica", 12))
        label.pack(pady=10)
        
        btn_browse = ttk.Button(self.tab_upload, text="Browse and Analyze File", command=self.on_upload_file)
        btn_browse.pack(pady=20)
        
        label_info = ttk.Label(self.tab_upload, text="Note: Analysis will begin immediately in the 'Live Camera' tab.")
        label_info.pack(pady=5)
        
    def create_results_tab(self):
        label = ttk.Label(self.tab_results, text="All Detection Events", font=("Helvetica", 12))
        label.pack(pady=10)
        
        text_frame = ttk.Frame(self.tab_results)
        text_frame.pack(expand=True, fill='both', padx=5, pady=5)
        
        self.results_text = tk.Text(text_frame, height=20, width=100, state=tk.DISABLED)
        scrollbar = ttk.Scrollbar(text_frame, command=self.results_text.yview)
        self.results_text.configure(yscrollcommand=scrollbar.set)
        
        scrollbar.pack(side='right', fill='y')
        self.results_text.pack(expand=True, fill='both')
        
        btn_save = ttk.Button(self.tab_results, text="Save Results as JSON", command=self.on_save_results)
        btn_save.pack(pady=10)

    # --- Core Logic Methods ---

    def on_start_camera(self):
        self.on_start_video_file(0) # 0 is the default webcam
        self.btn_start_cam.config(state=tk.DISABLED)
        self.btn_stop_cam.config(state=tk.NORMAL)

    def on_start_video_file(self, source_path):
        if self.video_thread is not None and self.video_thread.is_alive():
            # If a video is already running, stop it first
            self.on_stop_video() 
            
        self.video_source = source_path
        
        if self.video_source != 0 and not os.path.exists(self.video_source):
            messagebox.showerror("Error", f"Video file not found: {self.video_source}")
            return
            
        self.stop_event.clear()
        self.all_detections = [] 
        
        self.notebook.select(self.tab_live)
        
        self.video_thread = threading.Thread(target=self.video_loop, daemon=True)
        self.video_thread.start()

        self.btn_start_cam.config(state=tk.DISABLED)
        self.btn_stop_cam.config(state=tk.NORMAL)

    def on_stop_video(self):
        # --- FIX #2 ---
        # Set the event to signal the thread to stop.
        # DO NOT call .join() here. It blocks the GUI.
        print("Stop button pressed. Signaling video thread to stop.")
        self.stop_event.set()
        
        self.btn_start_cam.config(state=tk.NORMAL)
        self.btn_stop_cam.config(state=tk.DISABLED)
        self.video_label.config(image=None, text="Video feed stopped.")
        self.alert_label.config(text="ALERTS: ---")

    def on_upload_file(self):
        filepath = filedialog.askopenfilename(
            title="Select Video File",
            filetypes=(("Video files", "*.mp4 *.avi *.mov"), ("All files", "*.*"))
        )
        if filepath:
            self.on_start_video_file(filepath)

    def video_loop(self):
        """This function runs in the background thread."""
        try:
            cap = cv2.VideoCapture(self.video_source)
            if not cap.isOpened():
                print(f"Error: Cannot open video source: {self.video_source}")
                self.root.after(0, lambda: messagebox.showerror("Video Error", f"Cannot open video source: {self.video_source}"))
                return

            # --- FIX #1: ADDED FPS LIMITING ---
            fps = cap.get(cv2.CAP_PROP_FPS)
            if fps == 0 or fps is None:
                fps = 30.0  # Default for webcams
            
            frame_delay_sec = 1.0 / fps
            print(f"Video source open. Target FPS: {fps} (Delay: {frame_delay_sec:.4f}s)")
            # -----------------------------------

            while not self.stop_event.is_set():
                loop_start_time = time.time()
                
                ret, frame = cap.read()
                if not ret:
                    print("End of video file.")
                    break # End of video
                
                # --- THIS IS WHERE YOUR CODE RUNS ---
                processed_frame, alerts = self.detector.process_frame(frame)
                # ------------------------------------

                if not self.frame_queue.full():
                    self.frame_queue.put(processed_frame)
                
                if alerts and 'theft_detections' in alerts:
                    if not self.alert_queue.full():
                        self.alert_queue.put(alerts['theft_detections'])

                # --- FIX #1: WAIT TO MAINTAIN FPS ---
                loop_end_time = time.time()
                elapsed_sec = loop_end_time - loop_start_time
                sleep_time_sec = frame_delay_sec - elapsed_sec
                
                if sleep_time_sec > 0:
                    time.sleep(sleep_time_sec)
                # -----------------------------------

            cap.release()
            print("Video loop has stopped.")
        except Exception as e:
            print(f"Error in video loop: {e}")
            
        # Signal that the video has ended
        self.frame_queue.put(None)

    def update_gui(self):
        """This function runs in the main GUI thread."""
        
        try:
            frame = self.frame_queue.get_nowait()
            
            if frame is None:
                # Video ended
                self.on_stop_video()
                return
            
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(frame_rgb)
            
            w, h = self.video_label.winfo_width(), self.video_label.winfo_height()
            if w > 1 and h > 1:
                pil_img.thumbnail((w - 10, h - 10), Image.LANCZOS)

            self.img_tk = ImageTk.PhotoImage(image=pil_img)
            self.video_label.config(image=self.img_tk, text="")

        except queue.Empty:
            pass # No new frame, just wait
        except Exception as e:
            print(f"Error updating GUI frame: {e}")
            
        try:
            detections = self.alert_queue.get_nowait()
            
            latest_alert = detections[0]
            alert_text = f"🚨 {latest_alert['type']}: {latest_alert['message']} (Conf: {latest_alert['confidence']:.0%})"
            self.alert_label.config(text=alert_text)
            
            self.log_to_results(detections)
            self.all_detections.extend(detections)

        except queue.Empty:
            pass # No new alerts
        except Exception as e:
            print(f"Error updating GUI alerts: {e}")

        self.root.after(30, self.update_gui) # ~30 FPS update rate

    def log_to_results(self, detections):
        self.results_text.config(state=tk.NORMAL)
        for detection in detections:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            log_entry = f"[{timestamp}] - {detection['type']} - {detection['message']} - Conf: {detection['confidence']:.2f}\n"
            self.results_text.insert(tk.END, log_entry)
        self.results_text.config(state=tk.DISABLED)
        self.results_text.see(tk.END)

    def on_save_results(self):
        if not self.all_detections:
            messagebox.showinfo("No Results", "No detections have been logged yet.")
            return
            
        filepath = filedialog.asksaveasfilename(
            title="Save Results",
            defaultextension=".json",
            filetypes=(("JSON files", "*.json"), ("All files", "*.*"))
        )
        if filepath:
            try:
                with open(filepath, 'w') as f:
                    json.dump(self.all_detections, f, indent=4)
                messagebox.showinfo("Success", f"Results saved to {filepath}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save results: {e}")
                
    def on_closing(self):
        """Handle window close event."""
        print("Window closed. Shutting down.")
        self.on_stop_video()
        self.root.destroy()

# =============================================================================
# 🚀 MAIN APPLICATION ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    
    app = None
    root = None
    try:
        try:
            detector_instance = AdvancedTheftDetector()
        except Exception as e:
            messagebox.showerror("Detector Error", f"Failed to initialize AdvancedTheftDetector: {e}")
            exit()

        root = tk.Tk()
        app = TheftDetectionApp(root, detector_instance)
        root.protocol("WM_DELETE_WINDOW", app.on_closing)
        root.mainloop()

    except KeyboardInterrupt:
        print("\nCaught KeyboardInterrupt. Forcing exit...")
        if app:
            app.on_closing()
        elif root:
            root.destroy()
