"""
Script pour extraire les icônes des bourgeons du PDF
et les sauvegarder dans le dossier public/bourgeons
"""

import fitz  # PyMuPDF
import os
from PIL import Image
import io

# Chemin du PDF
PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "docs", "Le_Pouvoir_des_47_Bourgeons.pdf")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public", "bourgeons")

# Mapping des bourgeons par page et position (grille 4x3)
# Pages 7-10 contiennent l'Index Visuel
BOURGEONS_MAP = {
    7: [  # Page 7 - Index 1/4
        ["airelle", "amandier", "arbre-de-judee", "argousier"],
        ["aubepine", "aulne", "bouleau", "bruyere"],
        ["cassis", "cedre", "charme", "chataignier"],
    ],
    8: [  # Page 8 - Index 2/4
        ["chene", "citronnier", "cornouiller", "eglantier"],
        ["erable", "figuier", "framboisier", "frene"],
        ["genevrier", "ginkgo", "hetre", "lilas"],
    ],
    9: [  # Page 9 - Index 3/4
        ["mais", "marronnier", "myrtillier", "noisetier"],
        ["noyer", "olivier", "orme", "peuplier"],
        ["pin", "platane", "pommier", "romarin"],
    ],
    10: [  # Page 10 - Index 4/4
        ["ronce", "sapin", "saule", "seigle"],
        ["sequoia", "sorbier", "tamaris", "tilleul"],
        ["tilleul-argente", "vigne", "vigne-vierge", "viorne"],
    ],
}

def extract_icons_from_page(doc, page_num, bourgeons_grid):
    """Extrait les icônes d'une page en découpant la grille"""
    page = doc[page_num - 1]  # 0-indexed

    # Convertir la page en image haute résolution
    mat = fitz.Matrix(3, 3)  # Zoom 3x pour meilleure qualité
    pix = page.get_pixmap(matrix=mat)
    img_data = pix.tobytes("png")
    img = Image.open(io.BytesIO(img_data))

    width, height = img.size

    # Définir les zones de la grille (ajuster selon le layout)
    # La grille commence après le titre et a 3 lignes de 4 colonnes
    margin_top = int(height * 0.15)  # Espace pour le titre
    margin_bottom = int(height * 0.05)
    margin_left = int(width * 0.05)
    margin_right = int(width * 0.05)

    grid_height = height - margin_top - margin_bottom
    grid_width = width - margin_left - margin_right

    cell_width = grid_width // 4
    cell_height = grid_height // 3

    # Extraire chaque cellule
    for row_idx, row in enumerate(bourgeons_grid):
        for col_idx, bourgeon_name in enumerate(row):
            # Calculer les coordonnées de la cellule
            x1 = margin_left + col_idx * cell_width
            y1 = margin_top + row_idx * cell_height
            x2 = x1 + cell_width
            y2 = y1 + cell_height

            # Découper l'icône (partie supérieure de la cellule, sans le texte)
            icon_height = int(cell_height * 0.7)  # 70% pour l'icône
            cell_img = img.crop((x1, y1, x2, y1 + icon_height))

            # Sauvegarder
            output_path = os.path.join(OUTPUT_DIR, f"{bourgeon_name}.png")
            cell_img.save(output_path, "PNG")
            print(f"  Extrait: {bourgeon_name}.png")

def create_generic_icon():
    """Crée une icône générique pour les bourgeons non trouvés"""
    # Créer une image simple avec un cercle vert
    size = 200
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))

    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)

    # Cercle de fond
    padding = 10
    draw.ellipse([padding, padding, size-padding, size-padding],
                 fill=(200, 220, 200, 255), outline=(100, 150, 100, 255))

    # Symbole de feuille simple
    center = size // 2
    draw.ellipse([center-30, center-40, center+30, center+20],
                 fill=(100, 150, 100, 255))

    output_path = os.path.join(OUTPUT_DIR, "macerat-generic.png")
    img.save(output_path, "PNG")
    print(f"Cree: macerat-generic.png")

def main():
    # Créer le dossier de sortie s'il n'existe pas
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Extraction vers: {OUTPUT_DIR}")
    print(f"PDF source: {PDF_PATH}")
    print()

    # Ouvrir le PDF
    doc = fitz.open(PDF_PATH)

    # Extraire les icônes de chaque page d'index
    for page_num, bourgeons_grid in BOURGEONS_MAP.items():
        print(f"\nTraitement page {page_num}...")
        extract_icons_from_page(doc, page_num, bourgeons_grid)

    doc.close()

    # Créer l'icône générique
    print("\nCreation de l'icone generique...")
    create_generic_icon()

    print("\nExtraction terminee!")
    print(f"{len(os.listdir(OUTPUT_DIR))} fichiers crees dans {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
