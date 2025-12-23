import os

import numpy as np
import yolov5
from fastapi import File, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from PIL import Image
from vietocr.tool.config import Cfg
from vietocr.tool.predictor import Predictor

import sources.Controllers.config as cfg
from sources import app, templates 
from sources.Controllers import utils

""" ---- Setup ---- """

CORNER_MODEL = yolov5.load(cfg.CORNER_MODEL_PATH)
CONTENT_MODEL = yolov5.load(cfg.CONTENT_MODEL_PATH)

CONTENT_MODEL.conf = cfg.CONF_CONTENT_THRESHOLD
CONTENT_MODEL.iou = cfg.IOU_CONTENT_THRESHOLD

UPLOAD_FOLDER = cfg.UPLOAD_FOLDER
SAVE_DIR = cfg.SAVE_DIR

""" ---- OCR Setup ---- """
config = Cfg.load_config_from_name("vgg_seq2seq")
config["cnn"]["pretrained"] = False
config["device"] = cfg.DEVICE
config["predictor"]["beamsearch"] = False
detector = Predictor(config)


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@app.post("/uploader")
async def upload(file: UploadFile = File(...)):
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)
    

    file_location = f"./{UPLOAD_FOLDER}/{file.filename}"
    contents = await file.read()
    with open(file_location, "wb") as f:
        f.write(contents)

    if not file_location.lower().endswith((".png", ".jpg", ".jpeg")):
        os.remove(file_location)
        error = "This file is not supported! Only PNG, JPG, JPEG are allowed."
        return JSONResponse(status_code=404, content={"message": error})

    return await extract_info(image_path=file_location)


async def extract_info(image_path: str = None):
    """Extract information from the uploaded image."""
    if not image_path:
        error = "No image to process!"
        return JSONResponse(status_code=400, content={"message": error})

    if os.path.isdir(SAVE_DIR):
        for f in os.listdir(SAVE_DIR):
            os.remove(os.path.join(SAVE_DIR, f))
    else:
        os.mkdir(SAVE_DIR)

    img = image_path

    CORNER = CORNER_MODEL(img)
    predictions = CORNER.pred[0]
    categories = predictions[:, 5].tolist()  
    if len(categories) != 4:
        error = "Detecting corner failed! Please ensure the image shows a clear ID card."
        return JSONResponse(status_code=401, content={"message": error})
    boxes = utils.class_Order(predictions[:, :4].tolist(), categories)  
    IMG = Image.open(img)
    center_points = list(map(utils.get_center_point, boxes))

    """ Temporary fixing """
    c2, c3 = center_points[2], center_points[3]
    c2_fix, c3_fix = (c2[0], c2[1] + 30), (c3[0], c3[1] + 30)
    center_points = [center_points[0], center_points[1], c2_fix, c3_fix]
    center_points = np.asarray(center_points)
    aligned = utils.four_point_transform(IMG, center_points)
    aligned = Image.fromarray(aligned)

    CONTENT = CONTENT_MODEL(aligned)
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
            s = detector.predict(img_)
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
