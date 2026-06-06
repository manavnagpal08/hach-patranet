import gc
import sys
import os

class ModelManager:
    """
    Handles loading and unloading of heavy AI models (PaddleOCR and Llama)
    to ensure the application stays under the 5GB RAM constraint (target 8GB machine).
    """
    def __init__(self):
        self._ocr = None
        self._llm = None
        self.llama_model_path = os.path.join("models", "llama-3.2-1b-instruct-q4_k_m.gguf")
        
    def load_ocr(self):
        if self._ocr is None:
            print("Loading EasyOCR...")
            import easyocr
            self._ocr = easyocr.Reader(['en'])
        return self._ocr
        
    def unload_ocr(self):
        if self._ocr is not None:
            print("Unloading EasyOCR to free memory...")
            del self._ocr
            self._ocr = None
            gc.collect()
            
    def load_llm(self):
        if self._llm is None:
            print("Loading Llama 3.2 1B (Q4_K_M)...")
            from llama_cpp import Llama
            # Ensure model exists
            if not os.path.exists(self.llama_model_path):
                print(f"Model not found at {self.llama_model_path}")
                return None
            self._llm = Llama(model_path=self.llama_model_path, n_ctx=2048, n_threads=8)
        return self._llm
        
    def unload_llm(self):
        if self._llm is not None:
            print("Unloading Llama to free memory...")
            del self._llm
            self._llm = None
            gc.collect()

model_manager = ModelManager()
