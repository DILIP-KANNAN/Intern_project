import os
import io
import base64

from flask_cors import CORS
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
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
        if not url:
            raise RuntimeError("MODEL_URL environment variable not set, cannot download model.")
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
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False))
model.eval()

# Transformations for input to the model
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])


@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint:
    - Takes an image file ('file')
    - Runs U-Net to get flood mask (256x256)
    - Computes:
        * flood_percent (0–100)
        * risk_level (Low / Medium / High)
    - Resizes mask back to original image size
    - Returns JSON with:
        * mask_image_base64 (PNG)
        * flood_percent
        * risk_level
        * prediction (label text)
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    try:
        img = Image.open(file).convert('RGB')
    except Exception:
        return jsonify({'error': 'Invalid image file'}), 400

    original_width, original_height = img.size

    # Preprocess for model
    input_tensor = transform(img).unsqueeze(0).to(DEVICE)  # shape: [1, 3, 256, 256]

    with torch.no_grad():
        pred = model(input_tensor)  # shape: [1, 1, 256, 256]

    # Convert prediction to binary mask (0 or 1)
    pred_array = pred.squeeze().cpu().numpy()  # [256, 256]
    binary_mask = (pred_array > 0.5).astype(np.uint8)  # 0 or 1

    # --- Compute flood percentage ---
    flood_pixels = int(binary_mask.sum())
    total_pixels = int(binary_mask.size)
    if total_pixels == 0:
        flood_percent = 0.0
    else:
        flood_percent = (flood_pixels / total_pixels) * 100.0

    # --- Determine risk level based on flood percentage ---
    if flood_percent < 10:
        risk_level = "Low"
    elif flood_percent < 40:
        risk_level = "Medium"
    else:
        risk_level = "High"

    # --- Prepare mask image in original size ---
    # Convert 0/1 mask to 0/255 uint8 image
    mask_255 = (binary_mask * 255).astype(np.uint8)
    mask_img_256 = Image.fromarray(mask_255)

    # Resize mask to original image size so frontend overlay matches exactly
    mask_img_original_size = mask_img_256.resize(
        (original_width, original_height),
        resample=Image.NEAREST
    )

    # Encode mask image as PNG in base64 for easy use in frontend
    buf = io.BytesIO()
    mask_img_original_size.save(buf, format='PNG')
    buf.seek(0)
    mask_bytes = buf.getvalue()
    mask_base64 = base64.b64encode(mask_bytes).decode('utf-8')

    # You already have the original image on the frontend via the uploaded file,
    # so no need to resend it from backend.
    # Just return insights + mask image as base64.
    response = {
        "mask_image_base64": mask_base64,
        "flood_percent": round(flood_percent, 2),
        "risk_level": risk_level,
        "prediction": "Flood Detected"
    }

    return jsonify(response), 200


@app.route('/')
def home():
    return "Flood Segmentation UNet API is running."


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
