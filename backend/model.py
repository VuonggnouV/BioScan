# file: backend/model.py

from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch

# In thông báo để biết tiến trình
print("Backend: Đang tải model AI, quá trình này có thể mất vài phút...")

# Tải model và processor một lần duy nhất khi server khởi động.
# Điều này giúp các lần gọi API sau này nhanh hơn rất nhiều.
try:
    PROCESSOR = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
    MODEL = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')
    print("Backend: Tải model AI thành công!")
except Exception as e:
    print(f"Backend: Lỗi nghiêm trọng khi tải model AI: {e}")
    PROCESSOR = None
    MODEL = None

def analyze_image_from_bytes(image_bytes):
    """
    Hàm này nhận dữ liệu byte của một hình ảnh, dùng model để phân tích
    và trả về tên của đối tượng được nhận dạng có khả năng cao nhất.
    """
    if not MODEL or not PROCESSOR:
        raise Exception("Model AI không khả dụng hoặc chưa được tải.")

    try:
        # Mở ảnh từ dữ liệu byte và chuyển sang định dạng RGB
        image = Image.open(image_bytes).convert("RGB")
        
        # Dùng processor để chuẩn bị ảnh theo đúng định dạng model yêu cầu
        inputs = PROCESSOR(images=image, return_tensors="pt")
        
        # Chạy model để dự đoán (torch.no_grad() giúp tối ưu hiệu suất)
        with torch.no_grad():
            outputs = MODEL(**inputs)
            logits = outputs.logits

        # Lấy ra dự đoán có điểm số cao nhất
        predicted_class_idx = logits.argmax(-1).item()
        
        # Trả về nhãn (tên) tương ứng với dự đoán đó
        result_label = MODEL.config.id2label[predicted_class_idx]
        
        return result_label

    except Exception as e:
        print(f"Backend: Lỗi trong quá trình phân tích ảnh: {e}")
        return None