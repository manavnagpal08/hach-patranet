import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys
sys.path.append('src-python')
from models import model_manager

text = """
~logo
INVOICE
Acme Corp
Date: October 26, 2023
123 Business Avenue, Suite 400
Invoice No: INV-10024
Metropolis, NY 10101
Email: contact@acmecorp.co
Bill To: Client Name
456 Main Street
Springfield, IL 62704
Description
Quantity
Unit Price
Total
Web Design Services
$500.00
$500.00
Hosting
$50.00
"""

llm = model_manager.load_llm()

prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Extract structured data from the OCR text into JSON.
Return ONLY valid JSON matching this schema exactly:
{{
  "document_type": "Invoice",
  "key_fields": {{"Total Amount": "$0.00", "Vendor": "..."}},
  "tables": [
    {{"Description": "...", "Amount": "..."}}
  ]
}}
<|eot_id|><|start_header_id|>user<|end_header_id|>
TEXT:
{text}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

print("Running LLM...")
res = llm(prompt, max_tokens=300, stop=["<|eot_id|>"])
print("OUTPUT:")
print(res['choices'][0]['text'])
