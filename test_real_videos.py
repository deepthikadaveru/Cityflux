import cv2
import easyocr
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def analyze_video(video_name, video_path, reader):
    print(f"\n==================================================", flush=True)
    print(f"ANALYZING: {video_name} ({video_path})", flush=True)
    print(f"==================================================", flush=True)
    
    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found!", flush=True)
        return []

    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Resolution: {width}x{height} | FPS: {fps} | Total Frames: {total_frames} (~{total_frames/fps:.1f}s)", flush=True)
    
    # Sample every 10 frames (~3 frames per second)
    sample_rate = max(1, fps // 3)
    
    frame_idx = 0
    detected_texts = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1

        if frame_idx % sample_rate == 0:
            results = reader.readtext(frame)
            
            for (bbox, text, prob) in results:
                text_clean = text.strip()
                if len(text_clean) >= 2 and prob > 0.15:
                    timestamp = frame_idx / fps
                    detected_texts.append({
                        "frame": frame_idx,
                        "time_s": round(timestamp, 2),
                        "text": text_clean,
                        "conf": round(prob, 2)
                    })
                    print(f"  [Frame {frame_idx} | {timestamp:.1f}s] Text: '{text_clean}' (conf: {prob:.2f})", flush=True)

    cap.release()
    print(f"Done {video_name}. Total texts found: {len(detected_texts)}", flush=True)
    return detected_texts

def main():
    print("Initializing EasyOCR...", flush=True)
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    
    video_folder = r"d:\sih127\sample_videos"
    videos = ["cam1.mp4", "cam2.mp4", "cam3.mp4", "cam4.mp4"]
    
    summary = {}
    for v in videos:
        v_path = os.path.join(video_folder, v)
        summary[v] = analyze_video(v, v_path, reader)
        
    print("\n" + "="*60, flush=True)
    print("FINAL SUMMARY OF DETECTED TEXTS", flush=True)
    print("="*60, flush=True)
    for v, detections in summary.items():
        print(f"\nVideo {v}:", flush=True)
        if not detections:
            print("  No text detected.", flush=True)
        else:
            for d in detections:
                print(f"  Frame {d['frame']} ({d['time_s']}s): '{d['text']}' (conf: {d['conf']})", flush=True)

if __name__ == "__main__":
    main()
