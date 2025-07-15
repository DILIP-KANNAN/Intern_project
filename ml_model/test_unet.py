import torch
from src.model import UNet

model = UNet(in_channels=3, out_channels=1)
x = torch.randn((1, 3, 256, 256))  # simulate one RGB image
y = model(x)

print(f"Input shape: {x.shape}")
print(f"Output shape: {y.shape}")  # should be [1, 1, 256, 256]
