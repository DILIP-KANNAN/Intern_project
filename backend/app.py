import os
from flask_cors import CORS
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_file
import torch
from torchvision import transforms

from src.model import UNet

app = Flask(__name__)
CORS(app)
# Paths
MODEL_PATH = r"C:\Users\dilip\ML\intern report\backend\model\model.pth"

# Device
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Load model
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
    app.run(debug=True, port=5000)
