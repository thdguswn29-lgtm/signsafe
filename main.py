from io import BytesIO
from typing import Dict, List

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader


app = FastAPI(title="SignSafe Legal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


LABELS = [
    "Limitation of liability",
    "Unilateral termination",
    "Unilateral change",
    "Content removal",
    "Contract by using",
    "Choice of law",
    "Jurisdiction",
    "Arbitration",
]

RULE_KEYWORDS: Dict[str, List[str]] = {
    "Limitation of liability": ["liability", "not liable", "limit liability", "waive liability"],
    "Unilateral termination": ["terminate", "termination", "cancel without notice", "evict"],
    "Unilateral change": ["may change", "can change", "modify terms", "without consent"],
    "Content removal": ["remove content", "remove listing", "take down", "delete content"],
    "Contract by using": ["by using", "continued use", "accept these terms", "deemed acceptance"],
    "Choice of law": ["choice of law", "governed by", "laws of"],
    "Jurisdiction": ["jurisdiction", "exclusive venue", "court of"],
    "Arbitration": ["arbitration", "binding arbitration", "class action waiver"],
}


class RequestBody(BaseModel):
    text: str


@app.get("/")
def root():
    return {"ok": True, "service": "SignSafe FastAPI backend"}


@app.post("/classify")
def classify(body: RequestBody):
    text = (body.text or "").lower()
    total_len = max(len(text), 1)
    results = []

    for label in LABELS:
        keywords = RULE_KEYWORDS.get(label, [])
        hits = sum(1 for kw in keywords if kw in text)
        density_bonus = min(0.2, (hits * 40) / total_len)
        score = min(0.99, 0.05 + (hits * 0.22) + density_bonus)
        results.append({"label": label, "score": float(round(score, 4))})

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": results}


def _extract_text_from_pdf(contents: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(contents))
        chunks = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                chunks.append(page_text.strip())
        return "\n".join(chunks).strip()
    except Exception:
        return ""


def _decode_text_bytes(contents: bytes) -> str:
    for encoding in ("utf-8", "cp949", "latin-1"):
        try:
            text = contents.decode(encoding, errors="ignore").strip()
            if text:
                return text
        except Exception:
            continue
    return ""


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    contents = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        text = _extract_text_from_pdf(contents)
    else:
        text = _decode_text_bytes(contents)

    if not text:
        text = (
            "OCR could not extract text from this file. "
            "Please paste lease text manually for reliable analysis."
        )

    return {"text": text}
