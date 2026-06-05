# Patranet Local AI Engine

A fully offline, local-first document processing pipeline using EasyOCR and Llama 3.2 1B for extracting structured JSON data and tables from invoices, receipts, and documents. Built with React (Vite) and Python FastAPI.

## Complete Setup Instructions

### 1. Frontend Setup (React/Vite)
Open a terminal in the root directory and run:
```bash
npm install
npm run dev
```

### 2. Backend Setup (Python FastAPI)
Open a second terminal, navigate into the `src-python` folder, create a virtual environment, install dependencies, and start the engine:

**Windows:**
```bash
cd src-python
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Mac/Linux:**
```bash
cd src-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Features
- **Local OCR**: Uses PyTorch and EasyOCR to read document text without cloud APIs.
- **Local LLM**: Uses `llama-cpp-python` to run a highly optimized Llama 3.2 1B model entirely on CPU.
- **Table Extraction**: Intelligent regex and RAG parsing to reconstruct tabular layouts directly into the UI.
- **Document History**: SQLite database automatically saves your extractions and table parses.
- **Secure Offline Chat**: Talk to your local AI about the contents of your secure documents.

## Notes for Antigravity Testing
If you are running this to test the speed:
1. Ensure the Python terminal is active so you can watch the granular logs.
2. The engine will automatically download the Llama weights (~770MB) into `models/` on the very first run, so the first document will take longer while it caches the weights. 
3. **Manual Model Download (Optional)**: If you prefer to download the AI model manually, download the `llama-3.2-1b-instruct-q4_k_m.gguf` file from HuggingFace and place it exactly inside the `models/` folder in the project root before running.
4. Subsequent documents will utilize the hyper-optimized prompt processing pipeline, bypassing safety refusals and instantly mapping tables!
