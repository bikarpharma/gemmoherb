
import fitz
import os
import re

pdf_path = "docs/Le_Pouvoir_des_47_Bourgeons.pdf"
output_dir = "client/public/icons/extracted"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
print(f"Pages: {len(doc)}")

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text = page.get_text()
    
    # Simple extraction de noms potentiels (Mots en majuscules ou clés)
    # Ceci est juste pour l'analyse, on imprime le début du texte
    print(f"--- Page {page_num+1} ---")
    print(text[:200].replace('\n', ' '))
    
    images = page.get_images(full=True)
    if images:
        print(f"Images: {len(images)}")
