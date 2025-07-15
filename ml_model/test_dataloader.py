from src.dataset import get_dataloader

images_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Image"
masks_dir = r"C:\Users\dilip\ML\intern report\ml_model\data\raw\Mask"

loader = get_dataloader(images_dir, masks_dir, batch_size=4)

for batch_idx, (images, masks) in enumerate(loader):
    print(f"Batch {batch_idx}")
    print(f"Image batch shape: {images.shape}")  # should be [B, 3, 256, 256]
    print(f"Mask batch shape: {masks.shape}")    # should be [B, 1, 256, 256]")
    break  # test only one batch
