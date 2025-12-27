import { drizzle } from "drizzle-orm/mysql2";
import { products } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Liste des macérats de bourgeons (tous à 37.7€ HT)
const macerats = [
  { reference: "MAC001", name: "Airelle BIO - Vaccinium vitis-idaea" },
  { reference: "MAC002", name: "Amandier BIO - Prunus amygdalus" },
  { reference: "MAC003", name: "Argousier BIO - Eleagnus rhamnoides" },
  { reference: "MAC004", name: "Aubépine BIO - Crataegus monogyna" },
  { reference: "MAC005", name: "Aulne glutineux BIO - Alnus glutinosa" },
  { reference: "MAC006", name: "Bouillon blanc BIO - Verbascum thapsus" },
  { reference: "MAC007", name: "Bouleau pubescent BIO - Betula pubescens" },
  { reference: "MAC008", name: "Bouleau verruqueux BIO - Betula pendula/verrucosa" },
  { reference: "MAC009", name: "Bruyère - Calluna vulgaris" },
  { reference: "MAC010", name: "Cassissier BIO - Ribes nigrum" },
  { reference: "MAC011", name: "Cèdre du Liban BIO - Cedrus libani" },
  { reference: "MAC012", name: "Charme BIO - Carpinus betulus" },
  { reference: "MAC013", name: "Châtaignier BIO - Castanea sativa" },
  { reference: "MAC014", name: "Chêne BIO - Quercus robur" },
  { reference: "MAC015", name: "Cornouiller sanguin BIO - Cornus sanguinea" },
  { reference: "MAC016", name: "Églantier BIO - Rosa canina" },
  { reference: "MAC017", name: "Érable Champêtre BIO - Acer campestre" },
  { reference: "MAC018", name: "Figuier BIO - Ficus carica" },
  { reference: "MAC019", name: "Framboisier BIO - Rubus idaeus" },
  { reference: "MAC020", name: "Frêne BIO - Fraxinus excelsior" },
  { reference: "MAC021", name: "Genévrier BIO - Juniperus communis" },
  { reference: "MAC022", name: "Ginkgo BIO - Ginkgo biloba" },
  { reference: "MAC023", name: "Gui BIO - Viscum album" },
  { reference: "MAC024", name: "Hêtre BIO - Fagus sylvatica" },
  { reference: "MAC025", name: "Maïs - Zea mays" },
  { reference: "MAC026", name: "Marronnier BIO - Aesculus hippocastanum" },
  { reference: "MAC027", name: "Mélèze - Larix decidua" },
  { reference: "MAC028", name: "Mûrier noir - Morus nigra" },
  { reference: "MAC029", name: "Myrtillier BIO - Vaccinium myrtillus" },
  { reference: "MAC030", name: "Noisetier BIO - Corylus avellana" },
  { reference: "MAC031", name: "Noyer BIO - Juglans regia" },
  { reference: "MAC032", name: "Olivier BIO - Olea europaea" },
  { reference: "MAC033", name: "Orme BIO - Ulmus glabra/campestris" },
  { reference: "MAC034", name: "Peuplier noir BIO - Populus nigra" },
  { reference: "MAC035", name: "Pin de Montagne BIO - Pinus mugo" },
  { reference: "MAC036", name: "Platane BIO - Platanus orientalis" },
  { reference: "MAC037", name: "Pommier BIO - Malus communis" },
  { reference: "MAC038", name: "Romarin BIO - Rosmarinus officinalis" },
  { reference: "MAC039", name: "Ronce BIO - Rubus fructicosus" },
  { reference: "MAC040", name: "Sapin blanc BIO - Abies alba/pectinata" },
  { reference: "MAC041", name: "Saule pourpre - Salix purpurea" },
  { reference: "MAC042", name: "Séquoia BIO - Sequoiadendron giganteum" },
  { reference: "MAC043", name: "Sorbier BIO - Sorbus domestica" },
  { reference: "MAC044", name: "Sureau BIO - Sambucus" },
  { reference: "MAC045", name: "Tamaris BIO - Tamarix gallica" },
  { reference: "MAC046", name: "Tilleul BIO - Tilia tomentosa" },
  { reference: "MAC047", name: "Vigne BIO - Vitis vinifera" },
  { reference: "MAC048", name: "Viorne BIO - Viburnum lantana" },
];

