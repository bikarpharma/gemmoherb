/**
 * Script pour générer 48 icônes SVG de bourgeons
 * Chaque icône a un style unique mais cohérent
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'client', 'public', 'bourgeons');

// Liste des 48 bourgeons avec leurs couleurs et formes associées
const bourgeons = [
  { name: 'airelle', color: '#8B4513', accent: '#CD853F', shape: 'berry' },
  { name: 'amandier', color: '#FFB6C1', accent: '#FF69B4', shape: 'flower' },
  { name: 'arbre-de-judee', color: '#DA70D6', accent: '#BA55D3', shape: 'flower' },
  { name: 'argousier', color: '#FFA500', accent: '#FF8C00', shape: 'berry' },
  { name: 'aubepine', color: '#FFFFFF', accent: '#FFE4E1', shape: 'flower' },
  { name: 'aulne', color: '#556B2F', accent: '#6B8E23', shape: 'catkin' },
  { name: 'bouleau', color: '#90EE90', accent: '#32CD32', shape: 'leaf' },
  { name: 'bruyere', color: '#DDA0DD', accent: '#EE82EE', shape: 'flower' },
  { name: 'cassis', color: '#2F0147', accent: '#4B0082', shape: 'berry' },
  { name: 'cedre', color: '#228B22', accent: '#006400', shape: 'needle' },
  { name: 'charme', color: '#9ACD32', accent: '#6B8E23', shape: 'leaf' },
  { name: 'chataignier', color: '#8B4513', accent: '#A0522D', shape: 'chestnut' },
  { name: 'chene', color: '#8B4513', accent: '#654321', shape: 'oak' },
  { name: 'citronnier', color: '#FFF44F', accent: '#FFFF00', shape: 'citrus' },
  { name: 'cornouiller', color: '#DC143C', accent: '#B22222', shape: 'berry' },
  { name: 'eglantier', color: '#FF6B6B', accent: '#FF4757', shape: 'rosehip' },
  { name: 'erable', color: '#FF6347', accent: '#DC143C', shape: 'maple' },
  { name: 'figuier', color: '#9370DB', accent: '#8B008B', shape: 'fig' },
  { name: 'framboisier', color: '#E30B5C', accent: '#DC143C', shape: 'berry' },
  { name: 'frene', color: '#3CB371', accent: '#2E8B57', shape: 'compound' },
  { name: 'genevrier', color: '#4169E1', accent: '#0000CD', shape: 'berry' },
  { name: 'ginkgo', color: '#FFD700', accent: '#DAA520', shape: 'ginkgo' },
  { name: 'hetre', color: '#8FBC8F', accent: '#556B2F', shape: 'leaf' },
  { name: 'lilas', color: '#C8A2C8', accent: '#9932CC', shape: 'flower' },
  { name: 'mais', color: '#FFD700', accent: '#FFA500', shape: 'corn' },
  { name: 'marronnier', color: '#800000', accent: '#A52A2A', shape: 'chestnut' },
  { name: 'myrtillier', color: '#4169E1', accent: '#0000CD', shape: 'berry' },
  { name: 'noisetier', color: '#DEB887', accent: '#D2691E', shape: 'hazel' },
  { name: 'noyer', color: '#8B7355', accent: '#6B4423', shape: 'walnut' },
  { name: 'olivier', color: '#808000', accent: '#6B8E23', shape: 'olive' },
  { name: 'orme', color: '#9ACD32', accent: '#6B8E23', shape: 'leaf' },
  { name: 'peuplier', color: '#98FB98', accent: '#00FA9A', shape: 'poplar' },
  { name: 'pin', color: '#228B22', accent: '#006400', shape: 'needle' },
  { name: 'platane', color: '#BDB76B', accent: '#8B8B00', shape: 'maple' },
  { name: 'pommier', color: '#FF6B6B', accent: '#32CD32', shape: 'apple' },
  { name: 'romarin', color: '#4682B4', accent: '#5F9EA0', shape: 'herb' },
  { name: 'ronce', color: '#2F0147', accent: '#4B0082', shape: 'berry' },
  { name: 'sapin', color: '#006400', accent: '#004d00', shape: 'needle' },
  { name: 'saule', color: '#9ACD32', accent: '#7CFC00', shape: 'willow' },
  { name: 'seigle', color: '#DAA520', accent: '#B8860B', shape: 'grain' },
  { name: 'sequoia', color: '#8B4513', accent: '#654321', shape: 'needle' },
  { name: 'sorbier', color: '#FF4500', accent: '#FF6347', shape: 'berry' },
  { name: 'tamaris', color: '#FFB6C1', accent: '#FF69B4', shape: 'flower' },
  { name: 'tilleul', color: '#ADFF2F', accent: '#7FFF00', shape: 'heart' },
  { name: 'tilleul-argente', color: '#C0C0C0', accent: '#A8A8A8', shape: 'heart' },
  { name: 'vigne', color: '#722F37', accent: '#8B0000', shape: 'grape' },
  { name: 'vigne-vierge', color: '#DC143C', accent: '#8B0000', shape: 'vine' },
  { name: 'viorne', color: '#FF6347', accent: '#FF4500', shape: 'berry' },
];

// Formes SVG pour chaque type de bourgeon
const shapes = {
  leaf: (color) => `
    <path d="M50 20 Q30 35 35 55 Q40 75 50 80 Q60 75 65 55 Q70 35 50 20 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 25 L50 75" stroke="white" stroke-width="2" opacity="0.5"/>
    <path d="M50 40 Q40 45 38 55" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
    <path d="M50 40 Q60 45 62 55" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
  `,
  berry: (color) => `
    <circle cx="50" cy="50" r="18" fill="${color}" opacity="0.9"/>
    <circle cx="44" cy="44" r="4" fill="white" opacity="0.4"/>
    <path d="M50 32 L50 25 M45 33 L42 27 M55 33 L58 27" stroke="#228B22" stroke-width="2" stroke-linecap="round"/>
  `,
  flower: (color) => `
    <ellipse cx="50" cy="35" rx="8" ry="12" fill="${color}" opacity="0.8" transform="rotate(-30 50 50)"/>
    <ellipse cx="50" cy="35" rx="8" ry="12" fill="${color}" opacity="0.8" transform="rotate(30 50 50)"/>
    <ellipse cx="50" cy="35" rx="8" ry="12" fill="${color}" opacity="0.8" transform="rotate(90 50 50)"/>
    <ellipse cx="50" cy="35" rx="8" ry="12" fill="${color}" opacity="0.8" transform="rotate(150 50 50)"/>
    <ellipse cx="50" cy="35" rx="8" ry="12" fill="${color}" opacity="0.8" transform="rotate(-90 50 50)"/>
    <circle cx="50" cy="50" r="8" fill="#FFD700" opacity="0.9"/>
  `,
  needle: (color) => `
    <path d="M50 20 L52 75 L50 80 L48 75 Z" fill="${color}" opacity="0.9"/>
    <path d="M35 30 L50 45 L65 30" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M30 45 L50 60 L70 45" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>
  `,
  oak: (color) => `
    <path d="M50 20 Q35 25 30 40 Q25 50 30 55 Q25 60 30 70 Q40 80 50 80 Q60 80 70 70 Q75 60 70 55 Q75 50 70 40 Q65 25 50 20 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 25 L50 75" stroke="white" stroke-width="2" opacity="0.4"/>
  `,
  maple: (color) => `
    <path d="M50 20 L55 35 L70 30 L60 45 L75 50 L60 55 L70 70 L55 60 L50 80 L45 60 L30 70 L40 55 L25 50 L40 45 L30 30 L45 35 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 25 L50 75" stroke="white" stroke-width="1.5" opacity="0.4"/>
  `,
  ginkgo: (color) => `
    <path d="M50 75 L50 55 Q30 50 25 35 Q30 20 50 25 Q70 20 75 35 Q70 50 50 55 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 55 L50 75" stroke="#8B4513" stroke-width="3"/>
    <path d="M50 55 Q50 40 50 30" stroke="white" stroke-width="1" opacity="0.3" fill="none"/>
  `,
  heart: (color) => `
    <path d="M50 75 Q30 55 30 40 Q30 25 42 25 Q50 25 50 35 Q50 25 58 25 Q70 25 70 40 Q70 55 50 75 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 70 L50 40" stroke="white" stroke-width="1.5" opacity="0.4"/>
  `,
  grape: (color) => `
    <circle cx="42" cy="40" r="10" fill="${color}" opacity="0.85"/>
    <circle cx="58" cy="40" r="10" fill="${color}" opacity="0.85"/>
    <circle cx="50" cy="52" r="10" fill="${color}" opacity="0.9"/>
    <circle cx="38" cy="55" r="8" fill="${color}" opacity="0.8"/>
    <circle cx="62" cy="55" r="8" fill="${color}" opacity="0.8"/>
    <circle cx="50" cy="65" r="8" fill="${color}" opacity="0.85"/>
    <path d="M50 25 L50 35 M45 28 Q50 32 55 28" stroke="#228B22" stroke-width="2" fill="none"/>
  `,
  catkin: (color) => `
    <ellipse cx="50" cy="40" rx="8" ry="15" fill="${color}" opacity="0.9"/>
    <ellipse cx="50" cy="60" rx="6" ry="12" fill="${color}" opacity="0.85"/>
    <path d="M50 20 L50 30" stroke="#8B4513" stroke-width="2"/>
    <circle cx="48" cy="35" r="2" fill="white" opacity="0.4"/>
    <circle cx="52" cy="45" r="2" fill="white" opacity="0.4"/>
  `,
  chestnut: (color) => `
    <circle cx="50" cy="55" r="20" fill="${color}" opacity="0.9"/>
    <path d="M30 50 Q50 35 70 50" stroke="#228B22" stroke-width="3" fill="none"/>
    <path d="M35 45 L50 30 L65 45" stroke="#228B22" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="45" cy="50" r="3" fill="white" opacity="0.3"/>
  `,
  citrus: (color) => `
    <circle cx="50" cy="52" r="22" fill="${color}" opacity="0.9"/>
    <circle cx="50" cy="52" r="16" fill="white" opacity="0.2"/>
    <path d="M50 30 L50 25 M45 32 L42 28" stroke="#228B22" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="58" cy="45" rx="3" ry="2" fill="white" opacity="0.5"/>
  `,
  rosehip: (color) => `
    <ellipse cx="50" cy="55" rx="15" ry="18" fill="${color}" opacity="0.9"/>
    <path d="M40 38 L50 30 L60 38" stroke="#228B22" stroke-width="2" fill="none"/>
    <circle cx="50" cy="40" r="4" fill="#8B4513" opacity="0.6"/>
    <circle cx="45" cy="50" r="2" fill="white" opacity="0.3"/>
  `,
  fig: (color) => `
    <path d="M50 25 Q35 30 32 50 Q35 75 50 78 Q65 75 68 50 Q65 30 50 25 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 78 L50 85" stroke="#228B22" stroke-width="3"/>
    <circle cx="45" cy="45" r="3" fill="white" opacity="0.3"/>
  `,
  compound: (color) => `
    <ellipse cx="50" cy="30" rx="6" ry="10" fill="${color}" opacity="0.9"/>
    <ellipse cx="38" cy="45" rx="5" ry="9" fill="${color}" opacity="0.85" transform="rotate(-20 38 45)"/>
    <ellipse cx="62" cy="45" rx="5" ry="9" fill="${color}" opacity="0.85" transform="rotate(20 62 45)"/>
    <ellipse cx="35" cy="62" rx="5" ry="8" fill="${color}" opacity="0.8" transform="rotate(-30 35 62)"/>
    <ellipse cx="65" cy="62" rx="5" ry="8" fill="${color}" opacity="0.8" transform="rotate(30 65 62)"/>
    <path d="M50 35 L50 75" stroke="#228B22" stroke-width="2"/>
  `,
  corn: (color) => `
    <ellipse cx="50" cy="50" rx="12" ry="25" fill="${color}" opacity="0.9"/>
    <path d="M38 35 Q30 30 25 35" stroke="#228B22" stroke-width="2" fill="none"/>
    <path d="M62 35 Q70 30 75 35" stroke="#228B22" stroke-width="2" fill="none"/>
    <path d="M38 50 Q30 48 25 52" stroke="#228B22" stroke-width="2" fill="none"/>
    <path d="M62 50 Q70 48 75 52" stroke="#228B22" stroke-width="2" fill="none"/>
    <line x1="45" y1="35" x2="45" y2="65" stroke="white" stroke-width="1" opacity="0.3"/>
    <line x1="55" y1="35" x2="55" y2="65" stroke="white" stroke-width="1" opacity="0.3"/>
  `,
  hazel: (color) => `
    <ellipse cx="50" cy="55" rx="14" ry="18" fill="${color}" opacity="0.9"/>
    <path d="M36 40 Q50 30 64 40" stroke="#228B22" stroke-width="3" fill="none"/>
    <path d="M40 35 L50 25 L60 35" stroke="#228B22" stroke-width="2" fill="none"/>
    <ellipse cx="55" cy="50" rx="4" ry="3" fill="white" opacity="0.3"/>
  `,
  walnut: (color) => `
    <circle cx="50" cy="52" r="20" fill="${color}" opacity="0.9"/>
    <path d="M50 32 Q40 45 50 52 Q60 45 50 32" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
    <path d="M50 52 Q40 60 50 72 Q60 60 50 52" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
    <path d="M50 25 L50 32" stroke="#228B22" stroke-width="2"/>
  `,
  olive: (color) => `
    <ellipse cx="50" cy="52" rx="12" ry="18" fill="${color}" opacity="0.9"/>
    <ellipse cx="53" cy="48" rx="3" ry="5" fill="white" opacity="0.3"/>
    <path d="M50 34 L50 28 Q55 25 60 28" stroke="#228B22" stroke-width="2" fill="none"/>
  `,
  poplar: (color) => `
    <path d="M50 20 Q40 30 38 50 Q40 70 50 80 Q60 70 62 50 Q60 30 50 20 Z" fill="${color}" opacity="0.9"/>
    <path d="M50 25 L50 75" stroke="white" stroke-width="1.5" opacity="0.4"/>
  `,
  apple: (color) => `
    <circle cx="50" cy="55" r="20" fill="${color}" opacity="0.9"/>
    <path d="M50 35 L50 28" stroke="#8B4513" stroke-width="3"/>
    <ellipse cx="58" cy="30" rx="8" ry="5" fill="#228B22" opacity="0.8"/>
    <circle cx="44" cy="48" r="4" fill="white" opacity="0.4"/>
  `,
  herb: (color) => `
    <path d="M50 80 L50 40" stroke="#228B22" stroke-width="3"/>
    <ellipse cx="42" cy="35" rx="4" ry="10" fill="${color}" opacity="0.9" transform="rotate(-30 42 35)"/>
    <ellipse cx="58" cy="35" rx="4" ry="10" fill="${color}" opacity="0.9" transform="rotate(30 58 35)"/>
    <ellipse cx="38" cy="50" rx="4" ry="9" fill="${color}" opacity="0.85" transform="rotate(-40 38 50)"/>
    <ellipse cx="62" cy="50" rx="4" ry="9" fill="${color}" opacity="0.85" transform="rotate(40 62 50)"/>
    <ellipse cx="40" cy="65" rx="3" ry="8" fill="${color}" opacity="0.8" transform="rotate(-45 40 65)"/>
    <ellipse cx="60" cy="65" rx="3" ry="8" fill="${color}" opacity="0.8" transform="rotate(45 60 65)"/>
  `,
  willow: (color) => `
    <path d="M50 20 Q45 40 40 60 Q38 75 42 80" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M50 20 Q55 40 60 60 Q62 75 58 80" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M50 20 L50 80" stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
  `,
  grain: (color) => `
    <path d="M50 80 L50 30" stroke="#8B4513" stroke-width="2"/>
    <ellipse cx="45" cy="28" rx="4" ry="8" fill="${color}" opacity="0.9" transform="rotate(-20 45 28)"/>
    <ellipse cx="55" cy="32" rx="4" ry="8" fill="${color}" opacity="0.9" transform="rotate(20 55 32)"/>
    <ellipse cx="45" cy="42" rx="4" ry="8" fill="${color}" opacity="0.85" transform="rotate(-20 45 42)"/>
    <ellipse cx="55" cy="46" rx="4" ry="8" fill="${color}" opacity="0.85" transform="rotate(20 55 46)"/>
    <ellipse cx="45" cy="56" rx="3" ry="7" fill="${color}" opacity="0.8" transform="rotate(-20 45 56)"/>
    <ellipse cx="55" cy="60" rx="3" ry="7" fill="${color}" opacity="0.8" transform="rotate(20 55 60)"/>
  `,
  vine: (color) => `
    <path d="M30 70 Q40 50 50 55 Q60 60 55 40 Q50 25 60 20" stroke="#228B22" stroke-width="3" fill="none"/>
    <path d="M50 20 L55 35 L70 25 L60 40 L75 45 L55 50 L50 65 L45 50 L25 45 L40 40 L30 25 L45 35 Z" fill="${color}" opacity="0.85" transform="scale(0.7) translate(22 20)"/>
  `,
};

function generateSVG(bourgeon) {
  const { name, color, accent, shape } = bourgeon;
  const shapeFunc = shapes[shape] || shapes.leaf;
  const shapeContent = shapeFunc(color);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e8f5e8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ring-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.5" />
    </linearGradient>
    <filter id="shadow-${name}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle cx="50" cy="50" r="48" fill="url(#bg-${name})"/>

  <!-- Decorative ring -->
  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ring-${name})" stroke-width="2"/>

  <!-- Main shape with shadow -->
  <g filter="url(#shadow-${name})">
    ${shapeContent}
  </g>
</svg>`;
}

function generateGenericIcon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-generic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e8f5e8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="leaf-generic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="48" fill="url(#bg-generic)"/>
  <circle cx="50" cy="50" r="45" fill="none" stroke="#4CAF50" stroke-width="2" opacity="0.3"/>

  <path d="M50 20 Q30 35 35 55 Q40 75 50 80 Q60 75 65 55 Q70 35 50 20 Z" fill="url(#leaf-generic)" opacity="0.9"/>
  <path d="M50 25 L50 75" stroke="white" stroke-width="2" opacity="0.5"/>
  <path d="M50 40 Q40 45 38 55" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
  <path d="M50 40 Q60 45 62 55" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
</svg>`;
}

function generateHuileIcon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-huile" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF8E7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFF0D0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bottle-huile" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5A2B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="oil-huile" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:0.9" />
    </linearGradient>
  </defs>

  <circle cx="50" cy="50" r="48" fill="url(#bg-huile)"/>
  <circle cx="50" cy="50" r="45" fill="none" stroke="#DAA520" stroke-width="2" opacity="0.3"/>

  <!-- Bottle -->
  <path d="M42 30 L42 25 Q42 20 50 20 Q58 20 58 25 L58 30" fill="url(#bottle-huile)"/>
  <path d="M38 30 Q35 35 35 50 Q35 75 50 80 Q65 75 65 50 Q65 35 62 30 Z" fill="url(#bottle-huile)" opacity="0.9"/>

  <!-- Oil inside -->
  <path d="M40 40 Q38 50 40 65 Q45 72 50 73 Q55 72 60 65 Q62 50 60 40 Z" fill="url(#oil-huile)"/>

  <!-- Highlight -->
  <path d="M43 45 Q42 55 44 62" stroke="white" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>

  <!-- Drop -->
  <path d="M50 83 Q47 87 50 90 Q53 87 50 83 Z" fill="#FFD700" opacity="0.8"/>
</svg>`;
}

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Generation des icones SVG...');
console.log('Dossier de sortie:', OUTPUT_DIR);
console.log('');

// Générer les 48 icônes de bourgeons
bourgeons.forEach((bourgeon, index) => {
  const svg = generateSVG(bourgeon);
  const filePath = path.join(OUTPUT_DIR, `${bourgeon.name}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`[${index + 1}/48] ${bourgeon.name}.svg`);
});

// Générer l'icône générique
const genericSvg = generateGenericIcon();
fs.writeFileSync(path.join(OUTPUT_DIR, 'macerat-generic.svg'), genericSvg);
console.log('[+] macerat-generic.svg');

// Générer l'icône pour huiles essentielles
const huileSvg = generateHuileIcon();
fs.writeFileSync(path.join(OUTPUT_DIR, 'huile-generic.svg'), huileSvg);
console.log('[+] huile-generic.svg');

console.log('');
console.log('Generation terminee! 50 icones SVG creees.');
