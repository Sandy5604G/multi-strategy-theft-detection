import math
DATA_DIR = 'data'
MODELS_DIR = 'models'
OUTPUTS_DIR = 'outputs'
LOGS_DIR = 'logs'

YOLO_MODEL_NAME = 'yolov8m.pt'
YOLO_CONFIDENCE_THRESHOLD = 0.3  # Lowered to detect more objects

TRACKER_CONFIG = 'bytetrack.yaml'
TRACK_BUFFER_SIZE = 30
TRACK_CONFIDENCE_THRESHOLD = 0.4

# Relaxed thresholds to make testing easier
PRODUCT_PROXIMITY_RATIO = 0.40   # 40% of your height (much easier)
HIP_PROXIMITY_RATIO = 0.30       # 30% of your height
BAG_PROXIMITY_RATIO = 0.40       # 40% of your height

CONCEALMENT_FRAMES_THRESHOLD = 5  # Only 5 frames needed
PICKPOCKET_FRAMES_THRESHOLD = 4
BAG_SNATCH_FRAMES_THRESHOLD = 3
CROUCH_FRAMES_THRESHOLD = 6

ALERT_COOLDOWN_SECONDS = 3.0

NORMALIZED_HEIGHT_RATIO_THRESHOLD = 0.60

VELOCITY_THRESHOLD = 0.20  # Lowered velocity requirement

RIGHT_WRIST_IDX = 16
LEFT_WRIST_IDX = 15
LEFT_SHOULDER_IDX = 11
RIGHT_SHOULDER_IDX = 12
LEFT_HIP_IDX = 23
RIGHT_HIP_IDX = 24

PERSON_CLASS_ID = 0
BAG_CLASS_ID = 24
PRODUCT_CLASSES = [24, 26, 28, 39, 41, 67, 73, 77]

COLORS = {
    'person': (0, 255, 0),
    'product': (255, 0, 0),
    'bag': (0, 165, 255),
    'alert': (0, 0, 255),
    'pose': (245, 117, 66)
}
