# file: backend/app.py

from flask import Flask, request, jsonify
from model import analyze_image_from_bytes # Import hàm phân tích từ model.py
import io

# Khởi tạo ứng dụng Flask
app = Flask(__name__)

# Định nghĩa một API endpoint tại địa chỉ /api/identify
@app.route('/api/identify', methods=['POST'])
def identify_image_endpoint():
    print("Backend: Nhận được yêu cầu tới /api/identify")

    # Kiểm tra xem request có chứa file không
    if 'image' not in request.files:
        print("Backend: Lỗi - Không tìm thấy file 'image' trong request.")
        return jsonify({"error": "No image file provided in the request."}), 400

    image_file = request.files['image']

    # Kiểm tra xem người dùng có thực sự chọn file không
    if image_file.filename == '':
        print("Backend: Lỗi - Tên file trống.")
        return jsonify({"error": "No image file selected."}), 400

    if image_file:
        try:
            # Đọc dữ liệu của file ảnh
            image_bytes = io.BytesIO(image_file.read())
            
            # Gọi hàm phân tích ảnh
            identification_result = analyze_image_from_bytes(image_bytes)
            
            if identification_result:
                print(f"Backend: Phân tích thành công! Kết quả: {identification_result}")
                # Trả về kết quả dưới dạng JSON
                return jsonify({
                    "speciesName": identification_result.split(',')[0].capitalize(), # Chỉ lấy tên chính và viết hoa chữ cái đầu
                    "fullName": identification_result 
                })
            else:
                print("Backend: Lỗi - Hàm phân tích trả về None.")
                return jsonify({"error": "Could not analyze the image."}), 500

        except Exception as e:
            print(f"Backend: Lỗi exception: {e}")
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Unknown error."}), 500

# Dòng này để bạn có thể chạy server trực tiếp bằng lệnh `python app.py`
if __name__ == '__main__':
    # Chạy trên tất cả các địa chỉ IP của máy, cổng 5000, bật chế độ debug
    app.run(host='0.0.0.0', port=5000, debug=True)