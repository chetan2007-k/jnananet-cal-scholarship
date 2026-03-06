import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "eligibility_dataset.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
ENCODERS_PATH = BASE_DIR / "encoders.pkl"

CATEGORICAL_COLUMNS = ["caste", "state", "course"]
FEATURE_COLUMNS = ["marks", "income", "caste", "state", "course"]


def train_and_save_model():
  if not DATASET_PATH.exists():
    raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

  df = pd.read_csv(DATASET_PATH)

  encoders = {}
  for column in CATEGORICAL_COLUMNS:
    encoder = LabelEncoder()
    df[column] = encoder.fit_transform(df[column].astype(str).str.strip())
    encoders[column] = encoder

  x_train = df[FEATURE_COLUMNS]
  y_train = df["eligible"]

  model = LogisticRegression(max_iter=1000)
  model.fit(x_train, y_train)

  joblib.dump(model, MODEL_PATH)
  joblib.dump({
    "encoders": encoders,
    "categorical_columns": CATEGORICAL_COLUMNS,
    "feature_columns": FEATURE_COLUMNS,
  }, ENCODERS_PATH)

  print(json.dumps({
    "status": "ok",
    "model_path": str(MODEL_PATH),
    "encoders_path": str(ENCODERS_PATH),
    "rows": int(df.shape[0]),
  }))


if __name__ == "__main__":
  train_and_save_model()