// Liste des huiles essentielles avec leurs prix
const huilesEssentielles = [
  { reference: "HECF001", name: "HE CAMOMILLE BLEUE 10 ML", unitVolume: "10 ML", priceHT: "110.000" },
  { reference: "HECF002", name: "HE CAMOMILLE MATRICAIRE 10 ML", unitVolume: "10 ML", priceHT: "94.000" },
  { reference: "HECF003", name: "HE ÉPINETTE NOIRE 10 ML", unitVolume: "10 ML", priceHT: "20.550" },
  { reference: "HECF004", name: "HE EUCALYPTUS RADIÉ 10 ML", unitVolume: "10 ML", priceHT: "9.000" },
  { reference: "HECF005", name: "HE GIROFLE 10 ML", unitVolume: "10 ML", priceHT: "6.600" },
  { reference: "HECF006", name: "HE HÉLICHRYSE FEMELLE DE MADAGASCAR 10 ML", unitVolume: "10 ML", priceHT: "42.000" },
  { reference: "HECF007", name: "HE HYSOPE 10 ML", unitVolume: "10 ML", priceHT: "21.000" },
  { reference: "HECF008", name: "HE INULE ODORANTE 5 ML", unitVolume: "5 ML", priceHT: "105.360" },
  { reference: "HECF009", name: "HE KHELLA 10 ML", unitVolume: "10 ML", priceHT: "60.000" },
  { reference: "HECF010", name: "HE LAVANDE 10 ML", unitVolume: "10 ML", priceHT: "8.500" },
  { reference: "HECF011", name: "HE LAVANDE ASPIC 10 ML", unitVolume: "10 ML", priceHT: "27.000" },
  { reference: "HECF012", name: "HE LAVANDIN SUPER 10 ML", unitVolume: "10 ML", priceHT: "12.640" },
  { reference: "HECF013", name: "HE NIAOULI 10 ML", unitVolume: "10 ML", priceHT: "4.500" },
  { reference: "HECF014", name: "HE ORIGAN COMPACT 10 ML", unitVolume: "10 ML", priceHT: "15.500" },
  { reference: "HECF015", name: "HE PIN SYLVESTRE 10 ML", unitVolume: "10 ML", priceHT: "6.000" },
  { reference: "HECF016", name: "HE RAVINTSARA 10 ML", unitVolume: "10 ML", priceHT: "8.200" },
  { reference: "HECF017", name: "HE ROMARIN OFFINICAL 10 ML", unitVolume: "10 ML", priceHT: "8.100" },
  { reference: "HECF018", name: "HE SAPIN DE SIBÉRIE 10 ML", unitVolume: "10 ML", priceHT: "16.860" },
  { reference: "HECF019", name: "HE SARO 10 ML", unitVolume: "10 ML", priceHT: "45.000" },
  { reference: "HECF020", name: "HE TEA TREE 10 ML", unitVolume: "10 ML", priceHT: "6.600" },
  { reference: "HECF021", name: "HE THYM À LINALOL 10 ML", unitVolume: "10 ML", priceHT: "29.000" },
  { reference: "HECF022", name: "HE CAMOMILLE BLEUE 30 ML", unitVolume: "30 ML", priceHT: "330.000" },
  { reference: "HECF023", name: "HE CAMOMILLE MATRICAIRE 30 ML", unitVolume: "30 ML", priceHT: "282.000" },
  { reference: "HECF024", name: "HE ÉPINETTE NOIRE 30 ML", unitVolume: "30 ML", priceHT: "61.650" },
  { reference: "HECF025", name: "HE EUCALYPTUS RADIÉ 30 ML", unitVolume: "30 ML", priceHT: "27.000" },
  { reference: "HECF026", name: "HE GIROFLE 30 ML", unitVolume: "30 ML", priceHT: "19.800" },
  { reference: "HECF027", name: "HE HÉLICHRYSE FEMELLE DE MADAGASCAR 30 ML", unitVolume: "30 ML", priceHT: "126.000" },
  { reference: "HECF028", name: "HE HYSOPE 30 ML", unitVolume: "30 ML", priceHT: "63.000" },
  { reference: "HECF029", name: "HE KHELLA 30 ML", unitVolume: "30 ML", priceHT: "180.000" },
  { reference: "HECF030", name: "HE LAVANDE 30 ML", unitVolume: "30 ML", priceHT: "25.500" },
  { reference: "HECF031", name: "HE LAVANDE ASPIC 30 ML", unitVolume: "30 ML", priceHT: "81.000" },
  { reference: "HECF032", name: "HE LAVANDIN SUPER 30 ML", unitVolume: "30 ML", priceHT: "37.920" },
  { reference: "HECF033", name: "HE NIAOULI 30 ML", unitVolume: "30 ML", priceHT: "13.500" },
  { reference: "HECF034", name: "HE ORIGAN COMPACT 30 ML", unitVolume: "30 ML", priceHT: "46.500" },
  { reference: "HECF035", name: "HE PIN SYLVESTRE 30 ML", unitVolume: "30 ML", priceHT: "18.000" },
  { reference: "HECF036", name: "HE RAVINTSARA 30 ML", unitVolume: "30 ML", priceHT: "24.600" },
  { reference: "HECF037", name: "HE ROMARIN OFFINICAL 30 ML", unitVolume: "30 ML", priceHT: "24.300" },
  { reference: "HECF038", name: "HE SAPIN DE SIBÉRIE 30 ML", unitVolume: "30 ML", priceHT: "50.580" },
  { reference: "HECF039", name: "HE SARO 30 ML", unitVolume: "30 ML", priceHT: "135.000" },
  { reference: "HECF040", name: "HE TEA TREE 30 ML", unitVolume: "30 ML", priceHT: "19.800" },
  { reference: "HECF041", name: "HE THYM À LINALOL 30 ML", unitVolume: "30 ML", priceHT: "87.000" },
  { reference: "HECF042", name: "HE EUCALYPTUS RADIÉ 100 ML", unitVolume: "100 ML", priceHT: "90.000" },
  { reference: "HECF043", name: "HE LAVANDE 100 ML", unitVolume: "100 ML", priceHT: "85.000" },
  { reference: "HECF044", name: "HE RAVINTSARA 100 ML", unitVolume: "100 ML", priceHT: "82.000" },
  { reference: "HECF045", name: "HE TEA TREE 100 ML", unitVolume: "100 ML", priceHT: "66.000" },
  { reference: "HECF046", name: "HE THYM A LINALOL 100 ML", unitVolume: "100 ML", priceHT: "290.000" },
  { reference: "HECF047", name: "HE CYPRES 100 ML", unitVolume: "100 ML", priceHT: "63.000" },
  { reference: "HECF048", name: "HE CYPRE 10 ML", unitVolume: "10 ML", priceHT: "6.300" },
  { reference: "HECF049", name: "HE SARRIETTE 10ML", unitVolume: "10 ML", priceHT: "14.500" },
  { reference: "HECF050", name: "HE THYM THYMOL BIO 10 ML", unitVolume: "10 ML", priceHT: "17.836" },
  { reference: "HECF051", name: "HE HELICHRYSE ITALIENNE 5 ML", unitVolume: "5 ML", priceHT: "55.300" },
  { reference: "HECF052", name: "HE CITRON 30 ML", unitVolume: "30 ML", priceHT: "25.000" },
  { reference: "HECF053", name: "HE EUCALYPTUS GLOBULUS 10 ML", unitVolume: "10 ML", priceHT: "6.000" },
  { reference: "HECF054", name: "HE EUCALYPTUS CITRONNEE 10 ML", unitVolume: "10 ML", priceHT: "8.300" },
  { reference: "HECF055", name: "HE YLANG YLANG 10 ML", unitVolume: "10 ML", priceHT: "20.000" },
];

async function seedProducts() {
  try {
    console.log("🌱 Début de l'importation des produits...");

    // Importer les macérats
    console.log("📦 Importation des macérats de bourgeons...");
    for (const macerat of macerats) {
      await db.insert(products).values({
        reference: macerat.reference,
        name: macerat.name,
        category: "macerat",
        unitVolume: "Flacon",
        priceHT: "37.70",
        tvaRate: "19.00",
        isActive: true,
      });
    }
    console.log(`✅ ${macerats.length} macérats importés`);

    // Importer les huiles essentielles
    console.log("📦 Importation des huiles essentielles...");
    for (const he of huilesEssentielles) {
      await db.insert(products).values({
        reference: he.reference,
        name: he.name,
        category: "huile_essentielle",
        unitVolume: he.unitVolume,
        priceHT: he.priceHT,
        tvaRate: "19.00",
        isActive: true,
      });
    }
    console.log(`✅ ${huilesEssentielles.length} huiles essentielles importées`);

    console.log("🎉 Importation terminée avec succès !");
    console.log(`Total: ${macerats.length + huilesEssentielles.length} produits importés`);
  } catch (error) {
    console.error("❌ Erreur lors de l'importation:", error);
    process.exit(1);
  }
}

seedProducts();
