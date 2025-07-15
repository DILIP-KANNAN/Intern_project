import torch
import torch.nn as nn
import torch.optim as optim
from src.dataset import get_dataloader
from src.model import UNet
from tqdm import tqdm
import os

# Hyperparameters
BATCH_SIZE = 4
LR = 1e-4
EPOCHS = 20
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Paths
images_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Image"
masks_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Mask"
save_path = r"C:\Users\dilip\ML\intern report\ml_model\outputs\models"
os.makedirs(save_path, exist_ok=True)

# Load data
train_loader = get_dataloader(images_dir, masks_dir, batch_size=BATCH_SIZE)

# Model, loss, optimizer
model = UNet(in_channels=3, out_channels=1).to(DEVICE)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

# Training loop
for epoch in range(EPOCHS):
    model.train()
    epoch_loss = 0
    loop = tqdm(train_loader, total=len(train_loader), desc=f"Epoch [{epoch+1}/{EPOCHS}]")

    for images, masks in loop:
        images = images.to(DEVICE)
        masks = masks.to(DEVICE)

        preds = model(images)
        loss = criterion(preds, masks)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        epoch_loss += loss.item()
        loop.set_postfix(loss=loss.item())

    avg_loss = epoch_loss / len(train_loader)
    print(f"Epoch {epoch+1}/{EPOCHS} - Average Loss: {avg_loss:.4f}")

    # Save checkpoint
    if epoch == 19:
        torch.save(model, os.path.join(save_path, f"model.pth"))
print("Training complete!")
