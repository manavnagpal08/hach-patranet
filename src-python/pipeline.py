import time
import json
import os
from database import SessionLocal, Document, ExtractionResult
from models import model_manager

def process_document(doc_id: int, api_key: str = None, groq_api_key: str = None, active_engine: str = "local"):
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
        original_filepath = str(doc.filepath)
        process_filepath = str(doc.filepath)
        ext = os.path.splitext(original_filepath)[1].lower()
        digital_pdf_text = ""
        extracted_images = []
        if ext == '.pdf':
            doc.status = "Converting PDF..."
            db.commit()
            import fitz
            from PIL import Image
            import tempfile
            pdf_doc = fitz.open(original_filepath)
            page = pdf_doc.load_page(0)
            
            # --- PDF SPEED OPTIMIZATION ---
            # Check if the PDF has embedded digital text (not a scanned image)
            digital_pdf_text = page.get_text().strip()
            
            # --- EXTRACT EMBEDDED IMAGES (Logos, Photos) ---
            extracted_images = []
            try:
                for img_index, img_info in enumerate(page.get_images(full=True)):
                    xref = img_info[0]
                    base_image = pdf_doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # --- CONVERT TO STANDARD RGB JPEG ---
                    # Browsers often cannot render raw PDF-extracted CMYK or weirdly formatted images
                    import io
                    try:
                        pil_img = Image.open(io.BytesIO(image_bytes))
                        if pil_img.mode != "RGB":
                            pil_img = pil_img.convert("RGB")
                        img_filename = f"extracted_img_{doc.id}_{img_index}.jpg"
                        img_path = os.path.join("uploads", img_filename)
                        pil_img.save(img_path, "JPEG")
                    except Exception as e:
                        print(f"PIL conversion failed, saving raw bytes: {e}")
                        img_filename = f"extracted_img_{doc.id}_{img_index}.{image_ext}"
                        img_path = os.path.join("uploads", img_filename)
                        with open(img_path, "wb") as f:
                            f.write(image_bytes)

                    extracted_images.append({
                        "description": f"Extracted Image {img_index + 1}",
                        "path": f"/uploads/{img_filename}"
                    })
            except Exception as e:
                print(f"Failed to extract images: {e}")
            
            # We still need the image for the visual UI and OCR fallback
            pix = page.get_pixmap(dpi=150) # Use 150 DPI for better OCR if needed
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            temp_path = os.path.join(tempfile.gettempdir(), f"patranet_temp_{doc.id}.png")
            img.save(temp_path)
            process_filepath = temp_path

        # Determine which OCR we need based on engine and whether we have native digital text
        extracted_text = digital_pdf_text
        if not extracted_text and not (active_engine == 'gemini' and api_key):
            # We need to run local OCR because we don't have digital text and we aren't using Gemini's native vision
            doc.status = "Loading EasyOCR Model..."
            db.commit()
            
            try:
                ocr = model_manager.load_ocr()
                
                doc.status = "Extracting Text (OCR)..."
                db.commit()
                
                print(f"Running EasyOCR on {process_filepath}")
                
                # --- OCR MASSIVE SPEED OPTIMIZATION ---
                # 1. Resize image to a maximum of 1200px. EasyOCR speed is heavily dependent on pixel count!
                from PIL import Image
                import tempfile
                
                img_for_ocr = Image.open(process_filepath)
                # Only resize if it's larger than 1200px to preserve text on small images
                if max(img_for_ocr.size) > 1200:
                    img_for_ocr.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                    # Save to a new temporary file so we don't overwrite the high-res original
                    temp_ocr_path = os.path.join(tempfile.gettempdir(), f"ocr_optimized_{doc.id}.png")
                    img_for_ocr.save(temp_ocr_path)
                    ocr_target = temp_ocr_path
                else:
                    ocr_target = process_filepath
                
                # 2. Use detail=0 to skip generating coordinates and bounding boxes (faster)
                # 3. Use paragraph=True to group text blocks (faster and cleaner text)
                result = ocr.readtext(ocr_target, detail=0, paragraph=True)
                
                # Extract text blocks (detail=0 returns a simple list of strings)
                for text_block in result:
                    extracted_text += text_block + "\n"
                    
                # Clean up temp optimized file
                if 'temp_ocr_path' in locals() and os.path.exists(temp_ocr_path):
                    try:
                        os.remove(temp_ocr_path)
                    except:
                        pass
                    
                # Unload OCR to free memory! (Disabled for speed optimization)
                # model_manager.unload_ocr()
            except Exception as e:
                print(f"EasyOCR Error on file {doc.filepath}: {e}")
                extracted_text = f"Local OCR Error: {e}"

        # --- GEMINI FAST-TRACK BYPASS ---
        if active_engine == 'gemini' and api_key:
            doc.status = "Accelerated Cloud Processing..."
            db.commit()
            
            import google.generativeai as genai
            from PIL import Image
            genai.configure(api_key=api_key)
            
            print("Fetching available Gemini models for this API key...")
            available_models = []
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        available_models.append(m.name)
                        print("Found model:", m.name)
            except Exception as e:
                print("Could not list models:", e)
                
            # Dynamically select the best vision model
            target_model = "gemini-flash-lite-latest" # Safe generic fallback for speed
            
            # Check for the FASTEST models first (Lite variants)
            if "models/gemini-2.5-flash-lite" in available_models:
                target_model = "gemini-2.5-flash-lite"
            elif "models/gemini-flash-lite-latest" in available_models:
                target_model = "gemini-flash-lite-latest"
            elif "models/gemini-2.0-flash-lite" in available_models:
                target_model = "gemini-2.0-flash-lite"
            elif "models/gemini-2.5-flash" in available_models:
                target_model = "gemini-2.5-flash"
            elif "models/gemini-flash-latest" in available_models:
                target_model = "gemini-flash-latest"
                
            print(f"Selected model: {target_model}")
            model = genai.GenerativeModel(target_model)
            img = Image.open(process_filepath)
            
            # --- MASSIVE SPEED OPTIMIZATION ---
            # Resize image to max 1536px before sending over the network to Gemini
            # This drastically reduces network latency and processing time for 20+ megapixel images or heavy PDFs!
            img.thumbnail((1536, 1536), Image.Resampling.LANCZOS)
            
            prompt = """
Extract all visible text as raw OCR text, and also extract structured data matching this exact JSON schema.
Return a SINGLE JSON object with exactly two keys: 'raw_text' and 'structured_data'.
{
  "raw_text": "the entire raw OCR text string",
  "structured_data": {
    "document_language": "English (or whatever language is dominant)",
    "document_type": "Grade Sheet",
    "key_fields": {
      "Field Name 1": "Value 1",
      "Field Name 2": "Value 2"
    },
    "tables": [
      {"<Column Header 1>": "Value 1", "<Column Header 2>": "Value 2"}
    ]
  }
}
Do not use markdown formatting. Return ONLY valid JSON.
"""
            print("Running Gemini Fast-Track...")
            if digital_pdf_text:
                print("Using blazing fast digital PDF text extraction for Gemini!")
                prompt = "Here is the raw text extracted directly from a digital PDF document:\n\n" + digital_pdf_text + "\n\n" + prompt
                response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            else:
                response = model.generate_content([prompt, img], generation_config={"response_mime_type": "application/json"})
            
            try:
                text = response.text.strip()
                
                # --- FIX FOR FAST MODELS (Trailing Commas) ---
                # Flash Lite sometimes leaves trailing commas which break json.loads
                import re
                text = re.sub(r',\s*([\]}])', r'\1', text)
                
                result_obj = json.loads(text)
                extracted_text = result_obj.get("raw_text", "")
                structured_data = result_obj.get("structured_data", {})
            except Exception as e:
                print(f"Failed to parse Gemini output: {e}")
                extracted_text = "Parsing failed."
                structured_data = {"error": f"Failed to parse Gemini response: {str(e)}"}
                
        # --- GROQ FAST-TRACK BYPASS ---
        elif active_engine == 'groq' and groq_api_key:
            doc.status = "Structuring data with Groq Cloud..."
            db.commit()
            
            from groq import Groq
            client = Groq(api_key=groq_api_key)
            
            prompt = """
Extract all important data from the text, including any visible tables and nested key-value pairs.
Construct a valid JSON object matching this exact schema:
{
  "document_language": "English",
  "document_type": "Invoice",
  "key_fields": {
    "Field Name 1": "Value 1",
    "Field Name 2": "Value 2"
  },
  "tables": [
    {"<Column Header 1>": "Value 1", "<Column Header 2>": "Value 2"}
  ]
}
Return ONLY valid JSON.
"""
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": prompt
                        },
                        {
                            "role": "user",
                            "content": extracted_text[:12000] # Provide large context to the 70B model
                        }
                    ],
                    model="llama-3.3-70b-versatile", # Upgraded from 8b to the massive 70b model for Gemini-like reasoning
                    response_format={"type": "json_object"}
                )
                
                structured_data = json.loads(chat_completion.choices[0].message.content)
            except Exception as e:
                print(f"Failed to parse Groq output: {e}")
                structured_data = {"error": f"Failed to parse Groq response: {str(e)}"}
                
        else:
            # --- LOCAL OFFLINE PIPELINE ---
            
            # STEP 2: AI Structuring
            doc.status = "Loading Llama 3.2 1B Model..."
            db.commit()
            
            llm = model_manager.load_llm()
            
            doc.status = "Analyzing with Llama AI..."
            db.commit()
            if llm:
                print("Running Llama 3.2 1B for JSON structuring...")
                prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an advanced data extraction AI.
