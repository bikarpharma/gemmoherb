/**
 * Mapping des noms de macérats de bourgeons vers leurs icônes/logos
 * Basé sur le document "Le Pouvoir des 47 Bourgeons"
 */

export const bourgeonsLogos: Record<string, string> = {
  // Index visuel page 1
  "Airelle": "airelle",
  "Amandier": "amandier",
  "Arbre de Judée": "arbre-judee",
  "Argousier": "argousier",
  "Aubépine": "aubepine",
  "Aulne": "aulne",
  "Bouleau pubescent": "bouleau",
  "Bruyère": "bruyere",
  "Cassis": "cassis",
  "Cèdre": "cedre",
  "Charme": "charme",
  "Châtaignier": "chataignier",
  
  // Index visuel page 2
  "Chêne": "chene",
  "Citronnier": "citronnier",
  "Cornouiller sanguin": "cornouiller",
  "Églantier": "eglantier",
  "Érable": "erable",
  "Figuier": "figuier",
  "Framboisier": "framboisier",
  "Frêne": "frene",
  "Genévrier": "genevrier",
  "Ginkgo": "ginkgo",
  "Hêtre": "hetre",
  "Lilas": "lilas",
  
  // Index visuel page 3
  "Maïs": "mais",
  "Marronnier": "marronnier",
  "Myrtillier": "myrtillier",
  "Noisetier": "noisetier",
  "Noyer": "noyer",
  "Olivier": "olivier",
  "Orme": "orme",
  "Peuplier": "peuplier",
  "Pin": "pin",
  "Platane": "platane",
  "Pommier": "pommier",
  "Romarin": "romarin",
  
  // Index visuel page 4
  "Ronce": "ronce",
  "Sapin pectiné": "sapin",
  "Saule": "saule",
  "Seigle": "seigle",
  "Séquoia": "sequoia",
  "Sorbier": "sorbier",
  "Tamaris": "tamaris",
  "Tilleul": "tilleul",
  "Vigne": "vigne",
  "Vigne vierge": "vigne-vierge",
  "Viorne": "viorne",
};

/**
 * Fonction pour obtenir le logo d'un bourgeon
 * Retourne undefined si aucun logo n'est disponible
 */
export function getBourgeonsLogo(productName: string): string | undefined {
  // Normaliser le nom du produit pour la recherche
  const normalizedName = productName.split(" - ")[0].trim();
  
  // Chercher dans le mapping
  for (const [key, value] of Object.entries(bourgeonsLogos)) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedName.toLowerCase())) {
      return `/bourgeons/${value}.svg`;
    }
  }
  
  return undefined;
}
