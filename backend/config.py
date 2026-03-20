import os
from dotenv import load_dotenv
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
EXTRACTION_MODEL = "anthropic/claude-sonnet-4"
CLASSIFIER_MODEL_NAME = "katanemo/Arch-Router-1.5B"

DB_PATH = Path(__file__).parent / "data" / "controlplane.db"
CONTRACTS_DIR = Path(__file__).parent / "data" / "contracts"
SAMPLE_CONTRACTS_DIR = Path(__file__).parent / "data" / "sample_contracts"
FALLBACK_PROFILES_DIR = Path(__file__).parent / "data" / "fallback_profiles"

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY not set. LLM calls will fail.")
