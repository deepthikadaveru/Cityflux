import cv2
import numpy as np
import os
import time
from PIL import Image, ImageDraw, ImageFont

# Ensure sample_videos directory exists
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 1280, 720
FPS = 30
DURATION_SEC = 10
TOTAL_FRAMES = FPS * DURATION_SEC

# Cameras Metadata
CAMERAS = [
    {
        "id": "cam_1_mgit",
        "name": "CAM-01: MGIT College Road",
        "location": "MGIT Main Gate, Gandipet Rd",
        "lat_lon": "17.3850° N, 78.3180° E",
        "bg_color": (35, 45, 40),
        "target_appear_frame": 30,  # TS 07 EA 1234
        "target_start_time": "10:00:05",
        "target_speed_kmh": 48
    },
    {
        "id": "cam_2_gandipet",
        "name": "CAM-02: Gandipet Circle",
        "location": "Gandipet Junction, Hyderabad",
        "lat_lon": "17.3910° N, 78.3240° E",
        "bg_color": (30, 40, 50),
        "target_appear_frame": 50,
        "target_start_time": "10:04:12",
        "target_speed_kmh": 52
    },
    {
        "id": "cam_3_kokapet",
        "name": "CAM-03: Kokapet SEZ Junction",
        "location": "Kokapet Financial Dist Link",
        "lat_lon": "17.3980° N, 78.3360° E",
        "bg_color": (45, 35, 40),
        "target_appear_frame": 70,
        "target_start_time": "10:08:45",
        "target_speed_kmh": 65
    },
    {
        "id": "cam_4_narsingi",
        "name": "CAM-04: Narsingi Rotary",
        "location": "Narsingi ORR Service Road",
        "lat_lon": "17.3800° N, 78.3610° E",
        "bg_color": (40, 40, 45),
        "target_appear_frame": 40,
        "target_start_time": "10:12:30",
        "target_speed_kmh": 92  # Speeding Anomaly (>80 km/h)
    }
]

# Vehicle Profiles (Color, Plate Text, Type)
VEHICLES_DATABASE = {
    "target": {
        "plate": "TS 07 EA 1234",
        "color": (230, 230, 235),  # Pearl White SUV
        "type": "SUV / Creta",
        "is_blacklisted": True
    },
    "v1": {
        "plate": "TS 08 AB 5678",
        "color": (40, 40, 200),  # Red Hatchback
        "type": "Hatchback",
        "is_blacklisted": False
    },
    "v2": {
        "plate": "TS 09 FL 9999",
        "color": (30, 30, 30),   # Black Sedan
        "type": "Sedan",
        "is_blacklisted": False
    },
    "v3": {
        "plate": "AP 28 BK 8888",
        "color": (200, 160, 40),  # Blue Compact
        "type": "Compact SUV",
        "is_blacklisted": False
    }
}

