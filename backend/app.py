import os
from flask_cors import CORS
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_file
import torch
from torchvision import transforms
import requests

from src.model import UNet

app = Flask(__name__)
CORS(app)

# Device
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Download model dynamically if not present
def download_model():
    url = os.getenv("MODEL_URL")
    model_dir = "model"
    model_path = os.path.join(model_dir, "model.pth")

    if not os.path.exists(model_path):
        print("Downloading model from", url)
        os.makedirs(model_dir, exist_ok=True)
        response = requests.get(url, stream=True)
        with open(model_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Model download complete.")
    else:
        print("Model already exists, skipping download.")

download_model()

# Load model
MODEL_PATH = "model/model.pth"
model = UNet(in_channels=3, out_channels=1).to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()
# Transformations
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    img = Image.open(file).convert('RGB')
    input_tensor = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        pred = model(input_tensor)
    
    pred_mask = (pred.squeeze().cpu().numpy() > 0.5).astype(np.uint8) * 255  # 0 and 255

    # Convert to PIL for sending as image
    pred_img = Image.fromarray(pred_mask)

    # Save to buffer
    buf = io.BytesIO()
    pred_img.save(buf, format='PNG')
    buf.seek(0)

    return send_file(buf, mimetype='image/png')

@app.route('/')
def home():
    return "Flood Segmentation UNet API is running."

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