Read the OCR text provided and extract all important details into a JSON object, including tables.

Format your response exactly like this example:
{{
  "document_type": "Grade Sheet",
  "key_fields": {{
    "Name": "John Doe",
    "Total": "100"
  }},
  "tables": [
    {{"Subject": "Math", "Marks": "50"}}
  ]
}}
<|eot_id|><|start_header_id|>user<|end_header_id|>
TEXT TO ANALYZE:
{extracted_text[:1200]}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{{
  "document_type":"""
                # Increased tokens to allow table generation, though it will take ~30-40 seconds on CPU
                response = llm(prompt, max_tokens=400, stop=["<|eot_id|>"])
                response_text = '{\n  "document_type":' + response['choices'][0]['text'].strip()
                
                # Very basic JSON parsing from response
                try:
                    # Fix common truncated JSON by trying to append closing braces
                    try:
                        structured_data = json.loads(response_text)
                    except json.JSONDecodeError:
                        try:
                            structured_data = json.loads(response_text + "\n  }\n}")
                        except:
                            try:
                                structured_data = json.loads(response_text + "\n  ]\n}")
                            except:
                                try:
                                    structured_data = json.loads(response_text + "\n}")
                                except:
                                    structured_data = {"raw_llm_output": response_text}
                except Exception as e:
                    structured_data = {"raw_llm_output": response_text}
            else:
                structured_data = {"error": "Llama model not loaded or missing."}

            # Unload LLM (Disabled for speed optimization)
            # model_manager.unload_llm()

        # Save Results
        ext_result = ExtractionResult(
            document_id=doc.id,
            raw_text=extracted_text,
            json_structured=structured_data,
            tables=[],
            images=extracted_images
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
        if 'process_filepath' in locals() and 'original_filepath' in locals() and process_filepath != original_filepath and os.path.exists(process_filepath):
            try:
                os.remove(process_filepath)
            except:
                pass
        db.close()