def draw_license_plate(draw, x, y, width, height, plate_text):
    """Draws a crisp Indian high-security license plate (HSRP)"""
    # White background plate box
    draw.rectangle([x, y, x + width, y + height], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    # Blue IND strip on left
    draw.rectangle([x, y, x + int(width * 0.12), y + height], fill=(180, 50, 20))
    
    # IND text on blue strip
    try:
        font_small = ImageFont.truetype("arial.ttf", int(height * 0.35))
        font_plate = ImageFont.truetype("arialbd.ttf", int(height * 0.65))
    except:
        font_small = ImageFont.load_default()
        font_plate = ImageFont.load_default()

    draw.text((x + 3, y + int(height * 0.25)), "IND", fill=(255, 255, 255), font=font_small)
    
    # Main Plate Number (Black bold text)
    text_x = x + int(width * 0.16)
    text_y = y + int(height * 0.1)
    draw.text((text_x, text_y), plate_text, fill=(0, 0, 0), font=font_plate)

def create_road_background(cam_info):
    """Generates realistic asphalt multi-lane road background with lane lines"""
    img = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    img[:] = cam_info["bg_color"]
    
    # Asphalt surface
    cv2.rectangle(img, (0, 180), (WIDTH, 620), (55, 55, 60), -1)
    # Road curbs
    cv2.rectangle(img, (0, 170), (WIDTH, 180), (120, 120, 125), -1)
    cv2.rectangle(img, (0, 620), (WIDTH, 630), (120, 120, 125), -1)
    
    # White dashed lane dividers
    for lane_y in [320, 470]:
        for x in range(0, WIDTH, 80):
            cv2.line(img, (x, lane_y), (x + 45, lane_y), (220, 220, 220), 4)
            
    # Environmental elements (Streetlights)
    for x in range(100, WIDTH, 300):
        cv2.circle(img, (x, 140), 12, (180, 190, 200), -1)
        cv2.circle(img, (x, 140), 6, (255, 255, 200), -1)
        
    return img

def draw_vehicle(img_pil, x, y, width, height, color, plate_text):
    """Draws a top-down vehicle body with license plate"""
    draw = ImageDraw.Draw(img_pil)
    
    # Vehicle Shadow
    draw.rectangle([x + 8, y + 10, x + width + 8, y + height + 10], fill=(20, 20, 20))
    
    # Main Body
    draw.rounded_rectangle([x, y, x + width, y + height], radius=12, fill=color, outline=(20, 20, 20), width=3)
    
    # Front/Rear Windshield
    ws_margin = int(width * 0.15)
    draw.rounded_rectangle([x + ws_margin, y + int(height * 0.15), x + width - ws_margin, y + int(height * 0.35)], radius=4, fill=(50, 70, 90))
    draw.rounded_rectangle([x + ws_margin, y + int(height * 0.65), x + width - ws_margin, y + int(height * 0.85)], radius=4, fill=(50, 70, 90))

    # License Plate on Rear Bumper (x centered, bottom of vehicle)
    plate_w = int(width * 0.65)
    plate_h = int(height * 0.22)
    plate_x = x + (width - plate_w) // 2
    plate_y = y + height - plate_h - 4
    
    draw_license_plate(draw, plate_x, plate_y, plate_w, plate_h, plate_text)

def generate_video_for_camera(cam):
    out_path = os.path.join(OUTPUT_DIR, f"{cam['id']}.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_path, fourcc, FPS, (WIDTH, HEIGHT))
    
    bg_frame = create_road_background(cam)
    
    print(f"[+] Generating synthetic CCTV feed for {cam['name']} -> {out_path}")
    
    for frame_idx in range(TOTAL_FRAMES):
        # Convert OpenCV background to PIL Image for high quality drawing
        frame_pil = Image.fromarray(cv2.cvtColor(bg_frame, cv2.COLOR_BGR2RGB))
        
        # 1. Background traffic vehicles
        # Vehicle V1 (Lane 1 - top lane, moving left to right)
        v1_x = -220 + (frame_idx * 14) % (WIDTH + 300)
        draw_vehicle(frame_pil, v1_x, 220, 220, 85, VEHICLES_DATABASE["v1"]["color"], VEHICLES_DATABASE["v1"]["plate"])
        
        # Vehicle V2 (Lane 3 - bottom lane, moving right to left)
        v2_x = WIDTH + 100 - (frame_idx * 11) % (WIDTH + 300)
        draw_vehicle(frame_pil, v2_x, 500, 210, 80, VEHICLES_DATABASE["v2"]["color"], VEHICLES_DATABASE["v2"]["plate"])
        
        # 2. Target Vehicle (TS 07 EA 1234) passing through at specific time window
        target_start = cam["target_appear_frame"]
        if target_start <= frame_idx <= target_start + 140:
            rel_idx = frame_idx - target_start
            speed_mult = 18 if cam["id"] == "cam_4_narsingi" else 11
            target_x = -250 + rel_idx * speed_mult
            target_y = 360  # Center lane
            
            draw_vehicle(frame_pil, target_x, target_y, 230, 90, 
                         VEHICLES_DATABASE["target"]["color"], 
                         VEHICLES_DATABASE["target"]["plate"])
        
        # Convert back to OpenCV BGR
        frame_cv = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
        
        # 3. Add CCTV HUD Overlay (Live Timestamp, Camera Name, REC Indicator, Lat/Lon)
        # Top banner
        cv2.rectangle(frame_cv, (0, 0), (WIDTH, 45), (15, 15, 15), -1)
        cv2.putText(frame_cv, f"LIVE REC | {cam['name']} | {cam['location']}", (20, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 120), 2)
        
        # Timestamp calculation
        frame_sec = frame_idx / FPS
        time_str = f"2026-09-08 {cam['target_start_time'][:5]}:{int(cam['target_start_time'][6:]) + int(frame_sec):02d} IST"
        cv2.putText(frame_cv, time_str, (WIDTH - 380, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
        
        # Bottom banner
        cv2.rectangle(frame_cv, (0, HEIGHT - 35), (WIDTH, HEIGHT), (15, 15, 15), -1)
        cv2.putText(frame_cv, f"GPS: {cam['lat_lon']} | FPS: 30.0 | ANPR NODE ACTIVE", (20, HEIGHT - 12), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 180, 180), 1)

        writer.write(frame_cv)
        
    writer.release()
    print(f"[OK] Successfully generated {out_path}")

if __name__ == "__main__":
    for camera in CAMERAS:
        generate_video_for_camera(camera)
    print("\n[SUCCESS] All 4 Hyderabad Camera Feeds Generated Successfully!")
