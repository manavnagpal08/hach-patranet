import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["FLAGS_enable_pir_api"] = "0"

try:
    from paddleocr import PaddleOCR
    print("Loading PaddleOCR...")
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("Running OCR on sample_invoice.png...")
    result = ocr.ocr("sample_invoice.png")
    
    extracted = ""
    for idx in range(len(result)):
        res = result[idx]
        if res:
            for line in res:
                extracted += line[1][0] + "\n"
    print("--- SUCCESS ---")
    print(extracted)
except Exception as e:
    print(f"FAILED WITH EXACT ERROR: {e}")
