import cv2
import easyocr
import os
import sys

# Fix encoding issue for Windows console which crashes when EasyOCR prints progress bars
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

def test_video_ocr(video_path):
    print(f"\n{'='*50}\nTesting Video: {os.path.basename(video_path)}\n{'='*50}")
    if not os.path.exists(video_path):
        print("File not found!")
        return

    # Initialize EasyOCR reader
    try:
        reader = easyocr.Reader(['en'], verbose=False)
    except Exception as e:
        print(f"Error initializing EasyOCR: {e}")
        return

    cap = cv2.VideoCapture(video_path)
    
    frame_count = 0
    read_texts = []
    
    frame_interval = 30 
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        if frame_count % frame_interval == 0:
            results = reader.readtext(frame)
            
            frame_findings = []
            for (bbox, text, prob) in results:
                if len(text.strip()) >= 3 and prob > 0.1:
                    frame_findings.append(f"'{text}' (conf: {prob:.2f})")
            
            if frame_findings:
                print(f"Frame {frame_count}: " + " | ".join(frame_findings))
                read_texts.extend(frame_findings)
                    
    cap.release()
    
    if not read_texts:
        print("No text detected in this video.")
    else:
        print(f"\nTotal text regions detected: {len(read_texts)}")

if __name__ == "__main__":
    video_a = r"d:\sih127\sample_videos\model_a_mgit.mp4"
    video_b = r"d:\sih127\sample_videos\model_b_mgit.mp4"
    
    test_video_ocr(video_a)
    test_video_ocr(video_b)
