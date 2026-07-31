import cv2
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
from collections import defaultdict, deque
from src.config import *
import time
import math


class AdvancedTheftDetector:
    def __init__(self):
        self.initialize_models()
        self.reset_state()

    def initialize_models(self):
        try:
            self.model_yolo = YOLO(YOLO_MODEL_NAME)
            print(f"YOLO model '{YOLO_MODEL_NAME}' loaded successfully (tracking enabled: {TRACKER_CONFIG})")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            self.model_yolo = None

        try:
            self.pose_model = mp.solutions.pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                min_detection_confidence=0.7,
                min_tracking_confidence=0.7
            )
            print("MediaPipe Pose model loaded successfully")
        except Exception as e:
            print(f"Error loading MediaPipe Pose model: {e}")
            self.pose_model = None

    def reset_state(self):
        self.frame_count = 0
        self.fps = 0
        self.prev_time = time.time()

        self.person_state = defaultdict(lambda: {
            'shoplifting_frames': 0,
            'pickpocketing_frames': 0,
            'bag_snatching_frames': 0,
            'crouching_frames': 0,
            'last_alert_time': defaultdict(float),
            'position_history': deque(maxlen=15),
        })

    def get_bbox_center(self, bbox):
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    def get_bbox_height(self, bbox):
        x1, y1, x2, y2 = bbox
        return max(abs(y2 - y1), 1.0)

    def normalized_distance(self, p1, p2, ref_height):
        dist = math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)
        return dist / ref_height

    def check_shoplifting(self, person_bbox, product_bboxes, pose_landmarks):
        person_center = self.get_bbox_center(person_bbox)
        person_height = self.get_bbox_height(person_bbox)
        detected, confidence = False, 0.0

        for product_bbox in product_bboxes:
            product_center = self.get_bbox_center(product_bbox)
            norm_dist = self.normalized_distance(person_center, product_center, person_height)

            if norm_dist < PRODUCT_PROXIMITY_RATIO:
                detected = True
                confidence = max(confidence, 0.8 - norm_dist)

        return detected, confidence

    def check_pickpocketing(self, person_bbox, other_person_bbox, pose_landmarks):
        person_center = self.get_bbox_center(person_bbox)
        other_center = self.get_bbox_center(other_person_bbox)
        ref_height = self.get_bbox_height(person_bbox)

        norm_dist = self.normalized_distance(person_center, other_center, ref_height)
        if norm_dist >= HIP_PROXIMITY_RATIO * 3:
            return False, 0.0

        return True, 0.75

    def check_bag_snatching(self, person_bbox, bag_bbox, velocity_per_sec):
        person_center = self.get_bbox_center(person_bbox)
        bag_center = self.get_bbox_center(bag_bbox)
        ref_height = self.get_bbox_height(person_bbox)

        norm_dist = self.normalized_distance(person_center, bag_center, ref_height)
        if norm_dist < BAG_PROXIMITY_RATIO and velocity_per_sec > VELOCITY_THRESHOLD:
            return True, 0.85
        return False, 0.0

    def check_crouching(self, pose_landmarks):
        if not pose_landmarks:
            return False, 0.0

        left_shoulder = pose_landmarks.landmark[LEFT_SHOULDER_IDX]
        right_shoulder = pose_landmarks.landmark[RIGHT_SHOULDER_IDX]
        left_hip = pose_landmarks.landmark[LEFT_HIP_IDX]
        right_hip = pose_landmarks.landmark[RIGHT_HIP_IDX]

        shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
        hip_y = (left_hip.y + right_hip.y) / 2
        torso_height = abs(shoulder_y - hip_y)

        if torso_height < NORMALIZED_HEIGHT_RATIO_THRESHOLD:
            return True, 0.75
        return False, 0.0

    def update_velocity(self, person_id, current_pos, person_height):
        state = self.person_state[person_id]
        now = time.time()
        state['position_history'].append((now, current_pos))

        history = list(state['position_history'])
        if len(history) < 2:
            return 0.0

        (t0, p0), (t1, p1) = history[0], history[-1]
        dt = max(t1 - t0, 1e-3)
        dist = math.sqrt((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2)
        return (dist / person_height) / dt

    def confirm_alert(self, person_id, alert_key, condition_true, frames_needed, alert_type):
        state = self.person_state[person_id]
        counter_key = f'{alert_key}_frames'

        if condition_true:
            state[counter_key] += 1
        else:
            state[counter_key] = max(0, state[counter_key] - 2)

        if state[counter_key] < frames_needed:
            return False

        now = time.time()
        if now - state['last_alert_time'][alert_type] < ALERT_COOLDOWN_SECONDS:
            return False

        state['last_alert_time'][alert_type] = now
        state[counter_key] = 0
        return True

    def process_frame(self, frame):
        self.frame_count += 1
        current_time = time.time()
        if current_time - self.prev_time >= 1.0:
            self.fps = self.frame_count
            self.frame_count = 0
            self.prev_time = current_time

        processed_frame = frame.copy()
        theft_detections = []

        if not self.model_yolo:
            cv2.putText(processed_frame, f"FPS: {self.fps}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            return processed_frame, {}

        try:
            results = self.model_yolo.track(
                frame, persist=True, tracker=TRACKER_CONFIG,
                conf=YOLO_CONFIDENCE_THRESHOLD, verbose=False
            )

            people = {}
            bags = []
            products = []

            pose_results = None
            if self.pose_model:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pose_results = self.pose_model.process(rgb_frame)
            pose_landmarks = pose_results.pose_landmarks if pose_results else None

            for result in results:
                boxes = result.boxes
                if boxes is None or len(boxes) == 0:
                    continue
                for box in boxes:
                    bx1, by1, bx2, by2 = box.xyxy[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    track_id = int(box.id[0].cpu().numpy()) if box.id is not None else None
                    bbox = (bx1, by1, bx2, by2)

                    if cls == PERSON_CLASS_ID:
                        pid = track_id if track_id is not None else f"noid_{bx1:.0f}_{by1:.0f}"
                        people[pid] = bbox
                    elif cls == BAG_CLASS_ID:
                        bags.append(bbox)
                    elif cls in PRODUCT_CLASSES:
                        products.append(bbox)

            # ============================================================
            # 🛑 CRITICAL FIX: ONLY RUN DETECTION IF PEOPLE EXIST
            # ============================================================
            if len(people) > 0:
                for person_id, person_bbox in people.items():
                    person_center = self.get_bbox_center(person_bbox)
                    person_height = self.get_bbox_height(person_bbox)
                    velocity = self.update_velocity(person_id, person_center, person_height)

                    shoplift_now, shoplift_conf = self.check_shoplifting(person_bbox, products, pose_landmarks)
                    if self.confirm_alert(person_id, 'shoplifting', shoplift_now,
                                           CONCEALMENT_FRAMES_THRESHOLD, 'SHOPLIFTING'):
                        theft_detections.append({
                            'type': 'SHOPLIFTING', 'confidence': round(shoplift_conf, 2),
                            'person_id': str(person_id), 'message': 'Sustained product concealment detected'
                        })

                    for bag_bbox in bags:
                        snatch_now, snatch_conf = self.check_bag_snatching(person_bbox, bag_bbox, velocity)
                        if self.confirm_alert(person_id, 'bag_snatching', snatch_now,
                                               BAG_SNATCH_FRAMES_THRESHOLD, 'BAG_SNATCHING'):
                            theft_detections.append({
                                'type': 'BAG_SNATCHING', 'confidence': round(snatch_conf, 2),
                                'person_id': str(person_id), 'message': 'Fast grab-and-move detected'
                            })

                    for other_id, other_bbox in people.items():
                        if other_id == person_id:
                            continue
                        pick_now, pick_conf = self.check_pickpocketing(person_bbox, other_bbox, pose_landmarks)
                        if self.confirm_alert(person_id, 'pickpocketing', pick_now,
                                               PICKPOCKET_FRAMES_THRESHOLD, 'PICKPOCKETING'):
                            theft_detections.append({
                                'type': 'PICKPOCKETING', 'confidence': round(pick_conf, 2),
                                'person_id': str(person_id), 'message': 'Sustained close interaction detected'
                            })

                    crouch_now, crouch_conf = self.check_crouching(pose_landmarks)
                    if self.confirm_alert(person_id, 'crouching', crouch_now,
                                           CROUCH_FRAMES_THRESHOLD, 'SUSPICIOUS_BEHAVIOR'):
                        theft_detections.append({
                            'type': 'SUSPICIOUS_BEHAVIOR', 'confidence': round(crouch_conf, 2),
                            'person_id': str(person_id), 'message': 'Sustained crouching/stealth movement detected'
                        })

                    x1, y1, x2, y2 = person_bbox
                    color = COLORS['person']
                    label = f"ID {person_id}"
                    person_thefts = [td for td in theft_detections if td['person_id'] == str(person_id)]
                    if person_thefts:
                        color = COLORS['alert']
                        label = f"ID {person_id}: {person_thefts[0]['type']}"

                    cv2.rectangle(processed_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 3)
                    cv2.putText(processed_frame, label, (int(x1), max(int(y1) - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                # Draw products and bags
                for bx1, by1, bx2, by2 in products:
                    cv2.rectangle(processed_frame, (int(bx1), int(by1)), (int(bx2), int(by2)), COLORS['product'], 2)
                    cv2.putText(processed_frame, "Product", (int(bx1), max(int(by1) - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS['product'], 2)

                for bx1, by1, bx2, by2 in bags:
                    cv2.rectangle(processed_frame, (int(bx1), int(by1)), (int(bx2), int(by2)), COLORS['bag'], 2)
                    cv2.putText(processed_frame, "Bag", (int(bx1), max(int(by1) - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLORS['bag'], 2)

            # ============================================================
            # END CRITICAL FIX
            # ============================================================

            if theft_detections:
                alerts = {'theft_detections': theft_detections, 'total_alerts': len(theft_detections)}
            else:
                alerts = {}

        except Exception as e:
            print(f"Detection error: {e}")
            alerts = {}

        # Overlay stats
        cv2.putText(processed_frame, f"FPS: {self.fps}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        y_offset = 60
        for detection in theft_detections[:5]:
            alert_text = f"{detection['type']} (ID {detection['person_id']}): {detection['confidence']:.2f}"
            cv2.putText(processed_frame, alert_text, (10, y_offset),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLORS['alert'], 2)
            y_offset += 25

        cv2.putText(processed_frame, f"Total Alerts: {len(theft_detections)}",
                    (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLORS['alert'], 2)

        return processed_frame, alerts
