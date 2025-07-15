import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader

class FloodDataset(Dataset):
    def __init__(self, images_dir, masks_dir, transform=None, target_size=(256, 256)):
        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.image_files = sorted([f for f in os.listdir(images_dir) if f.endswith('.jpg')])
        self.mask_files = sorted([f for f in os.listdir(masks_dir) if f.endswith('.png')])
        self.transform = transform
        self.target_size = target_size

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        # Load image
        img_path = os.path.join(self.images_dir, self.image_files[idx])
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, self.target_size, interpolation=cv2.INTER_AREA)
        image = image / 255.0  # normalize to [0, 1]
        image = np.transpose(image, (2, 0, 1))  # to channel-first for PyTorch
        image = torch.tensor(image, dtype=torch.float32)

        # Load mask
        mask_path = os.path.join(self.masks_dir, self.mask_files[idx])
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        mask = cv2.resize(mask, self.target_size, interpolation=cv2.INTER_NEAREST)
        mask = (mask > 127).astype(np.float32)  # binarize
        mask = torch.tensor(mask, dtype=torch.float32).unsqueeze(0)  # add channel dimension

        return image, mask

def get_dataloader(images_dir, masks_dir, batch_size=8, shuffle=True):
    dataset = FloodDataset(images_dir, masks_dir)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)
    return loader
