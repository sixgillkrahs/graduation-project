import io
import os

import numpy as np
import yolov5
from fastapi import APIRouter, File, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from PIL import Image, ImageOps
from vietocr.tool.config import Cfg
from vietocr.tool.predictor import Predictor

import sources.Controllers.config as cfg
from sources.Controllers import utils

router = APIRouter()

""" ---- Setup ---- """
CORNER_MODEL = None
CONTENT_MODEL = None
detector = None

SAVE_DIR = cfg.SAVE_DIR


def load_ocr_config():
    if os.path.isfile(cfg.OCR_CFG):
        config = Cfg.load_config_from_file(cfg.OCR_CFG)
    else:
        config = Cfg.load_config_from_name("vgg_seq2seq")

    config["weights"] = cfg.OCR_MODEL_PATH
    config["cnn"]["pretrained"] = False
    config["device"] = cfg.DEVICE
    config["predictor"]["beamsearch"] = False
    return config


def ensure_ocr_models():
    global CORNER_MODEL, CONTENT_MODEL, detector

    if CORNER_MODEL is not None and CONTENT_MODEL is not None and detector is not None:
        return CORNER_MODEL, CONTENT_MODEL, detector

    CORNER_MODEL = yolov5.load(cfg.CORNER_MODEL_PATH)
    CONTENT_MODEL = yolov5.load(cfg.CONTENT_MODEL_PATH)

    CONTENT_MODEL.conf = cfg.CONF_CONTENT_THRESHOLD
    CONTENT_MODEL.iou = cfg.IOU_CONTENT_THRESHOLD

    config = load_ocr_config()
    detector = Predictor(config)

    return CORNER_MODEL, CONTENT_MODEL, detector


@router.post("/uploader")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        error = "This file is not supported! Only PNG, JPG, JPEG are allowed."
        return JSONResponse(status_code=404, content={"message": error})

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    return await extract_info(image_input=image)


