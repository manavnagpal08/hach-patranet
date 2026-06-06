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
        self.qwen_model_path = os.path.join("models", "qwen2.5-0.5b-instruct-q4_k_m.gguf")
        self.active_local_model = "local" # 'local' = llama, 'qwen' = qwen
        
    def set_local_model(self, model_name: str):
        if model_name in ['local', 'qwen'] and model_name != self.active_local_model:
            self.active_local_model = model_name
            self.unload_llm() # Force reload on next request

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
            model_path = self.qwen_model_path if self.active_local_model == "qwen" else self.llama_model_path
            print(f"Loading Local Model ({self.active_local_model})...")
            from llama_cpp import Llama
            # Ensure model exists
            if not os.path.exists(model_path):
                print(f"Model not found at {model_path}")
                return None
            self._llm = Llama(model_path=model_path, n_ctx=2048, n_threads=8)
        return self._llm
        
    def unload_llm(self):
        if self._llm is not None:
            print("Unloading Llama to free memory...")
            del self._llm
            self._llm = None
            gc.collect()

model_manager = ModelManager()
