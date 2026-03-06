import json
import sys
from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"
ENCODERS_PATH = BASE_DIR / "encoders.pkl"


def encode_with_fallback(encoder, raw_value):
  value = str(raw_value).strip()
  classes = [str(item) for item in encoder.classes_]
  if value in classes:
    return int(encoder.transform([value])[0])
  return 0


def normalize_inputs(caste, state, course):
  caste_map = {
    "GENERAL": "OC",
    "GEN": "OC",
    "OC": "OC",
    "OBC": "OBC",
    "SC": "SC",
    "ST": "ST",
    "EWS": "OC",
  }

  state_map = {
    "TAMIL NADU": "TN",
    "ANDHRA PRADESH": "AP",
    "TELANGANA": "TS",
    "TN": "TN",
    "AP": "AP",
    "TS": "TS",
  }

  course_map = {
    "B.TECH": "Engineering",
    "BTECH": "Engineering",
    "ENGINEERING": "Engineering",
    "BSC": "BSc",
    "B.SC": "BSc",
    "BCOM": "BCom",
    "B.COM": "BCom",
    "BBA": "BBA",
    "ARTS": "Arts",
  }

  normalized_caste = caste_map.get(str(caste).strip().upper(), "OC")
  normalized_state = state_map.get(str(state).strip().upper(), "TN")
  normalized_course = course_map.get(str(course).strip().upper(), "Engineering")

  return normalized_caste, normalized_state, normalized_course


def build_explanation(marks, income, caste, probability):
  reasons = []

  if income <= 250000:
    reasons.append("Income eligible")
  elif income <= 320000:
    reasons.append("Income near threshold")
  else:
    reasons.append("Income above preferred range")

  if marks >= 80:
    reasons.append("Marks strong")
  elif marks >= 65:
    reasons.append("Marks acceptable")
  else:
    reasons.append("Marks need improvement")

  if caste in {"SC", "ST", "OBC"}:
    reasons.append("Category supported")
  else:
    reasons.append("General category competition is higher")

  if probability >= 75:
    reasons.append("Overall profile fit is high")
  elif probability >= 55:
    reasons.append("Moderate eligibility likelihood")
  else:
    reasons.append("Low probability, improve profile and documents")

  return reasons


def main():
  if len(sys.argv) < 6:
    print(json.dumps({
      "probability": 0,
      "explanation": ["Missing required input fields"],
    }))
    return

  marks = float(sys.argv[1])
  income = float(sys.argv[2])
  caste = sys.argv[3]
  state = sys.argv[4]
  course = sys.argv[5]

  normalized_caste, normalized_state, normalized_course = normalize_inputs(caste, state, course)

  if not MODEL_PATH.exists() or not ENCODERS_PATH.exists():
    print(json.dumps({
      "probability": 0,
      "explanation": [
        "ML model artifacts not found",
        "Run train_model.py before prediction",
      ],
    }))
    return

  payload = joblib.load(ENCODERS_PATH)
  model = joblib.load(MODEL_PATH)

  encoders = payload.get("encoders", {})

  row = {
    "marks": marks,
    "income": income,
    "caste": encode_with_fallback(encoders["caste"], normalized_caste),
    "state": encode_with_fallback(encoders["state"], normalized_state),
    "course": encode_with_fallback(encoders["course"], normalized_course),
  }

  frame = pd.DataFrame([row], columns=["marks", "income", "caste", "state", "course"])
  probability = int(round(float(model.predict_proba(frame)[0][1]) * 100))
  probability = max(0, min(100, probability))

  print(json.dumps({
    "probability": probability,
    "explanation": build_explanation(marks, income, normalized_caste, probability),
  }))


if __name__ == "__main__":
  try:
    main()
  except Exception as error:
    print(json.dumps({
      "probability": 0,
      "explanation": [f"Prediction failed: {str(error)}"],
    }))
