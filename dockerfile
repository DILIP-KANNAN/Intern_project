# Use a lightweight Python image
FROM python:3.10-slim

# Set work directory inside the container
WORKDIR /app

# Install system dependencies needed by Pillow / Torchvision etc.
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code into the container
COPY backend/ .

# IMPORTANT:
# Ensure model/model.pth exists in the build context so the app
# finds the file and skips downloading in download_model()
# (your app.py already handles this logic)

# Expose Flask port
EXPOSE 5000

# Run the app
# If your app has `if __name__ == "__main__": app.run(...)`, this is fine
CMD ["python", "app.py"]
  