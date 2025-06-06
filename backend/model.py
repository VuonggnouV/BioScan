# file: backend/model.py

from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import os # 1. THÊM IMPORT 'os' ĐỂ ĐỌC BIẾN MÔI TRƯỜNG

print("Backend: Đang tải model AI (phiên bản MobileViT), vui lòng chờ...")

try:
    # 2. LẤY TOKEN TỪ BIẾN MÔI TRƯỜNG MÀ BẠN ĐÃ CÀI ĐẶT TRÊN RENDER
    HF_TOKEN = os.getenv('HUGGING_FACE_TOKEN')

    # 3. THÊM `token=HF_TOKEN` VÀO CẢ HAI LỆNH TẢI VỀ
    PROCESSOR = ViTImageProcessor.from_pretrained('microsoft/mobilevit-small', token=HF_TOKEN)
    MODEL = ViTForImageClassification.from_pretrained('microsoft/mobilevit-small', token=HF_TOKEN)
    
    print("Backend: Tải model AI thành công!")
except Exception as e:
    print(f"Backend: Lỗi nghiêm trọng khi tải model AI: {e}")
    PROCESSOR = None
    MODEL = None

# Hàm analyze_image_from_bytes giữ nguyên không đổi
def analyze_image_from_bytes(image_bytes):
    if not MODEL or not PROCESSOR:
        raise Exception("Model AI không khả dụng hoặc chưa được tải.")

    try:
        image = Image.open(image_bytes).convert("RGB")
        inputs = PROCESSOR(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = MODEL(**inputs)
            logits = outputs.logits

        predicted_class_idx = logits.argmax(-1).item()
        result_label = MODEL.config.id2label[predicted_class_idx]
        
        return result_label

    except Exception as e:
        print(f"Backend: Lỗi trong quá trình phân tích ảnh: {e}")
        return None