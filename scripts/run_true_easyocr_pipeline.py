import cv2
import easyocr
import csv
import os
import sys
import numpy as np

# Force UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VIDEOS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_videos")
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "anpr_real_benchmark.csv")

def extract_plate_candidates(frame):
    """
    OpenCV License Plate Contour Extraction:
    Finds rectangular contours matching standard HSRP aspect ratio (2.0 - 5.5).
    Returns list of cropped image regions.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 200)

    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:30]

    crops = []
    h_img, w_img = frame.shape[:2]

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)

        if len(approx) == 4:
            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = float(w) / float(h)

            if 2.0 <= aspect_ratio <= 6.0 and w > 60 and h > 15:
                # Add padding
                pad_x = int(w * 0.05)
                pad_y = int(h * 0.05)
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(w_img, x + w + pad_x)
                y2 = min(h_img, y + h + pad_y)
                crop = frame[y1:y2, x1:x2]
                if crop.size > 0:
                    crops.append((crop, (x, y, w, h)))

    # Fallback if no 4-point contour found: crop center vehicle region
    if not crops:
        cy1, cy2 = int(h_img * 0.4), int(h_img * 0.9)
        cx1, cx2 = int(w_img * 0.2), int(w_img * 0.8)
        crops.append((frame[cy1:cy2, cx1:cx2], (cx1, cy1, cx2 - cx1, cy2 - cy1)))

    return crops

def run_actual_easyocr_on_videos():
    print("=" * 75)
    print("EXECUTING TRUE EASYOCR MODEL RUN ON REAL VIDEO FEEDS")
    print("No hardcoded data. Raw PyTorch/EasyOCR tensor outputs directly logged.")
    print("=" * 75)

    print("[+] Instantiating EasyOCR Reader (CPU mode)...")
    reader = easyocr.Reader(['en'], gpu=False)

    video_sources = [
        ("cam1.mp4", "CAM-01: MGIT Main Gate"),
        ("cam2.mp4", "CAM-02: Gandipet Circle"),
        ("cam3.mp4", "CAM-03: Kokapet SEZ Junction"),
        ("cam4.mp4", "CAM-04: Narsingi Rotary"),
    ]

    csv_file = open(CSV_PATH, "w", newline="", encoding="utf-8")
    headers = ["sample_id", "video_file", "camera_node", "frame_timestamp_sec", "detected_text", "raw_easyocr_confidence", "bbox_location"]
    writer = csv.writer(csv_file)
    writer.writerow(headers)
    csv_file.flush()

    total_samples = 0
    detected_count = 0
    all_confidences = []

    for vid_name, cam_label in video_sources:
        vid_path = os.path.join(VIDEOS_DIR, vid_name)
        if not os.path.exists(vid_path):
            print(f"[!] Warning: Video missing {vid_path}")
            continue

        print(f"\n[+] Processing Video Stream: {vid_name} ({cam_label})...")
        cap = cv2.VideoCapture(vid_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        
        # Sample every 1.5 seconds (~45 frames)
        step = int(fps * 1.5)
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % step == 0:
                ts_sec = round(frame_idx / fps, 2)
                candidate_crops = extract_plate_candidates(frame)

                for crop_img, bbox in candidate_crops[:2]:  # Test top 2 candidates per frame
                    total_samples += 1
                    
                    # Run EasyOCR on the actual numpy array crop
                    ocr_results = reader.readtext(crop_img)

                    if ocr_results:
                        # Find result with highest confidence
                        best = max(ocr_results, key=lambda x: x[2])
                        text_raw = best[1].strip()
                        conf_val = float(best[2])

                        # Clean alphanumeric text
                        clean_str = "".join(c for c in text_raw if c.isalnum()).upper()

                        if len(clean_str) >= 3:
                            detected_count += 1
                            all_confidences.append(conf_val)

                            row = [
                                f"SAMPLE-{total_samples:03d}",
                                vid_name,
                                cam_label,
                                ts_sec,
                                clean_str,
                                round(conf_val, 6),
                                str(bbox)
                            ]
                            writer.writerow(row)
                            csv_file.flush()
                            print(f"  [Sample #{total_samples:03d}] Time: {ts_sec}s | EasyOCR Raw Text: '{clean_str}' | Real Conf: {conf_val:.6f}")
                        else:
                            row = [f"SAMPLE-{total_samples:03d}", vid_name, cam_label, ts_sec, "NOISE_DISCARDED", round(conf_val, 6), str(bbox)]
                            writer.writerow(row)
                            csv_file.flush()
                    else:
                        row = [f"SAMPLE-{total_samples:03d}", vid_name, cam_label, ts_sec, "NO_TEXT_FOUND", 0.0, str(bbox)]
                        writer.writerow(row)
                        csv_file.flush()

            frame_idx += 1

        cap.release()

    csv_file.close()

    print("\n" + "=" * 75)
    print("TRUE EASYOCR MODEL RUN COMPLETED")
    print(f"  - Total Image Crops Evaluated : {total_samples}")
    print(f"  - Valid Text Extractions     : {detected_count}")
    if all_confidences:
        print(f"  - Min Confidence Observed    : {min(all_confidences):.6f}")
        print(f"  - Max Confidence Observed    : {max(all_confidences):.6f}")
        print(f"  - Mean Confidence Observed   : {sum(all_confidences)/len(all_confidences):.6f}")
    print(f"  - Raw Output Log CSV         : {CSV_PATH}")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    run_actual_easyocr_on_videos()
