import time
import json
from database import SessionLocal, Document, ExtractionResult
from models import model_manager

def process_document(doc_id: int):
    """
    Background worker that runs the OCR and AI Pipeline.
    Strictly unloads models between steps.
    """
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    
    if not doc:
        db.close()
        return

    doc.status = "Processing"
    db.commit()

    try:
        # STEP 1: OCR
        doc.status = "Loading EasyOCR Model..."
        db.commit()
        
        ocr = model_manager.load_ocr()
        
        doc.status = "Extracting Text (OCR)..."
        db.commit()
        
        print(f"Running EasyOCR on {doc.filepath}")
        
        # EasyOCR expects an image. If it's a PDF, this might throw an error unless we use pdf2image.
        # Assuming the user uploads an image for the test.
        try:
            result = ocr.readtext(doc.filepath)
            
            # Extract text blocks
            extracted_text = ""
            for res in result:
                # res is (bbox, text, prob)
                extracted_text += res[1] + "\n"
        except Exception as e:
            print(f"EasyOCR Error on file {doc.filepath}: {e}")
            raise e
        
        # Unload OCR to free memory!
        model_manager.unload_ocr()

        # STEP 2: AI Structuring
        doc.status = "Loading Llama 3.2 1B Model..."
        db.commit()
        
        llm = model_manager.load_llm()
        
        doc.status = "Analyzing with Llama AI..."
        db.commit()
        if llm:
            print("Running Llama 3.2 1B for JSON structuring...")
            prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Extract structured data from the OCR text into JSON.
Return ONLY valid JSON matching this schema exactly:
{{
  "document_type": "Invoice",
  "key_fields": {{"Total Amount": "...", "Vendor": "..."}},
  "tables": [
    {{"Description": "...", "Amount": "..."}}
  ]
}}
<|eot_id|><|start_header_id|>user<|end_header_id|>
TEXT:
{extracted_text[:1200]}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
            response = llm(prompt, max_tokens=300, stop=["<|eot_id|>"])
            response_text = response['choices'][0]['text'].strip()
            
            # Very basic JSON parsing from response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                import json
                try:
                    structured_data = json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    print("Failed to parse JSON, falling back")
                    structured_data = {"raw_llm_output": response_text}
            else:
                structured_data = {"raw_llm_output": response_text}
        else:
            structured_data = {"error": "Llama model not loaded or missing."}

        # Unload LLM
        model_manager.unload_llm()

        # Save Results
        ext_result = ExtractionResult(
            document_id=doc.id,
            raw_text=extracted_text,
            json_structured=structured_data,
            tables=[],
            images=[]
        )
        db.add(ext_result)
        
        import datetime
        doc.status = "Completed"
        doc.document_type = structured_data.get("document_type", "Unknown")
        doc.completed_at = datetime.datetime.now()
        db.commit()

    except Exception as e:
        print(f"Error processing document: {e}")
        doc.status = "Error"
        db.commit()
    finally:
        db.close()
