import cv2
import numpy as np
import os
from PIL import Image, ImageDraw, ImageFont

# Input AI Generated Photorealistic Background Images
BG_IMAGES = {
    "cam_1_mgit": r"C:\Users\NIHARIKA\.gemini\antigravity\brain\1ca5e09d-1dda-436d-8f3c-a7e4e790326b\mgit_cctv_bg_1788867803271.jpg",
    "cam_2_gandipet": r"C:\Users\NIHARIKA\.gemini\antigravity\brain\1ca5e09d-1dda-436d-8f3c-a7e4e790326b\gandipet_cctv_bg_1788867827473.jpg",
    "cam_3_kokapet": r"C:\Users\NIHARIKA\.gemini\antigravity\brain\1ca5e09d-1dda-436d-8f3c-a7e4e790326b\kokapet_cctv_bg_1788867853280.jpg",
    "cam_4_narsingi": r"C:\Users\NIHARIKA\.gemini\antigravity\brain\1ca5e09d-1dda-436d-8f3c-a7e4e790326b\narsingi_cctv_bg_1788867882285.jpg"
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 1280, 720
FPS = 30
DURATION_SEC = 10
TOTAL_FRAMES = FPS * DURATION_SEC

# Camera Metadata for HUD Overlays
CAMERAS = [
    {
        "id": "cam_1_mgit",
        "name": "CAM-01: MGIT Main Gate",
        "location": "Gandipet Road, Hyderabad",
        "lat_lon": "17.3850° N, 78.3180° E",
        "target_appear_frame": 30,
        "target_start_time": "10:00:05",
        "lane_y": 420,
        "speed": 12
    },
    {
        "id": "cam_2_gandipet",
        "name": "CAM-02: Gandipet Circle",
        "location": "Gandipet Junction, Hyderabad",
        "lat_lon": "17.3910° N, 78.3240° E",
        "target_appear_frame": 50,
        "target_start_time": "10:04:12",
        "lane_y": 460,
        "speed": 11
    },
    {
        "id": "cam_3_kokapet",
        "name": "CAM-03: Kokapet SEZ Junction",
        "location": "Financial District Link",
        "lat_lon": "17.3980° N, 78.3360° E",
        "target_appear_frame": 70,
        "target_start_time": "10:08:45",
        "lane_y": 440,
        "speed": 14
    },
    {
        "id": "cam_4_narsingi",
        "name": "CAM-04: Narsingi Rotary",
        "location": "ORR Service Road, Hyderabad",
        "lat_lon": "17.3800° N, 78.3610° E",
        "target_appear_frame": 40,
        "target_start_time": "10:12:30",
        "lane_y": 500,
        "speed": 22  # High speed for speeding anomaly
    }
]

def draw_photorealistic_hsrp_plate(draw, x, y, width, height, plate_text):
    """Draws a crisp Indian High-Security License Plate (HSRP)"""
    # Plate background box with dark border
    draw.rectangle([x, y, x + width, y + height], fill=(255, 255, 255), outline=(10, 10, 10), width=2)
    # Blue IND strip
    ind_w = max(int(width * 0.12), 12)
    draw.rectangle([x, y, x + ind_w, y + height], fill=(180, 50, 20))
    
    try:
        font_plate = ImageFont.truetype("arialbd.ttf", int(height * 0.65))
        font_small = ImageFont.truetype("arial.ttf", int(height * 0.30))
    except:
        font_plate = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.text((x + 2, y + int(height * 0.25)), "IND", fill=(255, 255, 255), font=font_small)
    
    text_x = x + ind_w + int(width * 0.04)
    text_y = y + int(height * 0.1)
    draw.text((text_x, text_y), plate_text, fill=(0, 0, 0), font=font_plate)

def draw_photorealistic_car(frame_pil, x, y, width, height, body_color, plate_text):
    """Draws a realistic vehicle top/angled body overlay onto the real camera scene"""
    draw = ImageDraw.Draw(frame_pil)
    
    # Soft Drop Shadow
    draw.rectangle([x + 6, y + 8, x + width + 6, y + height + 8], fill=(0, 0, 0))
    
    # Body Chassis
    draw.rounded_rectangle([x, y, x + width, y + height], radius=10, fill=body_color, outline=(30, 30, 30), width=2)
    
    # Glass Roof / Windshield Tint
    draw.rounded_rectangle([x + int(width * 0.18), y + int(height * 0.15), x + width - int(width * 0.18), y + int(height * 0.35)], radius=3, fill=(40, 55, 75))
    draw.rounded_rectangle([x + int(width * 0.18), y + int(height * 0.65), x + width - int(width * 0.18), y + int(height * 0.85)], radius=3, fill=(40, 55, 75))

    # License Plate on Rear Bumper
    pw = int(width * 0.65)
    ph = int(height * 0.24)
    px = x + (width - pw) // 2
    py = y + height - ph - 3
    
    draw_photorealistic_hsrp_plate(draw, px, py, pw, ph, plate_text)

def generate_video_from_photorealistic_bg(cam):
    bg_path = BG_IMAGES[cam["id"]]
    if not os.path.exists(bg_path):
        print(f"[!] Missing BG image for {cam['id']}")
        return

    # Load photorealistic base image & resize to 1280x720
    bg_img = Image.open(bg_path).convert("RGB").resize((WIDTH, HEIGHT))
    bg_cv_base = cv2.cvtColor(np.array(bg_img), cv2.COLOR_RGB2BGR)
    
    out_path = os.path.join(OUTPUT_DIR, f"{cam['id']}.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_path, fourcc, FPS, (WIDTH, HEIGHT))
    
    print(f"[+] Rendering Photorealistic CCTV Feed: {cam['name']} -> {out_path}")
    
    for frame_idx in range(TOTAL_FRAMES):
        # Work on a fresh copy of the photorealistic camera background
        frame_pil = Image.fromarray(cv2.cvtColor(bg_cv_base, cv2.COLOR_BGR2RGB))
        
        # Target Blacklisted Vehicle (TS 07 EA 1234) passing through
        target_start = cam["target_appear_frame"]
        if target_start <= frame_idx <= target_start + 130:
            rel_idx = frame_idx - target_start
            tx = -240 + rel_idx * cam["speed"]
            ty = cam["lane_y"]
            
            # White Hyundai Creta / SUV carrying TS 07 EA 1234
            draw_photorealistic_car(frame_pil, tx, ty, 230, 85, (235, 235, 240), "TS 07 EA 1234")
            
        # Convert back to OpenCV BGR
        frame_cv = cv2.cvtColor(np.array(frame_pil), cv2.COLOR_RGB2BGR)
        
        # Real CCTV HUD Timestamp & Camera Tag
        cv2.rectangle(frame_cv, (0, 0), (WIDTH, 42), (10, 10, 10), -1)
        cv2.putText(frame_cv, f"REC ● {cam['name']} | {cam['location']}", (20, 28), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 120), 2)
        
        frame_sec = frame_idx / FPS
        time_str = f"2026-09-08 {cam['target_start_time'][:5]}:{int(cam['target_start_time'][6:]) + int(frame_sec):02d} IST"
        cv2.putText(frame_cv, time_str, (WIDTH - 360, 28), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        writer.write(frame_cv)
        
    writer.release()
    print(f"[OK] Successfully rendered {out_path}")

if __name__ == "__main__":
    for camera in CAMERAS:
        generate_video_from_photorealistic_bg(camera)
    print("\n[SUCCESS] Photorealistic Hyderabad CCTV Video Feeds Generated!")
