from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import easyocr
from PIL import Image, ImageOps
import numpy as np
from io import BytesIO
import pdfplumber

reader = easyocr.Reader(['en'])

app = FastAPI()

# 브라우저에서 Next.js가 호출할 수 있게 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_id = "Agreemind/lexglue-legalbert-unfair-tos"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)

labels = [
    "Limitation of liability", "Unilateral termination",
    "Unilateral change", "Content removal",
    "Contract by using", "Choice of law",
    "Jurisdiction", "Arbitration",
]

class RequestBody(BaseModel):
    text: str

@app.post("/classify")
def classify(body: RequestBody):
    text = body.text

    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

    with torch.no_grad():
        probs = torch.sigmoid(model(**inputs).logits).squeeze()

    results = []
    for label, prob in sorted(zip(labels, probs), key=lambda x: x[1], reverse=True):
        results.append({
            "label": label,
            "score": float(prob)
        })

    return {"results": results}

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    contents = await file.read()

    if file.filename and file.filename.lower().endswith(".pdf"):
        text = ""
        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

        return {"text": text.strip()}

    image = Image.open(BytesIO(contents)).convert("L")
    image = ImageOps.autocontrast(image)
    image_np = np.array(image)

    result = reader.readtext(image_np, detail=0, paragraph=True)
    text = " ".join(result)

    return {"text": text}