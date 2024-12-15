from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import os
from database import db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (use specific origins in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_image(
    original_image: UploadFile, 
    mask_image: UploadFile, 
   
):
    # Save images locally
    original_image_path = Path(UPLOAD_DIR) / original_image.filename
    mask_image_path = Path(UPLOAD_DIR) / mask_image.filename

    with original_image.file as source, open(original_image_path, "wb") as dest:
        shutil.copyfileobj(source, dest)

    with mask_image.file as source, open(mask_image_path, "wb") as dest:
        shutil.copyfileobj(source, dest)

    # Save metadata to MongoDB
    metadata = {
        "original_image_path": str(original_image_path),
        "mask_image_path": str(mask_image_path),
       
    }
    result = await db.images.insert_one(metadata)

    return JSONResponse(
        content={"message": "Images uploaded successfully", "id": str(result.inserted_id)}
    )

@app.get("/image/{image_id}")
async def get_image(image_id: str):
    image_data = await db.images.find_one({"_id": ObjectId(image_id)})
    if not image_data:
        return JSONResponse(content={"error": "Image not found"}, status_code=404)

    return image_data
