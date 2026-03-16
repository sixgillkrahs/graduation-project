from pathlib import Path

from vietocr.tool.config import Cfg


ROOT_DIR = Path(__file__).resolve().parent
OCR_CONFIG_PATH = ROOT_DIR / "sources" / "Database" / "OCR" / "config" / "seq2seq_config.yml"
OCR_MODEL_PATH = ROOT_DIR / "sources" / "Database" / "OCR" / "weights" / "seq2seq.pth"


def main():
    if not OCR_MODEL_PATH.is_file():
        raise FileNotFoundError(f"Missing OCR model weights: {OCR_MODEL_PATH}")

    config = Cfg.load_config_from_name("vgg_seq2seq")
    config["weights"] = "sources/Database/OCR/weights/seq2seq.pth"
    config["cnn"]["pretrained"] = False
    config["device"] = "cpu"
    config["predictor"]["beamsearch"] = False

    OCR_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    config.save(str(OCR_CONFIG_PATH))

    print(f"Saved OCR config to {OCR_CONFIG_PATH}")


if __name__ == "__main__":
    main()
