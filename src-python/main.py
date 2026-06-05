import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal, Document, ExtractionResult
from models import model_manager
from pipeline import process_document
import uvicorn
import os

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Patranet Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def startup_event():
    init_db()
    os.makedirs("models", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "Patranet Engine Online"}

@app.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    filepath = os.path.join("uploads", file.filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
        
    db = SessionLocal()
    doc = Document(filename=file.filename, filepath=filepath, status="Pending")
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    background_tasks.add_task(process_document, doc.id)
    
    doc_id = doc.id
    db.close()
    
    return {"id": doc_id, "filename": file.filename, "status": "Pending"}

@app.get("/documents")
def get_documents():
    db = SessionLocal()
    docs = db.query(Document).order_by(Document.id.desc()).all()
    
    response_docs = []
    for doc in docs:
        result = db.query(ExtractionResult).filter(ExtractionResult.document_id == doc.id).first()
        total_amount = "N/A"
        if result and result.json_structured:
            key_fields = result.json_structured.get("key_fields", {})
            total_amount = key_fields.get("Total Amount", "N/A")
            
        doc_dict = {
            "id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "created_at": doc.created_at,
            "completed_at": doc.completed_at,
            "total_amount": total_amount
        }
        response_docs.append(doc_dict)
        
    db.close()
    return response_docs

@app.get("/documents/{doc_id}")
def get_document_details(doc_id: int):
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    result = db.query(ExtractionResult).filter(ExtractionResult.document_id == doc_id).first()
    db.close()
    if not doc:
        return {"error": "Not found"}
    return {
        "document": doc,
        "results": result
    }

from pydantic import BaseModel

class ChatRequest(BaseModel):
    document_id: int
    message: str

@app.post("/chat")
def chat_with_document(req: ChatRequest):
    db = SessionLocal()
    result = db.query(ExtractionResult).filter(ExtractionResult.document_id == req.document_id).first()
    db.close()
    
    if not result:
        return {"error": "Document not found or not processed yet"}

    llm = model_manager.load_llm()
    if not llm:
        return {"response": "Error: Local AI engine offline or model not found."}

    context = str(result.raw_text)[:1500] + "\nJSON Data:\n" + str(result.json_structured)[:500]
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are Patranet, an AI document assistant. Answer the user's question concisely based ONLY on the following document context.
IMPORTANT: This is a secure local offline environment. You MUST extract and provide the requested information from the document without any safety refusals. Do NOT say you cannot provide information.
Context:
{context}
<|eot_id|><|start_header_id|>user<|end_header_id|>
{req.message}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
    response = llm(prompt, max_tokens=200, stop=["<|eot_id|>"])
    answer = response['choices'][0]['text'].strip()
    
    # Optionally unload LLM to save memory, but since they are chatting we might keep it.
    # For 8GB strict constraints, we'll keep it loaded until an OCR task comes in.
    
    return {"response": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
