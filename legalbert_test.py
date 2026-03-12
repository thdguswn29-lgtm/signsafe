from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_id = "Agreemind/lexglue-legalbert-unfair-tos"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)

labels = [
    "Limitation of liability", "Unilateral termination",
    "Unilateral change", "Content removal",
    "Contract by using", "Choice of law",
    "Jurisdiction", "Arbitration",
]

text = "The landlord may terminate this lease at any time without cause and without prior notice to the tenant."

inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

with torch.no_grad():
    probs = torch.sigmoid(model(**inputs).logits).squeeze()

for label, prob in sorted(zip(labels, probs), key=lambda x: x[1], reverse=True):
    print(f"{label}: {prob:.3f}")