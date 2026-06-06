import json
from database import SessionLocal, ExtractionResult

db = SessionLocal()
results = db.query(ExtractionResult).order_by(ExtractionResult.id.desc()).limit(3).all()

for r in results:
    print(f"Doc ID: {r.document_id}")
    print(f"Images: {r.images}")
    print("-" * 40)

db.close()
