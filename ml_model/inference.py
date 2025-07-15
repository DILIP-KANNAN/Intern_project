import torch
from src.model import UNet
from src.dataset import FloodDataset
import matplotlib.pyplot as plt
import numpy as np
import os

# Paths
images_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Image"
masks_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Mask"
model_path = r"C:\Users\dilip\ML\intern report\ml_model\outputs\models\unet_epoch20.pth"

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Load dataset
dataset = FloodDataset(images_dir, masks_dir)
model = UNet(in_channels=3, out_channels=1).to(DEVICE)
model.load_state_dict(torch.load(model_path, map_location=DEVICE))
model.eval()

# Visualize predictions for a few samples
for idx in range(5):  # Visualize 5 examples
    image, mask = dataset[idx]
    input_img = image.unsqueeze(0).to(DEVICE)  # add batch dim

    with torch.no_grad():
        pred = model(input_img)

    pred_mask = (pred.squeeze().cpu().numpy() > 0.5).astype(np.uint8)
    true_mask = mask.squeeze().numpy()
    image_np = np.transpose(image.numpy(), (1, 2, 0))

    fig, axs = plt.subplots(1, 3, figsize=(15, 5))
    axs[0].imshow(image_np)
    axs[0].set_title("Original Image")
    axs[1].imshow(true_mask, cmap='gray')
    axs[1].set_title("Ground Truth Mask")
    axs[2].imshow(pred_mask, cmap='gray')
    axs[2].set_title("Predicted Mask")
    for ax in axs:
        ax.axis('off')
    plt.show()