async def extract_info(image_input=None):
    """Extract information from the uploaded image."""
    corner_model, content_model, text_detector = ensure_ocr_models()

    if image_input is None:
        error = "No image to process!"
        return JSONResponse(status_code=400, content={"message": error})

    if os.path.isdir(SAVE_DIR):
        for f in os.listdir(SAVE_DIR):
            os.remove(os.path.join(SAVE_DIR, f))
    else:
        os.mkdir(SAVE_DIR)

    if isinstance(image_input, str):
        IMG = Image.open(image_input)
    else:
        IMG = image_input

    # Normalize orientation via EXIF data
    # 1. Tự động xoay ảnh theo EXIF metadata (nếu có)
    IMG = ImageOps.exif_transpose(IMG)

    # Convert to RGB mode if needed to avoid JPEG saving errors for RGBA images
    # 2. Chuyển đổi sang hệ màu RGB (tránh lỗi lưu ảnh RGBA sang định dạng JPEG)
    if IMG.mode != "RGB":
        IMG = IMG.convert("RGB")

    best_img = None
    best_predictions = None
    best_categories = None

    # Try 4 orientations (0, 90, 180, 270 degrees) to find the correct upright position
    # 3. Thử xoay ảnh ở 4 hướng để tìm chiều đúng của thẻ ID
    for angle in [0, 90, 180, 270]:
        if angle == 0:
            rotated_img = IMG
        elif angle == 90:
            rotated_img = IMG.transpose(Image.ROTATE_90)
        elif angle == 180:
            rotated_img = IMG.transpose(Image.ROTATE_180)
        elif angle == 270:
            rotated_img = IMG.transpose(Image.ROTATE_270)

        # Phát hiện 4 góc của thẻ ID
        CORNER = corner_model(rotated_img)
        predictions = CORNER.pred[0]
        categories = predictions[:, 5].tolist()

        # Kiểm tra xem có phát hiện đủ 4 góc không
        if len(categories) == 4 and len(set(map(int, categories))) == 4:
            best_img = rotated_img
            best_predictions = predictions
            best_categories = categories
            break

        # Nếu chưa tìm được ảnh đúng hướng thì giữ tạm ảnh đầu tiên có 4 góc
        # Keep the first rotation that yields 4 corners if no perfect match (4 unique corners) is found yet
        if len(categories) == 4 and best_predictions is None:
            best_img = rotated_img
            best_predictions = predictions
            best_categories = categories

    if best_img is None:
        # Sử dụng ảnh gốc đã xoay theo EXIF
        best_img = IMG
        CORNER = corner_model(IMG)
        best_predictions = CORNER.pred[0]
        best_categories = best_predictions[:, 5].tolist()

    # Gán giá trị tìm được vào biến IMG
    IMG = best_img
    predictions = best_predictions
    categories = best_categories

    # Kiểm tra xem có phát hiện đủ 4 góc không
    if len(categories) != 4:
        error = "Detecting corner failed! Please ensure the image shows a clear ID card."
        return JSONResponse(status_code=401, content={"message": error})
    
    # Sắp xếp thứ tự các góc (trên-trái, trên-phải, dưới-phải, dưới-trái)
    boxes = utils.class_Order(predictions[:, :4].tolist(), categories)

    # Tính toán các điểm trung tâm của 4 góc
    center_points = list(map(utils.get_center_point, boxes))

    """ Temporary fixing """
    c2, c3 = center_points[2], center_points[3]
    c2_fix, c3_fix = (c2[0], c2[1] + 30), (c3[0], c3[1] + 30)
    center_points = [center_points[0], center_points[1], c2_fix, c3_fix]
    center_points = np.asarray(center_points)
    aligned = utils.four_point_transform(IMG, center_points)
    aligned = Image.fromarray(aligned)

    CONTENT = content_model(aligned)
    predictions = CONTENT.pred[0]
    categories = predictions[:, 5].tolist()
    if 7 not in categories:
        if len(categories) < 9:
            error = "Missing fields! Detecting content failed! Please ensure the ID card is fully visible."
            return JSONResponse(status_code=402, content={"message": error})
    elif 7 in categories:
        if len(categories) < 10:
            error = "Missing fields! Detecting content failed! Please ensure the ID card is fully visible."
            return JSONResponse(status_code=402, content={"message": error})

    boxes = predictions[:, :4].tolist()

    """ Non Maximum Suppression """
    boxes, categories = utils.non_max_suppression_fast(np.array(boxes), categories, 0.7)
    boxes = utils.class_Order(boxes, categories)

    if not os.path.isdir(SAVE_DIR):
        os.mkdir(SAVE_DIR)
    else:
        for f in os.listdir(SAVE_DIR):
            os.remove(os.path.join(SAVE_DIR, f))

    for index, box in enumerate(boxes):
        left, top, right, bottom = box
        if 5 < index < 9:
            right = right + 100
        cropped_image = aligned.crop((left, top, right, bottom))
        cropped_image.save(os.path.join(SAVE_DIR, f"{index}.jpg"))

    FIELDS_DETECTED = []
    for idx, img_crop in enumerate(sorted(os.listdir(SAVE_DIR))):
        current_img_path = os.path.join(SAVE_DIR, img_crop)
        if os.path.isfile(current_img_path) and current_img_path.lower().endswith((".png", ".jpg", ".jpeg")):
            img_ = Image.open(current_img_path)
            s = text_detector.predict(img_)
            FIELDS_DETECTED.append(s)

    if 7 in categories:
        if len(FIELDS_DETECTED) > 7:
            FIELDS_DETECTED = (
                FIELDS_DETECTED[:6]
                + [FIELDS_DETECTED[6] + ", " + FIELDS_DETECTED[7]]
                + [FIELDS_DETECTED[8]]
            )
        elif len(FIELDS_DETECTED) == 7 and 7 in categories:
            pass

    response = {"data": FIELDS_DETECTED}

    response = jsonable_encoder(response)
    return JSONResponse(content=response)
