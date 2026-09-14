import cv2
import easyocr
import csv
import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VIDEOS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_videos")
CSV_OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anpr_real_benchmark.csv")

def calculate_levenshtein(s1, s2):
    if len(s1) < len(s2):
        return calculate_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def run_real_empirical_benchmark():
    print("=" * 70)
    print("RUNNING REAL EMPIRICAL ANPR BENCHMARK (ACTUAL EASYOCR MODEL RUN)")
    print("Pipeline: OpenCV Video Frame Sampler + CLAHE + EasyOCR Engine")
    print("=" * 70)

    print("[+] Initializing EasyOCR English Reader...")
    reader = easyocr.Reader(['en'], gpu=False)

    video_files = [
        ("cam1.mp4", "CAM-01: MGIT Main Gate", "TS07EA9012"),
        ("cam2.mp4", "CAM-02: Gandipet Circle", "TS07EA9012"),
        ("cam3.mp4", "CAM-03: Kokapet SEZ Junction", "TS07EA9012"),
        ("cam4.mp4", "CAM-04: Narsingi Rotary", "TS07EA9012"),
    ]

    headers = ["sample_id", "video_source", "camera_node", "timestamp_sec", "ground_truth", "ocr_raw_text", "confidence", "edit_distance", "match_status"]
    
    csv_file = open(CSV_OUTPUT_PATH, "w", newline="", encoding="utf-8")
    writer = csv.DictWriter(csv_file, fieldnames=headers)
    writer.writeheader()
    csv_file.flush()

    benchmark_rows = []
    sample_counter = 1

    for vid_file, cam_name, ground_truth in video_files:
        video_path = os.path.join(VIDEOS_DIR, vid_file)
        if not os.path.exists(video_path):
            print(f"[!] Video file not found: {video_path}")
            continue

        print(f"\n[+] Extracting frames from video feed: {vid_file} ({cam_name})...")
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        
        # Sample frames every 2.0 seconds (~60 frames) for fast execution
        sample_step = int(fps * 2.0)
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_step == 0:
                # CLAHE Contrast Enhancement
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)

                # EasyOCR Inference
                results = reader.readtext(enhanced)

                detected_text = "NO_TEXT_DETECTED"
                confidence = 0.0

                if results:
                    best_match = max(results, key=lambda x: x[2])
                    raw_str = "".join(e for e in best_match[1] if e.isalnum()).upper()
                    if raw_str:
                        detected_text = raw_str
                        confidence = float(best_match[2])

                edit_dist = calculate_levenshtein(detected_text, ground_truth)
                is_exact = (detected_text == ground_truth)

                if is_exact:
                    status = "EXACT_MATCH"
                elif edit_dist <= 3 and len(detected_text) >= 5:
                    status = "PARTIAL_MATCH"
                else:
                    status = "MISREAD / NOISE"

                timestamp_sec = round(frame_idx / fps, 2)

                row_data = {
                    "sample_id": f"SAMP-{sample_counter:03d}",
                    "video_source": vid_file,
                    "camera_node": cam_name,
                    "timestamp_sec": timestamp_sec,
                    "ground_truth": ground_truth,
                    "ocr_raw_text": detected_text,
                    "confidence": round(confidence, 4),
                    "edit_distance": edit_dist,
                    "match_status": status
                }

                benchmark_rows.append(row_data)
                writer.writerow(row_data)
                csv_file.flush()

                print(f"  Sample #{sample_counter:02d} | Time: {timestamp_sec:4.1f}s | Raw OCR: '{detected_text:<12}' | Conf: {confidence:.4f} | Status: {status}")
                sample_counter += 1

            frame_idx += 1

        cap.release()

    csv_file.close()

    # Calculate Summary Stats
    n = len(benchmark_rows)
    exact_count = sum(1 for r in benchmark_rows if r["match_status"] == "EXACT_MATCH")
    partial_count = sum(1 for r in benchmark_rows if r["match_status"] == "PARTIAL_MATCH")
    exact_accuracy = (exact_count / n * 100) if n > 0 else 0.0
    usable_accuracy = ((exact_count + partial_count) / n * 100) if n > 0 else 0.0
    avg_conf = sum(r["confidence"] for r in benchmark_rows if r["confidence"] > 0) / max(1, sum(1 for r in benchmark_rows if r["confidence"] > 0))

    print("\n" + "=" * 70)
    print("REAL EMPIRICAL MODEL BENCHMARK RESULTS:")
    print(f"  - Total Real Frame Samples Evaluated : {n}")
    print(f"  - Full-Plate Exact Match Count       : {exact_count}/{n} ({exact_accuracy:.1f}%)")
    print(f"  - Usable / Partial Character Matches : {exact_count + partial_count}/{n} ({usable_accuracy:.1f}%)")
    print(f"  - Average Model Confidence (Non-Zero): {avg_conf:.4f}")
    print(f"  - Output Benchmark CSV Path          : {CSV_OUTPUT_PATH}")
    print("=" * 70 + "\n")

    return benchmark_rows

if __name__ == "__main__":
    run_real_empirical_benchmark()
