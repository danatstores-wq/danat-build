import React, { useEffect, useMemo, useRef, useState } from 'react';
import { estimateBuildingQuantities } from './buildingQuantityEstimator';
import {
  CONSTRUCTION_MARKET_BENCHMARKS,
  COUNTRY_ITEM_RATE_DEFAULTS,
  MARKET_RATE_LABELS,
} from '../data/constructionMarketBenchmarks';
import { marketBenchmarkLabel, marketBenchmarkSourceLabel } from '../data/marketBenchmarkTranslations';
import { getThemedStyles } from '../theme';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';

type Language = 'en' | 'ar' | 'fr';
type CountryCode = 'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM';

type FloorData = {
  id: number;
  length: string;
  width: string;
  height: string;
  openings: string;
  partitions: string;
};

type Props = {
  language: Language;
  mode: 'professional' | 'homeowner';
  units: 'metric' | 'imperial';
  onBack: () => void;
  theme: 'dark' | 'light';
};

type CostItem = {
  id: string;
  category: string;
  names: [string, string, string];
  unit: string;
  requiresMaterial?: boolean;
  requiresLabor?: boolean;
};

type DetailedValues = Record<string, string>;

const GOLD = '#E9B85D';

// Material defaults backed by official/statistical price publications.
// Other non-zero GCC material defaults are labelled as market-survey or
// regional reference anchors; calculated labour allowances remain provisional.
const PUBLISHED_MATERIAL_RATE_IDS: Partial<Record<Exclude<CountryCode, 'LB'>, string[]>> = {
  AE: ['cementMasonry'],
  SA: [
    'footingConcrete', 'columnConcrete', 'stairConcrete', 'beamConcrete', 'slabConcrete',
    'foundationSteel', 'structuralSteel', 'externalBlocks', 'cementMasonry', 'sandMasonry', 'floorTiles',
  ],
  QA: ['foundationSteel', 'structuralSteel'],
};

// These concrete defaults use GCCPricing's calibrated regional parity values,
// not direct local merchant quotations. Keep that distinction visible per input.
const REGIONAL_REFERENCE_MATERIAL_RATE_IDS: Partial<Record<'KW' | 'OM', string[]>> = {
  KW: ['footingConcrete', 'columnConcrete', 'stairConcrete', 'beamConcrete', 'slabConcrete'],
  OM: ['footingConcrete', 'columnConcrete', 'stairConcrete', 'beamConcrete', 'slabConcrete'],
};



const COUNTRY_OPTIONS: {
  id: CountryCode;
  currency: string;
  names: [string, string, string];
}[] = [
  { id: 'LB', currency: 'USD', names: ['Lebanon', 'لبنان', 'Liban'] },
  { id: 'AE', currency: 'AED', names: ['United Arab Emirates', 'الإمارات العربية المتحدة', 'Émirats arabes unis'] },
  { id: 'SA', currency: 'SAR', names: ['Saudi Arabia', 'السعودية', 'Arabie saoudite'] },
  { id: 'QA', currency: 'QAR', names: ['Qatar', 'قطر', 'Qatar'] },
  { id: 'KW', currency: 'KWD', names: ['Kuwait', 'الكويت', 'Koweït'] },
  { id: 'OM', currency: 'OMR', names: ['Oman', 'عُمان', 'Oman'] },
];

const translations = {
  en: {
    title: 'Full Building Calculator',
    subtitle: 'Complete building quantity and cost estimation',
    country: 'COUNTRY / CONSTRUCTION MARKET',
    ratesPending: 'Prefilled rates are incomplete for this market. Some labor rates are provisional planning allowances derived from local wage observations and productivity assumptions, not contractor quotations. Enter local unit rates below; the calculator shows a partial total and flags active items missing a required rate.',
    floors: 'FLOOR DIMENSIONS',
    addFloor: '+ ADD FLOOR',
    remove: 'Remove',
    length: 'Length (m)',
    width: 'Width (m)',
    height: 'Floor height (m)',
    openings: 'Doors and windows area (m²)',
    partitions: 'Internal partition wall area (m²)',
    structure: 'STRUCTURAL SPECIFICATIONS',
    footingCount: 'Number of footings',
    footingLength: 'Footing length (m)',
    footingWidth: 'Footing width (m)',
    footingDepth: 'Footing depth (m)',
    excavationDepth: 'Excavation depth (m)',
    columnCount: 'Number of columns',
    columnWidth: 'Column width (m)',
    columnDepth: 'Column depth (m)',
    beamLength: 'Total beam length (m)',
    beamWidth: 'Beam width (m)',
    beamDepth: 'Beam depth (m)',
    slabThickness: 'Slab thickness (m)',
    stairVolume: 'Staircase concrete volume (m³)',
    wall: 'WALL AND FINISHING SPECIFICATIONS',
    blockLength: 'Block length (cm)',
    blockHeight: 'Block height (cm)',
    plaster: 'Plaster coats / sides',
    paintCoats: 'Paint coats',
    paintCoverage: 'Paint coverage (m²/L)',
    tileWaste: 'Tile wastage (%)',
    waterproof: 'Roof waterproofing area (m²)',
    services: 'ELECTRICAL AND PLUMBING',
    electrical: 'Electrical points',
    plumbing: 'Plumbing points',
    prices: 'PROJECT ALLOWANCES (USD)',
    concretePrice: 'Concrete price per m³ ($)',
    blockPrice: 'Price per block ($)',
    plasterPrice: 'Plaster price per m² ($)',
    tilePrice: 'Tile price per m² ($)',
    paintPrice: 'Paint price per litre ($)',
    waterproofPrice: 'Waterproofing price per m² ($)',
    electricalPrice: 'Electrical point price ($)',
    plumbingPrice: 'Plumbing point price ($)',
    labor: 'Labor cost ($)',
    equipment: 'Equipment cost ($)',
    extra: 'Other costs ($)',
    contingency: 'Contingency (%)',
    calculate: 'CALCULATE ENTIRE BUILDING',
    results: 'BUILDING ESTIMATE',
    floorArea: 'Total floor area',
    excavation: 'Foundation excavation',
    concrete: 'Structural concrete',
    blocks: 'Blocks required',
    wallArea: 'Net wall area',
    plasterArea: 'Wall plaster area',
    tileArea: 'Floor tile area including wastage',
    paintLitres: 'Paint required',
    waterproofArea: 'Waterproofing area',
    electricalPoints: 'Electrical points',
    plumbingPoints: 'Plumbing points',
    materialTotal: 'Material and service estimate',
    laborResult: 'Labor',
    equipmentResult: 'Equipment',
    extraResult: 'Other costs',
    subtotal: 'Subtotal',
    pricedSubtotal: 'Priced items subtotal (missing rates excluded)',
    reserve: 'Contingency',
    pricedReserve: 'Contingency on priced items only',
    incompleteTotal: 'PARTIAL ESTIMATED TOTAL — MISSING RATES',
    incompleteValue: '—',
    total: 'TOTAL ESTIMATED COST',
    note: 'IMPORTANT ENGINEERING NOTE',
    warning: 'This is a preliminary quantity and cost estimate, not a structural design. Footing, column, beam, slab and reinforcement specifications must be supplied or approved by a qualified structural engineer. Electrical and plumbing quantities are preliminary floor-area allowances and must be checked against the project layouts.',
    invalid: 'Please enter valid positive dimensions and quantities.',
    professional: 'Professional mode: enter engineering specifications and actual unit prices.',
    homeowner: 'Homeowner mode: enter building dimensions and use contractor-supplied specifications and prices.',
    noFloors: 'At least one floor is required.',
    detailedCosts: 'DETAILED ITEMIZED COSTS',
    detailedHint: 'The market benchmarks above are reference observations only; they do not automatically set or update the detailed BOQ rates below. Lebanon USD BOQ rates remain editable planning allowances. For each item, keep material/service and labour rates separate. Add equipment, delivery/transport, waste disposal, permits and site management as separate project costs where applicable; do not double-count costs already included in an installed supplier rate. Unquoted trades remain provisional and must be checked against local quotations. Leave unused items at zero.',
    quantity: 'Quantity',
    materialUnit: 'Material or service / unit ($)',
    laborUnit: 'Labor / unit ($)',
    itemTotal: 'Item total',
    categoryTotal: 'Category subtotal',
    detailedMaterial: 'Itemized materials',
    detailedLabor: 'Itemized labor',
    detailedTotal: 'Total itemized costs',
  },
  ar: {
    title: 'حاسبة البناء الشاملة',
    subtitle: 'تقدير كميات وتكاليف المبنى بالكامل',
    country: 'الدولة / سوق البناء',
    ratesPending: 'الأسعار المعبأة مسبقاً لهذا السوق غير مكتملة. بعض أجور العمالة تقديرات تخطيطية أولية مبنية على أجور محلية وافتراضات إنتاجية وليست عروض أسعار من مقاولين. أدخل الأسعار المحلية في الجدول أدناه؛ سيعرض الحاسوب مجموعاً جزئياً وينبّهك إلى البنود المستخدمة التي ينقصها سعر مطلوب.',
    floors: 'أبعاد الطوابق',
    addFloor: '+ إضافة طابق',
    remove: 'حذف',
    length: 'الطول (م)',
    width: 'العرض (م)',
    height: 'ارتفاع الطابق (م)',
    openings: 'مساحة الأبواب والنوافذ (م²)',
    partitions: 'مساحة الجدران الداخلية (م²)',
    structure: 'مواصفات الهيكل الإنشائي',
    footingCount: 'عدد القواعد',
    footingLength: 'طول القاعدة (م)',
    footingWidth: 'عرض القاعدة (م)',
    footingDepth: 'عمق القاعدة (م)',
    excavationDepth: 'عمق الحفر (م)',
    columnCount: 'عدد الأعمدة',
    columnWidth: 'عرض العمود (م)',
    columnDepth: 'عمق العمود (م)',
    beamLength: 'إجمالي طول الجسور (م)',
    beamWidth: 'عرض الجسر (م)',
    beamDepth: 'عمق الجسر (م)',
    slabThickness: 'سماكة البلاطة (م)',
    stairVolume: 'حجم باطون الدرج (م³)',
    wall: 'مواصفات الجدران والتشطيبات',
    blockLength: 'طول البلوك (سم)',
    blockHeight: 'ارتفاع البلوك (سم)',
    plaster: 'عدد أوجه القصارة',
    paintCoats: 'عدد طبقات الدهان',
    paintCoverage: 'تغطية الدهان (م²/لتر)',
    tileWaste: 'نسبة هدر البلاط (%)',
    waterproof: 'مساحة عزل السطح (م²)',
    services: 'الكهرباء والسباكة',
    electrical: 'عدد نقاط الكهرباء',
    plumbing: 'عدد نقاط السباكة',
    prices: 'مصاريف المشروع الإضافية (دولار)',
    concretePrice: 'سعر الباطون للمتر المكعب ($)',
    blockPrice: 'سعر البلوكة ($)',
    plasterPrice: 'سعر القصارة للمتر المربع ($)',
    tilePrice: 'سعر البلاط للمتر المربع ($)',
    paintPrice: 'سعر لتر الدهان ($)',
    waterproofPrice: 'سعر العزل للمتر المربع ($)',
    electricalPrice: 'سعر نقطة الكهرباء ($)',
    plumbingPrice: 'سعر نقطة السباكة ($)',
    labor: 'تكلفة العمالة ($)',
    equipment: 'تكلفة المعدات ($)',
    extra: 'تكاليف أخرى ($)',
    contingency: 'نسبة الاحتياطي (%)',
    calculate: 'احسب المبنى بالكامل',
    results: 'تقدير المبنى',
    floorArea: 'إجمالي مساحة الطوابق',
    excavation: 'حفر الأساسات',
    concrete: 'باطون الهيكل الإنشائي',
    blocks: 'عدد البلوك المطلوب',
    wallArea: 'مساحة الجدران الصافية',
    plasterArea: 'مساحة قصارة الجدران',
    tileArea: 'مساحة البلاط مع الهدر',
    paintLitres: 'كمية الدهان المطلوبة',
    waterproofArea: 'مساحة العزل',
    electricalPoints: 'نقاط الكهرباء',
    plumbingPoints: 'نقاط السباكة',
    materialTotal: 'تقدير المواد والخدمات',
    laborResult: 'العمالة',
    equipmentResult: 'المعدات',
    extraResult: 'تكاليف أخرى',
    subtotal: 'المجموع الفرعي',
    pricedSubtotal: 'مجموع البنود المسعّرة فقط (لا يشمل الأسعار الناقصة)',
    reserve: 'الاحتياطي',
    pricedReserve: 'احتياطي البنود المسعّرة فقط',
    incompleteTotal: 'الإجمالي التقديري الجزئي — توجد أسعار ناقصة',
    incompleteValue: '—',
    total: 'التكلفة الإجمالية التقديرية',
    note: 'ملاحظة هندسية مهمة',
    warning: 'هذا تقدير أولي للكميات والتكاليف وليس تصميماً إنشائياً. يجب أن يحدد أو يعتمد مهندس إنشائي مؤهل أبعاد القواعد والأعمدة والجسور والبلاطات وحديد التسليح. كميات الكهرباء والسباكة تقديرية حسب مساحة الطوابق ويجب مراجعتها وفق مخططات المشروع.',
    invalid: 'يرجى إدخال أبعاد وكميات صحيحة وموجبة.',
    professional: 'الوضع المهني: أدخل المواصفات الهندسية وأسعار الوحدات الفعلية.',
    homeowner: 'وضع صاحب المنزل: أدخل أبعاد المبنى واستخدم المواصفات والأسعار المقدمة من المقاول.',
    noFloors: 'يجب إضافة طابق واحد على الأقل.',
    detailedCosts: 'تفصيل تكاليف جميع البنود',
    detailedHint: 'مؤشرات السوق أعلاه مراجع للاطلاع فقط؛ ولا تضبط أسعار جدول الكميات التفصيلي أدناه أو تحدّثها تلقائياً. تبقى أسعار جدول الكميات في لبنان بالدولار تقديرات تخطيطية قابلة للتعديل. افصل تكلفة المواد أو الخدمة عن أجرة العمالة في كل بند. أضف المعدات والتوصيل والنقل وترحيل النفايات والرخص وإدارة الموقع كبنود مستقلة عند الحاجة، ولا تكرر أي كلفة مشمولة أصلاً في سعر التوريد والتركيب. تبقى المهن غير المسعّرة تقديرات أولية ويجب التحقق منها بعروض محلية. اترك البنود غير المستخدمة صفراً.',
    quantity: 'الكمية',
    materialUnit: 'المواد أو الخدمة / الوحدة ($)',
    laborUnit: 'العمل / الوحدة ($)',
    itemTotal: 'مجموع البند',
    categoryTotal: 'مجموع القسم',
    detailedMaterial: 'مواد البنود التفصيلية',
    detailedLabor: 'عمالة البنود التفصيلية',
    detailedTotal: 'إجمالي التكاليف التفصيلية',
  },
  fr: {
    title: 'Calculateur complet du bâtiment',
    subtitle: 'Estimation complète des quantités et des coûts',
    country: 'PAYS / MARCHÉ DE CONSTRUCTION',
    ratesPending: 'Les tarifs préremplis de ce marché sont incomplets. Certains tarifs de main-d’œuvre sont des estimations provisoires fondées sur les salaires locaux et des hypothèses de productivité, et non des devis d’entrepreneurs. Les tarifs libanais en USD ne sont pas appliqués ; le calculateur affiche un sous-total et signale les postes actifs auxquels il manque un tarif.',
    floors: 'DIMENSIONS DES ÉTAGES',
    addFloor: '+ AJOUTER UN ÉTAGE',
    remove: 'Supprimer',
    length: 'Longueur (m)',
    width: 'Largeur (m)',
    height: 'Hauteur (m)',
    openings: 'Surface des portes et fenêtres (m²)',
    partitions: 'Surface des cloisons intérieures (m²)',
    structure: 'SPÉCIFICATIONS STRUCTURELLES',
    footingCount: 'Nombre de semelles',
    footingLength: 'Longueur de semelle (m)',
    footingWidth: 'Largeur de semelle (m)',
    footingDepth: 'Profondeur de semelle (m)',
    excavationDepth: 'Profondeur d’excavation (m)',
    columnCount: 'Nombre de poteaux',
    columnWidth: 'Largeur du poteau (m)',
    columnDepth: 'Profondeur du poteau (m)',
    beamLength: 'Longueur totale des poutres (m)',
    beamWidth: 'Largeur de poutre (m)',
    beamDepth: 'Profondeur de poutre (m)',
    slabThickness: 'Épaisseur de dalle (m)',
    stairVolume: 'Volume de béton des escaliers (m³)',
    wall: 'MURS ET FINITIONS',
    blockLength: 'Longueur du bloc (cm)',
    blockHeight: 'Hauteur du bloc (cm)',
    plaster: 'Nombre de faces à enduire',
    paintCoats: 'Couches de peinture',
    paintCoverage: 'Couverture peinture (m²/L)',
    tileWaste: 'Pertes de carrelage (%)',
    waterproof: 'Surface d’étanchéité du toit (m²)',
    services: 'ÉLECTRICITÉ ET PLOMBERIE',
    electrical: 'Points électriques',
    plumbing: 'Points de plomberie',
    prices: 'FRAIS SUPPLÉMENTAIRES (USD)',
    concretePrice: 'Prix du béton par m³ ($)',
    blockPrice: 'Prix par bloc ($)',
    plasterPrice: 'Prix enduit par m² ($)',
    tilePrice: 'Prix carrelage par m² ($)',
    paintPrice: 'Prix peinture par litre ($)',
    waterproofPrice: 'Prix étanchéité par m² ($)',
    electricalPrice: 'Prix par point électrique ($)',
    plumbingPrice: 'Prix par point plomberie ($)',
    labor: 'Main-d’œuvre ($)',
    equipment: 'Équipement ($)',
    extra: 'Autres coûts ($)',
    contingency: 'Imprévus (%)',
    calculate: 'CALCULER LE BÂTIMENT',
    results: 'ESTIMATION DU BÂTIMENT',
    floorArea: 'Surface totale des étages',
    excavation: 'Excavation des fondations',
    concrete: 'Béton structurel',
    blocks: 'Blocs nécessaires',
    wallArea: 'Surface nette des murs',
    plasterArea: 'Surface des murs à enduire',
    tileArea: 'Carrelage avec pertes',
    paintLitres: 'Peinture nécessaire',
    waterproofArea: 'Surface d’étanchéité',
    electricalPoints: 'Points électriques',
    plumbingPoints: 'Points de plomberie',
    materialTotal: 'Estimation matériaux et services',
    laborResult: 'Main-d’œuvre',
    equipmentResult: 'Équipement',
    extraResult: 'Autres coûts',
    subtotal: 'Sous-total',
    pricedSubtotal: 'Sous-total des postes chiffrés uniquement',
    reserve: 'Imprévus',
    pricedReserve: 'Imprévus sur les postes chiffrés uniquement',
    incompleteTotal: 'TOTAL ESTIMÉ PARTIEL — TARIFS MANQUANTS',
    incompleteValue: '—',
    total: 'COÛT TOTAL ESTIMÉ',
    note: 'NOTE TECHNIQUE IMPORTANTE',
    warning: 'Cette estimation préliminaire ne constitue pas une conception structurelle. Les dimensions des semelles, poteaux, poutres, dalles et armatures doivent être fournies ou validées par un ingénieur qualifié. Les quantités électriques et de plomberie sont estimées selon la surface des étages et doivent être vérifiées sur les plans du projet.',
    invalid: 'Veuillez saisir des dimensions et quantités positives valides.',
    professional: 'Mode professionnel : saisissez les spécifications techniques et les prix réels.',
    homeowner: 'Mode propriétaire : saisissez les dimensions et utilisez les spécifications et prix du constructeur.',
    noFloors: 'Au moins un étage est requis.',
    detailedCosts: 'COÛTS DÉTAILLÉS PAR POSTE',
    detailedHint: 'Les références de marché ci-dessus sont fournies à titre indicatif uniquement ; elles ne définissent ni ne mettent automatiquement à jour les tarifs détaillés du bordereau ci-dessous. Les tarifs du bordereau libanais en USD restent des estimations de planification modifiables. Séparez les matériaux/fournitures et la main-d’œuvre pour chaque poste. Ajoutez séparément l’équipement, la livraison/le transport, l’évacuation des déchets, les permis et la gestion du chantier si nécessaire ; ne comptez pas deux fois les coûts déjà inclus dans un prix fourni et posé. Les métiers sans tarif publié restent provisoires et doivent être vérifiés par des devis locaux. Laissez les postes inutilisés à zéro.',
    quantity: 'Quantité',
    materialUnit: 'Matériaux ou service / unité ($)',
    laborUnit: 'Main-d’œuvre / unité ($)',
    itemTotal: 'Total du poste',
    categoryTotal: 'Total de catégorie',
    detailedMaterial: 'Matériaux détaillés',
    detailedLabor: 'Main-d’œuvre détaillée',
    detailedTotal: 'Total des coûts détaillés',
  },
};

const COST_CATEGORIES = [
  { id: 'earthworks', names: ['Earthworks', 'الأعمال الترابية', 'Terrassement'] },
  { id: 'foundation', names: ['Foundation', 'الأساسات', 'Fondations'] },
  { id: 'structure', names: ['Structural works', 'الأعمال الإنشائية', 'Gros œuvre'] },
  { id: 'masonry', names: ['Masonry', 'أعمال البناء', 'Maçonnerie'] },
  { id: 'roofing', names: ['Roofing and insulation', 'الأسطح والعزل', 'Toiture et isolation'] },
  { id: 'plaster', names: ['Plastering', 'القصارة', 'Enduits'] },
  { id: 'electrical', names: ['Electrical works', 'الأعمال الكهربائية', 'Électricité'] },
  { id: 'plumbing', names: ['Plumbing and drainage', 'التمديدات الصحية', 'Plomberie'] },
  { id: 'sanitary', names: ['Sanitary fixtures', 'الأدوات الصحية', 'Équipements sanitaires'] },
  { id: 'elevator', names: ['Elevator', 'المصعد', 'Ascenseur'] },
  { id: 'tiling', names: ['Tiling and flooring', 'البلاط والأرضيات', 'Carrelage et sols'] },
  { id: 'openings', names: ['Doors and windows', 'الأبواب والنوافذ', 'Portes et fenêtres'] },
  { id: 'painting', names: ['Painting', 'الدهان', 'Peinture'] },
  { id: 'ceiling', names: ['Ceilings', 'الأسقف المستعارة', 'Plafonds'] },
  { id: 'facade', names: ['Facade and external works', 'الواجهات والأعمال الخارجية', 'Façade et extérieurs'] },
  { id: 'other', names: ['Other expenses', 'مصاريف أخرى', 'Autres dépenses'] },
] as const;

const COST_ITEMS: CostItem[] = [
  // 1. EARTHWORKS
  { id: 'excavation', category: 'earthworks', names: ['Excavation', 'حفر التربة', 'Excavation'], unit: 'm³', requiresLabor: false },
  { id: 'soilRemoval', category: 'earthworks', names: ['Soil removal and disposal', 'نقل وترحيل الأتربة', 'Évacuation des terres'], unit: 'm³', requiresLabor: false },
  { id: 'backfilling', category: 'earthworks', names: ['Backfilling', 'ردم التربة', 'Remblayage'], unit: 'm³', requiresLabor: false },
  { id: 'soilCompaction', category: 'earthworks', names: ['Soil compaction', 'دك التربة', 'Compactage du sol'], unit: 'm²', requiresLabor: false },
  { id: 'sitePreparation', category: 'earthworks', names: ['Site preparation', 'تجهيز الموقع', 'Préparation du chantier'], unit: 'm²', requiresLabor: false },

  // 2. FOUNDATION
  { id: 'leanConcrete', category: 'foundation', names: ['Blinding concrete', 'خرسانة النظافة', 'Béton de propreté'], unit: 'm³' },
  { id: 'footingConcrete', category: 'foundation', names: ['Footing concrete', 'خرسانة القواعد', 'Béton des semelles'], unit: 'm³' },
  { id: 'foundationSteel', category: 'foundation', names: ['Foundation reinforcement steel', 'حديد تسليح الأساسات', 'Acier des fondations'], unit: 'kg' },
  { id: 'foundationFormwork', category: 'foundation', names: ['Foundation formwork', 'قوالب الأساسات', 'Coffrage des fondations'], unit: 'm²' },
  { id: 'foundationWaterproofing', category: 'foundation', names: ['Foundation waterproofing', 'عزل الأساسات', 'Étanchéité des fondations'], unit: 'm²' },

  // 3. STRUCTURE
  { id: 'columnConcrete', category: 'structure', names: ['Column concrete', 'خرسانة الأعمدة', 'Béton des poteaux'], unit: 'm³' },
  { id: 'stairConcrete', category: 'structure', names: ['Staircase concrete', 'خرسانة الدرج', 'Béton des escaliers'], unit: 'm³' },
  { id: 'beamConcrete', category: 'structure', names: ['Beam concrete', 'خرسانة الجسور', 'Béton des poutres'], unit: 'm³' },
  { id: 'slabConcrete', category: 'structure', names: ['Slab concrete', 'خرسانة الأسقف', 'Béton des dalles'], unit: 'm³' },
  { id: 'structuralSteel', category: 'structure', names: ['Structural reinforcement steel', 'حديد التسليح الإنشائي', 'Acier de structure'], unit: 'kg' },
  { id: 'columnFormwork', category: 'structure', names: ['Column formwork', 'قوالب الأعمدة', 'Coffrage des poteaux'], unit: 'm²' },
  { id: 'beamFormwork', category: 'structure', names: ['Beam formwork', 'قوالب الجسور', 'Coffrage des poutres'], unit: 'm²' },
  { id: 'slabFormwork', category: 'structure', names: ['Slab formwork', 'قوالب الأسقف', 'Coffrage des dalles'], unit: 'm²' },
  { id: 'scaffolding', category: 'structure', names: ['Scaffolding and supports', 'السقالات والدعائم', 'Échafaudages et étais'], unit: 'm²', requiresLabor: false },

  // 4. MASONRY
  { id: 'externalBlocks', category: 'masonry', names: ['External wall blocks', 'بلوك الجدران الخارجية', 'Blocs des murs extérieurs'], unit: 'm²' },
  { id: 'internalBlocks', category: 'masonry', names: ['Internal wall blocks', 'بلوك القواطع الداخلية', 'Blocs des cloisons intérieures'], unit: 'm²' },
  { id: 'cementMasonry', category: 'masonry', names: ['Cement for masonry', 'إسمنت البناء', 'Ciment de maçonnerie'], unit: 'bag', requiresLabor: false },
  { id: 'sandMasonry', category: 'masonry', names: ['Sand for masonry', 'رمل البناء', 'Sable de maçonnerie'], unit: 'm³', requiresLabor: false },
  { id: 'lintels', category: 'masonry', names: ['Door and window lintels', 'عتبات الأبواب والنوافذ', 'Linteaux des portes et fenêtres'], unit: 'm' },

  // 5. ROOFING
  { id: 'roofThermalInsulation', category: 'roofing', names: ['Thermal insulation', 'العزل الحراري', 'Isolation thermique'], unit: 'm²' },
  { id: 'roofWaterproofing', category: 'roofing', names: ['Roof waterproofing membrane', 'عزل السطح المائي', 'Membrane d’étanchéité'], unit: 'm²' },
  { id: 'roofScreed', category: 'roofing', names: ['Roof screed', 'ميول وتسوية السطح', 'Chape de toiture'], unit: 'm²' },
  { id: 'roofProtection', category: 'roofing', names: ['Waterproofing protection layer', 'طبقة حماية العزل', 'Couche de protection'], unit: 'm²' },
  { id: 'roofDrainage', category: 'roofing', names: ['Roof drainage outlets', 'مصارف مياه السطح', 'Évacuations de toiture'], unit: 'pcs' },

  // 6. PLASTER
  { id: 'internalPlaster', category: 'plaster', names: ['Internal plaster', 'قصارة داخلية', 'Enduit intérieur'], unit: 'm²' },
  { id: 'externalPlaster', category: 'plaster', names: ['External plaster', 'قصارة خارجية', 'Enduit extérieur'], unit: 'm²' },
  { id: 'ceilingPlaster', category: 'plaster', names: ['Ceiling plaster', 'قصارة الأسقف', 'Enduit de plafond'], unit: 'm²' },
  { id: 'plasterMesh', category: 'plaster', names: ['Plaster reinforcement mesh', 'شبك القصارة', 'Treillis pour enduit'], unit: 'm²' },
  { id: 'plasterMaterials', category: 'plaster', names: ['Plaster cement and sand', 'إسمنت ورمل القصارة', 'Ciment et sable pour enduit'], unit: 'm³', requiresLabor: false },

  // 7. ELECTRICAL
  { id: 'lightingPoints', category: 'electrical', names: ['Lighting points', 'نقاط إنارة', 'Points lumineux'], unit: 'pcs' },
  { id: 'singleSockets', category: 'electrical', names: ['Single socket outlets', 'مآخذ كهرباء مفردة', 'Prises simples'], unit: 'pcs' },
  { id: 'doubleSockets', category: 'electrical', names: ['Double socket outlets', 'مآخذ كهرباء مزدوجة', 'Prises doubles'], unit: 'pcs' },
  { id: 'acPoints', category: 'electrical', names: ['Air-conditioning points', 'نقاط المكيفات', 'Points de climatisation'], unit: 'pcs' },
  { id: 'waterHeaterPoints', category: 'electrical', names: ['Water-heater points', 'نقاط سخانات المياه', 'Points chauffe-eau'], unit: 'pcs' },
  { id: 'tvPoints', category: 'electrical', names: ['TV points', 'نقاط التلفاز', 'Prises TV'], unit: 'pcs' },
  { id: 'internetPoints', category: 'electrical', names: ['Internet points', 'نقاط الإنترنت', 'Prises Internet'], unit: 'pcs' },
  { id: 'switchPoints', category: 'electrical', names: ['Switches and control points', 'مفاتيح ونقاط تحكم', 'Interrupteurs et commandes'], unit: 'pcs' },
  { id: 'distributionBoard', category: 'electrical', names: ['Electrical distribution board', 'لوحة التوزيع الكهربائية', 'Tableau électrique'], unit: 'pcs' },
  { id: 'electricalCables', category: 'electrical', names: ['Electrical cables', 'كابلات كهربائية', 'Câbles électriques'], unit: 'm' },
  { id: 'electricalConduits', category: 'electrical', names: ['Electrical conduits', 'مواسير كهربائية', 'Conduits électriques'], unit: 'm' },
  { id: 'grounding', category: 'electrical', names: ['Grounding system', 'نظام التأريض', 'Système de mise à la terre'], unit: 'set' },

  // 8. PLUMBING
  { id: 'coldWaterPoints', category: 'plumbing', names: ['Cold-water points', 'نقاط مياه باردة', 'Points d’eau froide'], unit: 'pcs' },
  { id: 'hotWaterPoints', category: 'plumbing', names: ['Hot-water points', 'نقاط مياه ساخنة', 'Points d’eau chaude'], unit: 'pcs' },
  { id: 'toiletConnections', category: 'plumbing', names: ['Toilet connections', 'توصيلات المرحاض', 'Raccordements WC'], unit: 'pcs' },
  { id: 'showerConnections', category: 'plumbing', names: ['Shower connections', 'توصيلات الدش', 'Raccordements douche'], unit: 'pcs' },
  { id: 'basinConnections', category: 'plumbing', names: ['Basin connections', 'توصيلات المغاسل', 'Raccordements lavabo'], unit: 'pcs' },
  { id: 'kitchenConnections', category: 'plumbing', names: ['Kitchen sink connections', 'توصيلات حوض المطبخ', 'Raccordements évier cuisine'], unit: 'pcs' },
  { id: 'drainagePipes', category: 'plumbing', names: ['Drainage pipes', 'أنابيب الصرف الصحي', 'Tuyaux d’évacuation'], unit: 'm' },
  { id: 'waterPipes', category: 'plumbing', names: ['Water supply pipes', 'أنابيب تغذية المياه', 'Tuyaux d’alimentation en eau'], unit: 'm' },
  { id: 'waterTank', category: 'plumbing', names: ['Water storage tank', 'خزان مياه', 'Réservoir d’eau'], unit: 'pcs' },
  { id: 'waterPump', category: 'plumbing', names: ['Water pump', 'مضخة مياه', 'Pompe à eau'], unit: 'pcs' },

  // 9. SANITARY
  { id: 'toilets', category: 'sanitary', names: ['Toilets', 'مراحيض', 'Toilettes'], unit: 'pcs' },
  { id: 'washBasins', category: 'sanitary', names: ['Wash basins', 'مغاسل', 'Lavabos'], unit: 'pcs' },
  { id: 'showers', category: 'sanitary', names: ['Shower sets', 'أطقم دش', 'Ensembles de douche'], unit: 'pcs' },
  { id: 'faucets', category: 'sanitary', names: ['Faucets and mixers', 'حنفيات وخلاطات', 'Robinets et mitigeurs'], unit: 'pcs' },
  { id: 'sanitaryAccessories', category: 'sanitary', names: ['Sanitary accessories', 'إكسسوارات صحية', 'Accessoires sanitaires'], unit: 'set' },

  // 10. ELEVATOR
  { id: 'elevatorCabin', category: 'elevator', names: ['Elevator cabin', 'كابينة المصعد', 'Cabine d’ascenseur'], unit: 'pcs' },
  { id: 'elevatorMotor', category: 'elevator', names: ['Elevator motor', 'محرك المصعد', 'Moteur d’ascenseur'], unit: 'pcs' },
  { id: 'elevatorController', category: 'elevator', names: ['Elevator controller', 'لوحة تحكم المصعد', 'Contrôleur d’ascenseur'], unit: 'pcs' },
  { id: 'elevatorRails', category: 'elevator', names: ['Guide rails and brackets', 'سكك التوجيه والحمالات', 'Rails de guidage et supports'], unit: 'set' },
  { id: 'elevatorLandingDoors', category: 'elevator', names: ['Landing doors (per floor)', 'أبواب الطوابق', 'Portes palières (par étage)'], unit: 'pcs' },
  { id: 'elevatorCables', category: 'elevator', names: ['Elevator cables and ropes', 'كوابل وحبال المصعد', 'Câbles et cordes'], unit: 'set' },
  { id: 'elevatorSafety', category: 'elevator', names: ['Safety and emergency system', 'نظام السلامة والطوارئ', 'Système de sécurité et urgence'], unit: 'set' },
  { id: 'elevatorInstallation', category: 'elevator', names: ['Elevator installation and testing', 'تركيب وفحص المصعد', 'Installation et essais'], unit: 'job', requiresMaterial: false },

  // 11. TILING
  { id: 'floorTiles', category: 'tiling', names: ['Floor tiles', 'بلاط الأرضيات', 'Carrelage de sol'], unit: 'm²' },
  { id: 'wallTiles', category: 'tiling', names: ['Wall tiles', 'بلاط الجدران', 'Carrelage mural'], unit: 'm²' },
  { id: 'tileAdhesive', category: 'tiling', names: ['Tile adhesive', 'لاصق البلاط', 'Colle à carrelage'], unit: 'bag', requiresLabor: false },
  { id: 'tileGrout', category: 'tiling', names: ['Tile grout', 'روبة البلاط', 'Joint de carrelage'], unit: 'bag', requiresLabor: false },
  { id: 'skirting', category: 'tiling', names: ['Skirting tiles', 'وزرات البلاط', 'Plinthes carrelées'], unit: 'm' },

  // 12. OPENINGS
  { id: 'internalDoors', category: 'openings', names: ['Internal doors', 'أبواب داخلية', 'Portes intérieures'], unit: 'pcs' },
  { id: 'externalDoors', category: 'openings', names: ['External doors', 'أبواب خارجية', 'Portes extérieures'], unit: 'pcs' },
  { id: 'aluminumWindows', category: 'openings', names: ['Aluminium windows', 'نوافذ ألمنيوم', 'Fenêtres en aluminium'], unit: 'm²' },
  { id: 'glassWork', category: 'openings', names: ['Glass and glazing', 'أعمال الزجاج', 'Vitrage'], unit: 'm²' },
  { id: 'doorHardware', category: 'openings', names: ['Door locks and hardware', 'أقفال وإكسسوارات الأبواب', 'Serrures et quincaillerie'], unit: 'set' },

  // 13. PAINTING
  { id: 'wallPrimer', category: 'painting', names: ['Wall primer', 'وجه أساس للجدران', 'Primaire mural'], unit: 'm²' },
  { id: 'wallPutty', category: 'painting', names: ['Wall putty and preparation', 'معجون وتجهيز الجدران', 'Enduit de préparation'], unit: 'm²' },
  { id: 'interiorPaint', category: 'painting', names: ['Interior paint', 'دهان داخلي', 'Peinture intérieure'], unit: 'm²' },
  { id: 'exteriorPaint', category: 'painting', names: ['Exterior paint', 'دهان خارجي', 'Peinture extérieure'], unit: 'm²' },
  { id: 'metalWoodPaint', category: 'painting', names: ['Metal and wood paint', 'دهان المعادن والخشب', 'Peinture métal et bois'], unit: 'm²' },

  // 14. CEILINGS
  { id: 'falseCeiling', category: 'ceiling', names: ['False ceiling', 'سقف مستعار', 'Faux plafond'], unit: 'm²' },
  { id: 'ceilingFrame', category: 'ceiling', names: ['Ceiling suspension frame', 'هيكل السقف المستعار', 'Ossature de plafond'], unit: 'm²' },
  { id: 'ceilingInsulation', category: 'ceiling', names: ['Ceiling insulation', 'عزل الأسقف', 'Isolation du plafond'], unit: 'm²' },
  { id: 'ceilingAccessPanels', category: 'ceiling', names: ['Ceiling access panels', 'فتحات صيانة السقف', 'Trappes de visite'], unit: 'pcs' },
  { id: 'ceilingFinishing', category: 'ceiling', names: ['Ceiling finishing', 'تشطيب الأسقف', 'Finition des plafonds'], unit: 'm²' },

  // 15. FACADE AND EXTERNAL WORKS
  { id: 'facadeFinish', category: 'facade', names: ['Facade finish and cladding', 'تشطيب وكسوة الواجهة', 'Finition et revêtement façade'], unit: 'm²' },
  { id: 'externalPaving', category: 'facade', names: ['External paving', 'تبليط خارجي', 'Pavage extérieur'], unit: 'm²' },
  { id: 'balustrades', category: 'facade', names: ['Balcony railings', 'درابزين الشرفات', 'Garde-corps des balcons'], unit: 'm' },
  { id: 'externalStairs', category: 'facade', names: ['External stairs and steps', 'درج خارجي', 'Escaliers extérieurs'], unit: 'm²' },
  { id: 'landscaping', category: 'facade', names: ['Landscaping and external works', 'تنسيق الموقع والأعمال الخارجية', 'Aménagement paysager'], unit: 'm²' },

  // 16. OTHER
  { id: 'transport', category: 'other', names: ['Material transportation', 'نقل المواد', 'Transport des matériaux'], unit: 'job', requiresLabor: false },
  { id: 'wasteDisposal', category: 'other', names: ['Construction waste disposal', 'ترحيل مخلفات البناء', 'Évacuation des déchets'], unit: 'job', requiresLabor: false },
  { id: 'permits', category: 'other', names: ['Permits and inspections', 'رخص وفحوصات', 'Permis et inspections'], unit: 'job', requiresLabor: false },
  { id: 'siteManagement', category: 'other', names: ['Site management', 'إدارة الموقع', 'Gestion du chantier'], unit: 'job', requiresMaterial: false },
  { id: 'miscellaneous', category: 'other', names: ['Miscellaneous expenses', 'مصاريف متنوعة', 'Dépenses diverses'], unit: 'job', requiresLabor: false },
];

// Lebanon USD planning benchmarks (November 2026). These are editable
// starting allowances, not binding supplier quotations. Publicly listed local
// prices anchor cement, tiles, waterproofing products, paint and aluminium;
// unquoted trades use conservative local estimating allowances and require
// project-specific contractor confirmation.
const DEFAULT_MATERIAL_RATES: Record<string, string> = {
  excavation: '8', soilRemoval: '7', backfilling: '5', soilCompaction: '1.5', sitePreparation: '2',
  leanConcrete: '125', footingConcrete: '135', foundationSteel: '0.68', foundationFormwork: '5', foundationWaterproofing: '12',
  columnConcrete: '135', stairConcrete: '135', beamConcrete: '135', slabConcrete: '135', structuralSteel: '0.68',
  columnFormwork: '5', beamFormwork: '5', slabFormwork: '5', scaffolding: '4',
  externalBlocks: '14.7', internalBlocks: '9', cementMasonry: '8.5', sandMasonry: '25', lintels: '18',
  roofThermalInsulation: '12', roofWaterproofing: '12', roofScreed: '5', roofProtection: '4', roofDrainage: '15',
  internalPlaster: '3.5', externalPlaster: '4', ceilingPlaster: '3.5', plasterMesh: '1.5', plasterMaterials: '75',
  lightingPoints: '18', singleSockets: '8', doubleSockets: '12', acPoints: '20', waterHeaterPoints: '15',
  tvPoints: '8', internetPoints: '8', switchPoints: '5', distributionBoard: '80', electricalCables: '1.2',
  electricalConduits: '0.35', grounding: '100',
  coldWaterPoints: '15', hotWaterPoints: '18', toiletConnections: '20', showerConnections: '20',
  basinConnections: '15', kitchenConnections: '20', drainagePipes: '4', waterPipes: '3',
  waterTank: '250', waterPump: '180',
  toilets: '180', washBasins: '80', showers: '150', faucets: '45', sanitaryAccessories: '50',
  elevatorCabin: '4000', elevatorMotor: '2500', elevatorController: '1800', elevatorRails: '1000',
  elevatorLandingDoors: '500', elevatorCables: '700', elevatorSafety: '900',
  floorTiles: '8', wallTiles: '5', tileAdhesive: '20', tileGrout: '12', skirting: '4',
  internalDoors: '150', externalDoors: '500', aluminumWindows: '65', glassWork: '20', doorHardware: '30',
  wallPrimer: '1.2', wallPutty: '1.5', interiorPaint: '2.5', exteriorPaint: '3.5', metalWoodPaint: '3',
  falseCeiling: '15', ceilingFrame: '6', ceilingInsulation: '4', ceilingAccessPanels: '25', ceilingFinishing: '5',
  facadeFinish: '25', externalPaving: '12', balustrades: '60', externalStairs: '35', landscaping: '15',
  transport: '250', wasteDisposal: '300', permits: '1000', miscellaneous: '500',
};

const DEFAULT_LABOR_RATES: Record<string, string> = {
  leanConcrete: '25', footingConcrete: '28', foundationSteel: '0.18', foundationFormwork: '8', foundationWaterproofing: '5',
  columnConcrete: '28', stairConcrete: '32', beamConcrete: '28', slabConcrete: '25', structuralSteel: '0.18',
  columnFormwork: '8', beamFormwork: '8', slabFormwork: '7',
  externalBlocks: '8', internalBlocks: '7', lintels: '6',
  roofThermalInsulation: '4', roofWaterproofing: '6', roofScreed: '6', roofProtection: '3', roofDrainage: '10',
  internalPlaster: '4.5', externalPlaster: '5.5', ceilingPlaster: '5', plasterMesh: '0.5',
  lightingPoints: '15', singleSockets: '8', doubleSockets: '10', acPoints: '15', waterHeaterPoints: '12',
  tvPoints: '8', internetPoints: '8', switchPoints: '5', distributionBoard: '40', electricalCables: '0.35',
  electricalConduits: '0.25', grounding: '40',
  coldWaterPoints: '12', hotWaterPoints: '14', toiletConnections: '15', showerConnections: '15',
  basinConnections: '12', kitchenConnections: '15', drainagePipes: '1.5', waterPipes: '1.25',
  waterTank: '50', waterPump: '50',
  toilets: '35', washBasins: '25', showers: '40', faucets: '15', sanitaryAccessories: '20',
  elevatorCabin: '500', elevatorMotor: '300', elevatorController: '250', elevatorRails: '250',
  elevatorLandingDoors: '100', elevatorCables: '100', elevatorSafety: '150', elevatorInstallation: '2500',
  floorTiles: '10', wallTiles: '12', skirting: '3',
  internalDoors: '50', externalDoors: '100', aluminumWindows: '10', glassWork: '3', doorHardware: '20',
  wallPrimer: '0.5', wallPutty: '2', interiorPaint: '2.5', exteriorPaint: '3', metalWoodPaint: '4',
  falseCeiling: '8', ceilingFrame: '4', ceilingInsulation: '2', ceilingAccessPanels: '10', ceilingFinishing: '4',
  facadeFinish: '15', externalPaving: '8', balustrades: '25', externalStairs: '25', landscaping: '8',
  siteManagement: '2000',
};

function createDetailedCostValues(): DetailedValues {
  const values: DetailedValues = {};
  COST_ITEMS.forEach(item => {
    values[`${item.id}Qty`] = '0';
    values[`${item.id}Material`] = DEFAULT_MATERIAL_RATES[item.id] ?? '0';
    values[`${item.id}Labor`] = DEFAULT_LABOR_RATES[item.id] ?? '0';
  });
  return values;
}

// GCC markets start with country-specific local rates where supported; all other
// rates remain editable zeros and are flagged when their line item is used.
function createCountryCostValues(
  country: Exclude<CountryCode, 'LB'>
): DetailedValues {
  const values: DetailedValues = {};
  const sourcedRates = COUNTRY_ITEM_RATE_DEFAULTS[country] ?? {};
  COST_ITEMS.forEach(item => {
    const sourcedRate = sourcedRates[item.id];
    values[`${item.id}Qty`] = '0';
    values[`${item.id}Material`] = sourcedRate
      ? String(sourcedRate.material)
      : '0';
    values[`${item.id}Labor`] = sourcedRate
      ? String(sourcedRate.labor)
      : '0';
  });
  return values;
}

const initialFloor = (id: number): FloorData => ({
  id,
  length: '15',
  width: '12',
  height: '3',
  openings: '12',
  partitions: '30',
});

const initialValues: Record<string, string> = {
  footingCount: '12',
  footingLength: '1.5',
  footingWidth: '1.5',
  footingDepth: '0.5',
  excavationDepth: '0.8',
  columnCount: '12',
  columnWidth: '0.3',
  columnDepth: '0.3',
  beamLength: '120',
  beamWidth: '0.25',
  beamDepth: '0.5',
  slabThickness: '0.18',
  stairVolume: '2',
  blockLength: '40',
  blockHeight: '20',
  paintCoats: '2',
  paintCoverage: '10',
  tileWaste: '10',
  waterproof: '180',
  equipment: '0',
  extra: '0',
  contingency: '10',
};

const number = (values: Record<string, string>, key: string) =>
  Number(values[key] ?? 0);

const money = (value: number, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

const quantity = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

const FT_TO_M = 0.3048;
const IN_TO_CM = 2.54;
const SQFT_TO_SQM = 0.09290304;
const CUFT_TO_CUM = 0.028316846592;
const US_GAL_TO_L = 3.785411784;
const SQFT_PER_SQM = 1 / SQFT_TO_SQM;
const CUFT_PER_CUM = 1 / CUFT_TO_CUM;
const SQFT_PER_GAL_TO_SQM_PER_L = SQFT_PER_SQM * US_GAL_TO_L;

const lengthKeys = [
  'length', 'width', 'height',
  'footingLength', 'footingWidth', 'footingDepth',
  'excavationDepth', 'columnWidth', 'columnDepth',
  'beamLength', 'beamWidth', 'beamDepth', 'slabThickness',
];

const areaKeys = ['openings', 'partitions', 'waterproof'];
const blockDimensionKeys = ['blockLength', 'blockHeight'];
function inputAsMetric(
  key: string,
  value: number,
  units: 'metric' | 'imperial'
) {
  if (units === 'metric') return value;

  if (lengthKeys.includes(key)) return value * FT_TO_M;
  if (areaKeys.includes(key)) return value * SQFT_TO_SQM;
  if (blockDimensionKeys.includes(key)) return value * IN_TO_CM;
  if (key === 'stairVolume') return value * CUFT_TO_CUM;
  if (key === 'paintCoverage') return value / SQFT_PER_GAL_TO_SQM_PER_L;

  return value;
}

function convertStoredValue(
  key: string,
  value: string,
  toUnits: 'metric' | 'imperial'
) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;

  if (toUnits === 'imperial') {
    if (lengthKeys.includes(key)) return String(n / FT_TO_M);
    if (areaKeys.includes(key)) return String(n / SQFT_TO_SQM);
    if (blockDimensionKeys.includes(key)) return String(n / IN_TO_CM);
    if (key === 'stairVolume') return String(n / CUFT_TO_CUM);
    if (key === 'paintCoverage') return String(n * SQFT_PER_GAL_TO_SQM_PER_L);
    return value;
  }

  if (lengthKeys.includes(key)) return String(n * FT_TO_M);
  if (areaKeys.includes(key)) return String(n * SQFT_TO_SQM);
  if (blockDimensionKeys.includes(key)) return String(n * IN_TO_CM);
  if (key === 'stairVolume') return String(n * CUFT_TO_CUM);
  if (key === 'paintCoverage') return String(n / SQFT_PER_GAL_TO_SQM_PER_L);
  return value;
}

function labelForUnits(label: string, units: 'metric' | 'imperial') {
  if (units === 'metric') return label;

  return label
    .replaceAll('m²/L', 'ft²/US gal')
    .replaceAll('m²/litre', 'ft²/US gallon')
    .replaceAll('m²/liter', 'ft²/US gallon')
    .replaceAll('m³', 'ft³')
    .replaceAll('m²', 'ft²')
    .replaceAll('(m)', '(ft)')
    .replaceAll('(cm)', '(in)')
    .replaceAll('cm)', 'in)')
    .replaceAll('litre', 'US gallon')
    .replaceAll('litres', 'US gallons')
    .replaceAll('liter', 'US gallon')
    .replaceAll('liters', 'US gallons')
    .replaceAll('م²/لتر', 'قدم²/غالون أمريكي')
    .replaceAll('م³', 'قدم³')
    .replaceAll('م²', 'قدم²')
    .replaceAll('(م)', '(قدم)')
    .replaceAll('سم)', 'إنش)')
    .replaceAll('لتر', 'غالون أمريكي');
}

function displayArea(value: number, units: 'metric' | 'imperial') {
  return units === 'imperial' ? value * SQFT_PER_SQM : value;
}

function displayVolume(value: number, units: 'metric' | 'imperial') {
  return units === 'imperial' ? value * CUFT_PER_CUM : value;
}

function displayPaint(value: number, units: 'metric' | 'imperial') {
  return units === 'imperial' ? value / US_GAL_TO_L : value;
}

export default function BuildingCalculatorScreen({
  language,
  theme,
  mode,
  units,
  onBack,
}: Props) {
  const ui = getThemedStyles(styles, theme);
  const t = translations[language];
  const isArabic = language === 'ar';
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('LB');
  const selectedCurrency = COUNTRY_OPTIONS.find(country => country.id === selectedCountry)?.currency ?? 'USD';

  const [floors, setFloors] = useState<FloorData[]>([
    initialFloor(1),
    initialFloor(2),
  ]);

  const [values, setValues] = useState(initialValues);
  const [detailedValuesByCountry, setDetailedValuesByCountry] = useState<Record<CountryCode, DetailedValues>>({
    LB: createDetailedCostValues(),
    AE: createCountryCostValues('AE'),
    SA: createCountryCostValues('SA'),
    QA: createCountryCostValues('QA'),
    KW: createCountryCostValues('KW'),
    OM: createCountryCostValues('OM'),
  });
  const detailedValues = detailedValuesByCountry[selectedCountry];
  const setDetailedValues = (updater: (old: DetailedValues) => DetailedValues) => {
    setDetailedValuesByCountry(old => ({
      ...old,
      [selectedCountry]: updater(old[selectedCountry]),
    }));
  };
  const manuallyEditedQuantities = useRef<Record<CountryCode, Set<string>>>({
    LB: new Set(),
    AE: new Set(),
    SA: new Set(),
    QA: new Set(),
    KW: new Set(),
    OM: new Set(),
  });
  const manuallyEditedRates = useRef<Record<CountryCode, Set<string>>>({
    LB: new Set(),
    AE: new Set(),
    SA: new Set(),
    QA: new Set(),
    KW: new Set(),
    OM: new Set(),
  });
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');
  const previousUnits = useRef<'metric' | 'imperial'>('metric');

  useEffect(() => {
    if (previousUnits.current === units) return;

    setFloors(old =>
      old.map(floor => ({
        ...floor,
        length: convertStoredValue('length', floor.length, units),
        width: convertStoredValue('width', floor.width, units),
        height: convertStoredValue('height', floor.height, units),
        openings: convertStoredValue('openings', floor.openings, units),
        partitions: convertStoredValue('partitions', floor.partitions, units),
      }))
    );

    setValues(old => {
      const converted = { ...old };
      Object.keys(converted).forEach(key => {
        converted[key] = convertStoredValue(key, converted[key], units);
      });
      return converted;
    });

    setDetailedValuesByCountry(old => {
      const converted = { ...old };

      (Object.keys(converted) as CountryCode[]).forEach(countryCode => {
        const next = { ...converted[countryCode] };
        COST_ITEMS.forEach(item => {
          const factor =
            item.unit === 'm²' ? SQFT_TO_SQM :
            item.unit === 'm³' ? CUFT_TO_CUM :
            item.unit === 'm' ? FT_TO_M : 1;

          if (factor === 1) return;

          ['Material', 'Labor'].forEach(suffix => {
            const key = `${item.id}${suffix}`;
            const amount = Number(next[key]);
            if (Number.isFinite(amount)) {
              next[key] = String(
                units === 'imperial' ? amount * factor : amount / factor
              );
            }
          });
        });
        converted[countryCode] = next;
      });

      return converted;
    });

    previousUnits.current = units;
    setResult(null);
    setError('');
  }, [units]);

  const updateValue = (key: string, value: string) => {
    setValues(old => ({ ...old, [key]: value }));
    setResult(null);
  };

  const updateDetailedValue = (key: string, value: string) => {
    if (key.endsWith('Qty')) {
      manuallyEditedQuantities.current[selectedCountry].add(key);
    }
    if (key.endsWith('Material') || key.endsWith('Labor')) {
      manuallyEditedRates.current[selectedCountry].add(key);
    }
    setDetailedValues(old => ({ ...old, [key]: value }));
    setResult(null);
  };

  const automaticQuantities = useMemo(
    () => estimateBuildingQuantities(floors, values, units),
    [floors, values, units]
  );

  useEffect(() => {
    setDetailedValues(old => {
      const next = { ...old };
      Object.entries(automaticQuantities).forEach(([key, estimate]) => {
        if (!manuallyEditedQuantities.current[selectedCountry].has(key)) {
          next[key] = estimate;
        }
      });
      return next;
    });
    setResult(null);
  }, [automaticQuantities, selectedCountry]);

  const updateFloor = (id: number, key: keyof FloorData, value: string) => {
    setFloors(old =>
      old.map(floor =>
        floor.id === id ? { ...floor, [key]: value } : floor
      )
    );
    setResult(null);
  };

  const addFloor = () => {
    const nextId = Math.max(0, ...floors.map(f => f.id)) + 1;
    setFloors(old => [...old, initialFloor(nextId)]);
    setResult(null);
  };

  const removeFloor = (id: number) => {
    if (floors.length <= 1) return;
    setFloors(old => old.filter(floor => floor.id !== id));
    setResult(null);
  };

  const calculations = useMemo(() => {
    const floorData = floors.map(floor => ({
      length: inputAsMetric('length', Number(floor.length), units),
      width: inputAsMetric('width', Number(floor.width), units),
      height: inputAsMetric('height', Number(floor.height), units),
      openings: inputAsMetric('openings', Number(floor.openings), units),
      partitions: inputAsMetric('partitions', Number(floor.partitions), units),
    }));

    const allFloorValues = floorData.every(f =>
      [f.length, f.width, f.height, f.openings, f.partitions].every(
        value => Number.isFinite(value) && value >= 0
      ) && f.length > 0 && f.width > 0 && f.height > 0
    );

    const allInputs = Object.values(values).every(value => {
      const n = Number(value);
      return value.trim() !== '' && Number.isFinite(n) && n >= 0;
    });

    const allDetailedInputs = Object.values(detailedValues).every(value => {
      const n = Number(value);
      return value.trim() !== '' && Number.isFinite(n) && n >= 0;
    });

    if (
      !allFloorValues ||
      !allInputs ||
      !allDetailedInputs ||
      floors.length === 0
    ) {
      return null;
    }

    const v = (key: string) =>
      inputAsMetric(key, number(values, key), units);

    const floorArea = floorData.reduce(
      (sum, floor) => sum + floor.length * floor.width,
      0
    );

    const totalHeight = floorData.reduce(
      (sum, floor) => sum + floor.height,
      0
    );

    const grossExternalWallArea = floorData.reduce(
      (sum, floor) =>
        sum + 2 * (floor.length + floor.width) * floor.height,
      0
    );

    const openings = floorData.reduce(
      (sum, floor) => sum + floor.openings,
      0
    );

    const partitions = floorData.reduce(
      (sum, floor) => sum + floor.partitions,
      0
    );

    const netExternalWallArea = Math.max(
      0,
      grossExternalWallArea - openings
    );

    const netWallArea = netExternalWallArea + partitions;

    const footingConcrete =
      v('footingCount') *
      v('footingLength') *
      v('footingWidth') *
      v('footingDepth');

    const columnConcrete =
      v('columnCount') *
      v('columnWidth') *
      v('columnDepth') *
      totalHeight;

    const beamConcrete =
      v('beamLength') *
      v('beamWidth') *
      v('beamDepth');

    const slabConcrete = floorArea * v('slabThickness');
    const stairConcrete = v('stairVolume');

    const concrete =
      footingConcrete +
      columnConcrete +
      beamConcrete +
      slabConcrete +
      stairConcrete;

    const excavation =
      v('footingCount') *
      v('footingLength') *
      v('footingWidth') *
      v('excavationDepth');

    const blockFaceArea =
      (v('blockLength') / 100) * (v('blockHeight') / 100);

    const blocks =
      blockFaceArea > 0
        ? Math.ceil((netWallArea / blockFaceArea) * 1.05)
        : 0;

    const plasterArea = netWallArea * 2;

    const tileArea =
      floorArea * (1 + v('tileWaste') / 100);

    const interiorPaintArea =
      netExternalWallArea + partitions * 2 + floorArea;
    const paintArea = interiorPaintArea + netExternalWallArea;

    const paintLitres =
      v('paintCoverage') > 0
        ? (paintArea * v('paintCoats')) / v('paintCoverage')
        : 0;

    const waterproofArea = v('waterproof');

    let detailedMaterialTotal = 0;
    let detailedLaborTotal = 0;
    let unpricedItemCount = 0;
    const categoryTotals: Record<string, number> = {};

    COST_ITEMS.forEach(item => {
      const qty = Number(detailedValues[`${item.id}Qty`] || 0);
      const material = Number(detailedValues[`${item.id}Material`] || 0);
      const labor = Number(detailedValues[`${item.id}Labor`] || 0);

      const materialCost = qty * material;
      const laborCost = qty * labor;
      const itemTotal = materialCost + laborCost;

      // Check only the rate types required by each active line item.
      const materialMissing = item.requiresMaterial !== false && material <= 0;
      const laborMissing = item.requiresLabor !== false && labor <= 0;
      if (qty > 0 && (materialMissing || laborMissing)) {
        unpricedItemCount += 1;
      }

      detailedMaterialTotal += materialCost;
      detailedLaborTotal += laborCost;
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + itemTotal;
    });

    const detailedTotal = detailedMaterialTotal + detailedLaborTotal;
    const sumItemQuantities = (ids: string[]) =>
      ids.reduce(
        (sum, id) => sum + Number(detailedValues[`${id}Qty`] || 0),
        0
      );
    const electricalPoints = sumItemQuantities([
      'lightingPoints', 'singleSockets', 'doubleSockets', 'acPoints',
      'waterHeaterPoints', 'tvPoints', 'internetPoints', 'switchPoints',
    ]);
    const plumbingPoints = sumItemQuantities([
      'coldWaterPoints', 'hotWaterPoints', 'toiletConnections',
      'showerConnections', 'basinConnections', 'kitchenConnections',
    ]);

    // The detailed bill of quantities is the sole source for trade materials
    // and labor. Project-wide equipment and other costs remain separate.
    const materialTotal = detailedMaterialTotal;
    const labor = detailedLaborTotal;
    const equipment = v('equipment');
    const extra = v('extra');

    // Keep category subtotals reconcilable with the project subtotal.
    categoryTotals.other =
      (categoryTotals.other || 0) + equipment + extra;

    const subtotal = materialTotal + labor + equipment + extra;
    const reserve = subtotal * (v('contingency') / 100);
    const total = subtotal + reserve;

    return {
      floorArea,
      excavation,
      concrete,
      blocks,
      netWallArea,
      plasterArea,
      tileArea,
      paintLitres,
      waterproofArea,
      detailedMaterialTotal,
      detailedLaborTotal,
      detailedTotal,
      electricalPoints,
      plumbingPoints,
      categoryTotals,
      unpricedItemCount,
      materialTotal,
      labor,
      equipment,
      extra,
      subtotal,
      reserve,
      total,
    };
  }, [floors, values, detailedValues, units]);

  const calculate = () => {
    if (!calculations) {
      setError(t.invalid);
      setResult(null);
      return;
    }

    setError('');
    setResult(calculations);
  };

  const field = (
    key: string,
    label: string,
    value: string,
    onChange: (value: string) => void
  ) => (
    <View key={key} style={ui.field}>
      <Text style={[ui.label, isArabic && ui.rtl]}>
        {labelForUnits(label, units)}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#888"
        style={[ui.input, isArabic && ui.rtl]}
      />
    </View>
  );

  const section = (heading: string, children: React.ReactNode) => (
    <View style={ui.sectionCard}>
      <Text style={[ui.sectionTitle, isArabic && ui.rtl]}>
        {heading}
      </Text>
      {children}
    </View>
  );

  const resultRow = (
    label: string,
    value: string,
    bold = false
  ) => (
    <View style={ui.resultRow} key={label}>
      <Text style={[ui.resultLabel, bold && ui.boldResult]}>
        {label}
      </Text>
      <Text style={[ui.resultValue, bold && ui.boldResult]}>
        {value}
      </Text>
    </View>
  );

  const unitForItem = (unit: string) => {
    if (units === 'imperial') {
      if (unit === 'm²') return 'ft²';
      if (unit === 'm³') return 'ft³';
      if (unit === 'm') return 'ft';
    }
    return unit;
  };

  const rateProvenanceNote = (itemId: string, rateType: 'Material' | 'Labor', value: string) => {
    if (selectedCountry === 'LB') return undefined;
    const costItem = COST_ITEMS.find(item => item.id === itemId);
    const rateNotRequired = rateType === 'Labor'
      ? costItem?.requiresLabor === false
      : costItem?.requiresMaterial === false;
    if (rateNotRequired) {
      return language === 'ar'
        ? 'غير مطلوب لهذا البند'
        : language === 'fr'
        ? 'Non requis pour ce poste'
        : 'Not required for this item';
    }
    if (Number(value) <= 0) {
      return language === 'ar'
        ? 'لا يوجد سعر محلي معبأ — أدخل عرض سعر'
        : language === 'fr'
        ? 'Aucun tarif local prérempli — saisir un devis'
        : 'No local rate mapped — enter a quotation';
    }
    const rateKey = `${itemId}${rateType}`;
    if (manuallyEditedRates.current[selectedCountry].has(rateKey)) {
      return language === 'ar'
        ? 'سعر أدخله المستخدم — يُراجع مع عرض السعر'
        : language === 'fr'
        ? 'Tarif saisi manuellement — à vérifier avec le devis'
        : 'User-entered rate — verify against quotation';
    }
    if (rateType === 'Labor') return MARKET_RATE_LABELS.provisional[language];
    if (REGIONAL_REFERENCE_MATERIAL_RATE_IDS[selectedCountry as 'KW' | 'OM']?.includes(itemId)) {
      return MARKET_RATE_LABELS['regional-reference'][language];
    }
    const published = PUBLISHED_MATERIAL_RATE_IDS[selectedCountry]?.includes(itemId);
    return published
      ? MARKET_RATE_LABELS.published[language]
      : MARKET_RATE_LABELS['market-survey'][language];
  };

  const detailedField = (
    key: string,
    label: string,
    value: string,
    provenanceNote?: string
  ) => (
    <View style={ui.detailedInputColumn} key={key}>
      <Text style={ui.detailedInputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={text => updateDetailedValue(key, text)}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#888"
        style={ui.detailedInput}
        selectTextOnFocus
      />
      {!!provenanceNote && (
        <Text style={ui.rateProvenanceNote}>{provenanceNote}</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={ui.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onBack}>
        <Text style={ui.back}>
          {isArabic ? '‹ العودة' : language === 'fr' ? '‹ Retour' : '‹ Back'}
        </Text>
      </Pressable>

      <Text style={[ui.title, isArabic && ui.rtl]}>
        {t.title}
      </Text>
      <Text style={[ui.subtitle, isArabic && ui.rtl]}>
        {t.subtitle}
      </Text>

      <View style={ui.infoBox}>
        <Text style={ui.infoText}>
          {mode === 'professional' ? t.professional : t.homeowner}
        </Text>
      </View>

      <View style={ui.sectionCard}>
        <Text style={[ui.sectionTitle, isArabic && ui.rtl]}>
          {t.country}
        </Text>
        <View style={ui.countryOptions}>
          {COUNTRY_OPTIONS.map(country => (
            <Pressable
              key={country.id}
              onPress={() => {
                setSelectedCountry(country.id);
                setResult(null);
                setError('');
              }}
              style={[
                ui.countryOption,
                selectedCountry === country.id && ui.countryOptionSelected,
              ]}
            >
              <Text
                style={[
                  ui.countryOptionText,
                  selectedCountry === country.id && ui.countryOptionTextSelected,
                ]}
              >
                {country.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0]}
              </Text>
              <Text
                style={[
                  ui.countryCurrency,
                  selectedCountry === country.id && ui.countryOptionTextSelected,
                ]}
              >
                {country.currency}
              </Text>
            </Pressable>
          ))}
        </View>
        <>
          {selectedCountry !== 'LB' && (
            <View style={ui.warningBox}>
              <Text style={ui.warningText}>{t.ratesPending}</Text>
            </View>
          )}
          <View style={ui.marketBenchmarks}>
            <Text style={ui.marketBenchmarksTitle}>
              {language === 'ar' ? 'مؤشرات أسعار السوق' : language === 'fr' ? 'Repères de prix du marché' : 'Market price benchmarks'}
            </Text>
            {CONSTRUCTION_MARKET_BENCHMARKS[selectedCountry].benchmarks.length === 0 ? (
              <Text style={ui.marketBenchmarkNote}>
                {language === 'ar'
                  ? 'تُعرض أسعار لبنان الافتراضية بالدولار ضمن جدول التكاليف التفصيلي كتقديرات تخطيطية محلية. لم تُضف بعد قائمة منفصلة من مؤشرات السوق المنشورة الموثقة؛ لذلك لا نعرض أسعاراً غير متحقق منها.'
                  : language === 'fr'
                  ? 'Les tarifs libanais par défaut en USD figurent dans le bordereau détaillé comme estimations locales de planification. Aucune série distincte de références de marché publiées et vérifiées n’a encore été ajoutée ; aucun prix non vérifié n’est donc affiché.'
                  : 'Lebanon default USD rates remain in the detailed cost table as local planning allowances. A separate verified published-market benchmark series has not yet been added, so no unverified prices are displayed.'}
              </Text>
            ) : CONSTRUCTION_MARKET_BENCHMARKS[selectedCountry].benchmarks.map((benchmark, index) => (
              <View key={`${benchmark.item}-${index}`} style={ui.marketBenchmarkRow}>
                <View style={ui.marketBenchmarkText}>
                  <Text style={ui.marketBenchmarkItem}>{marketBenchmarkLabel(benchmark.item, language)}</Text>
                  {!!benchmark.note && (
                    <Text style={ui.marketBenchmarkNote}>{marketBenchmarkLabel(benchmark.note, language)}</Text>
                  )}
                  <Pressable onPress={() => Linking.openURL(benchmark.source)}>
                    <Text style={ui.marketBenchmarkSource}>
                      {language === 'ar' ? 'المصدر: ' : language === 'fr' ? 'Source : ' : 'Source: '}{marketBenchmarkSourceLabel(benchmark.source, language)}
                    </Text>
                  </Pressable>
                </View>
                <View style={ui.marketBenchmarkValueWrap}>
                  <Text style={ui.marketBenchmarkValue}>
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: CONSTRUCTION_MARKET_BENCHMARKS[selectedCountry].currency }).format(benchmark.value)}
                  </Text>
                  <Text style={ui.marketBenchmarkUnit}>{marketBenchmarkLabel(benchmark.unit, language)}</Text>
                  <Text style={ui.marketBenchmarkStatus}>
                    {benchmark.status === 'published'
                      ? (language === 'ar' ? 'منشور' : language === 'fr' ? 'Publié' : 'Published')
                      : (language === 'ar' ? 'مسح سوق' : language === 'fr' ? 'Enquête marché' : 'Market survey')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      </View>

      {section(
        t.floors,
        <>
          {floors.map((floor, index) => (
            <View key={floor.id} style={ui.floorCard}>
              <View style={ui.floorHeader}>
                <Text style={ui.floorTitle}>
                  {language === 'ar'
                    ? `الطابق ${index + 1}`
                    : language === 'fr'
                    ? `Étage ${index + 1}`
                    : `Floor ${index + 1}`}
                </Text>
                {floors.length > 1 && (
                  <Pressable onPress={() => removeFloor(floor.id)}>
                    <Text style={ui.removeText}>{t.remove}</Text>
                  </Pressable>
                )}
              </View>

              {(
                [
                  ['length', t.length],
                  ['width', t.width],
                  ['height', t.height],
                  ['openings', t.openings],
                  ['partitions', t.partitions],
                ] as [keyof FloorData, string][]
              ).map(([key, label]) =>
                field(
                  `${floor.id}-${key}`,
                  label,
                  String(floor[key]),
                  value => updateFloor(floor.id, key, value)
                )
              )}
            </View>
          ))}
          <Pressable style={ui.secondaryButton} onPress={addFloor}>
            <Text style={ui.secondaryButtonText}>{t.addFloor}</Text>
          </Pressable>
        </>
      )}

      {section(
        t.structure,
        <>
          {(
            [
              ['footingCount', t.footingCount],
              ['footingLength', t.footingLength],
              ['footingWidth', t.footingWidth],
              ['footingDepth', t.footingDepth],
              ['excavationDepth', t.excavationDepth],
              ['columnCount', t.columnCount],
              ['columnWidth', t.columnWidth],
              ['columnDepth', t.columnDepth],
              ['beamLength', t.beamLength],
              ['beamWidth', t.beamWidth],
              ['beamDepth', t.beamDepth],
              ['slabThickness', t.slabThickness],
              ['stairVolume', t.stairVolume],
            ] as [string, string][]
          ).map(([key, label]) =>
            field(key, label, values[key], value => updateValue(key, value))
          )}
        </>
      )}

      {section(
        t.wall,
        <>
          {(
            [
              ['blockLength', t.blockLength],
              ['blockHeight', t.blockHeight],
              ['paintCoats', t.paintCoats],
              ['paintCoverage', t.paintCoverage],
              ['tileWaste', t.tileWaste],
              ['waterproof', t.waterproof],
            ] as [string, string][]
          ).map(([key, label]) =>
            field(key, label, values[key], value => updateValue(key, value))
          )}
        </>
      )}


      {selectedCountry === 'LB' && section(
        t.prices,
        <>
          {(
            [
              ['equipment', t.equipment],
              ['extra', t.extra],
              ['contingency', t.contingency],
            ] as [string, string][]
          ).map(([key, label]) =>
            field(key, label, values[key], value => updateValue(key, value))
          )}
        </>
      )}

      {/* COMPLETE ITEMIZED COST CATALOG */}
      {section(
        t.detailedCosts,
        <>
          <Text style={ui.detailedHint}>{selectedCountry === 'LB' ? t.detailedHint : (language === 'ar' ? 'أدخل أسعار المواد والعمالة المحلية لكل بند. لا تُستخدم أسعار لبنان في هذا السوق.' : language === 'fr' ? 'Saisissez les prix locaux des matériaux et de la main-d’œuvre. Les prix libanais ne sont pas réutilisés pour ce marché.' : 'Enter local material and labor rates for each item. Lebanon prices are not reused for this market.')}</Text>

          {COST_CATEGORIES.map(category => {
            const items = COST_ITEMS.filter(
              item => item.category === category.id
            );
            const categoryTotal =
              calculations?.categoryTotals?.[category.id] || 0;

            return (
              <View key={category.id} style={ui.detailedCategory}>
                <View style={ui.detailedCategoryHeader}>
                  <Text style={ui.detailedCategoryTitle}>
                    {category.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0]}
                  </Text>
                  <Text style={ui.detailedCategoryTotal}>
                    {money(categoryTotal, selectedCurrency)}
                  </Text>
                </View>

                {items.map(item => {
                  const qty = Number(detailedValues[`${item.id}Qty`] || 0);
                  const material = Number(detailedValues[`${item.id}Material`] || 0);
                  const labor = Number(detailedValues[`${item.id}Labor`] || 0);
                  const itemTotal = qty * (material + labor);

                  return (
                    <View key={item.id} style={ui.detailedItem}>
                      <View style={ui.detailedItemHeading}>
                        <Text style={ui.detailedItemName}>
                          {item.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0]}
                        </Text>
                        <Text style={ui.detailedUnit}>
                          {unitForItem(item.unit)}
                        </Text>
                      </View>

                      <View style={ui.detailedInputsRow}>
                        {detailedField(
                          `${item.id}Qty`,
                          t.quantity,
                          detailedValues[`${item.id}Qty`]
                        )}
                        {detailedField(
                          `${item.id}Material`,
                          t.materialUnit.replace(String.fromCharCode(36), selectedCurrency),
                          detailedValues[`${item.id}Material`],
                          rateProvenanceNote(item.id, 'Material', detailedValues[`${item.id}Material`])
                        )}
                        {detailedField(
                          `${item.id}Labor`,
                          t.laborUnit.replace(String.fromCharCode(36), selectedCurrency),
                          detailedValues[`${item.id}Labor`],
                          rateProvenanceNote(item.id, 'Labor', detailedValues[`${item.id}Labor`])
                        )}
                      </View>

                      <View style={ui.detailedItemTotalRow}>
                        <Text style={ui.detailedItemTotalLabel}>
                          {t.itemTotal}
                        </Text>
                        <Text style={ui.detailedItemTotalValue}>
                          {money(itemTotal, selectedCurrency)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                <View style={ui.detailedCategoryFooter}>
                  <Text style={ui.detailedCategoryFooterLabel}>
                    {t.categoryTotal}
                  </Text>
                  <Text style={ui.detailedCategoryFooterValue}>
                    {money(categoryTotal, selectedCurrency)}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      <Pressable style={ui.calculateButton} onPress={calculate}>
        <Text style={ui.calculateButtonText}>{t.calculate}</Text>
      </Pressable>

      {!!error && <Text style={ui.error}>{error}</Text>}

      {result && (
        <View style={ui.resultsCard}>
          <Text style={ui.resultHeading}>{t.results}</Text>
          {resultRow(
            labelForUnits(t.floorArea, units),
            `${quantity(displayArea(result.floorArea, units))} ${units === 'imperial' ? 'ft²' : 'm²'}`
          )}
          {resultRow(
            labelForUnits(t.excavation, units),
            `${quantity(displayVolume(result.excavation, units))} ${units === 'imperial' ? 'ft³' : 'm³'}`
          )}
          {resultRow(
            labelForUnits(t.concrete, units),
            `${quantity(displayVolume(result.concrete, units))} ${units === 'imperial' ? 'ft³' : 'm³'}`
          )}
          {resultRow(t.blocks, `${quantity(result.blocks)} blocks`)}
          {resultRow(
            labelForUnits(t.wallArea, units),
            `${quantity(displayArea(result.netWallArea, units))} ${units === 'imperial' ? 'ft²' : 'm²'}`
          )}
          {resultRow(
            labelForUnits(t.plasterArea, units),
            `${quantity(displayArea(result.plasterArea, units))} ${units === 'imperial' ? 'ft²' : 'm²'}`
          )}
          {resultRow(
            labelForUnits(t.tileArea, units),
            `${quantity(displayArea(result.tileArea, units))} ${units === 'imperial' ? 'ft²' : 'm²'}`
          )}
          {resultRow(
            labelForUnits(t.paintLitres, units),
            `${quantity(displayPaint(result.paintLitres, units))} ${units === 'imperial' ? 'US gal' : 'L'}`
          )}
          {resultRow(
            labelForUnits(t.waterproofArea, units),
            `${quantity(displayArea(result.waterproofArea, units))} ${units === 'imperial' ? 'ft²' : 'm²'}`
          )}

          <View style={ui.resultDivider} />
          {resultRow(t.electricalPoints, quantity(result.electricalPoints))}
          {resultRow(t.plumbingPoints, quantity(result.plumbingPoints))}
          {resultRow(t.materialTotal, money(result.materialTotal, selectedCurrency))}
          {resultRow(t.laborResult, money(result.labor, selectedCurrency))}
          {resultRow(t.equipmentResult, money(result.equipment, selectedCurrency))}
          {resultRow(t.extraResult, money(result.extra, selectedCurrency))}

          {COST_CATEGORIES.map(category =>
            resultRow(
              category.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0],
              money(result.categoryTotals[category.id] || 0, selectedCurrency)
            )
          )}

          {resultRow(result.unpricedItemCount > 0 ? t.pricedSubtotal : t.subtotal, money(result.subtotal, selectedCurrency))}
          {resultRow(result.unpricedItemCount > 0 ? t.pricedReserve : t.reserve, money(result.reserve, selectedCurrency))}
          {result.unpricedItemCount > 0 && (
            <View style={ui.warningBox}>
              <Text style={ui.warningTitle}>
                {language === 'ar'
                  ? 'تنبيه: أسعار غير مكتملة'
                  : language === 'fr'
                  ? 'Attention : tarifs incomplets'
                  : 'Warning: incomplete rates'}
              </Text>
              <Text style={ui.warningText}>
                {language === 'ar'
                  ? `يوجد ${result.unpricedItemCount} بنداً مستخدماً ينقصه سعر مواد أو أجرة عمل. الإجمالي الحالي جزئي ولا يشمل هذه التكاليف الناقصة.`
                  : language === 'fr'
                  ? `${result.unpricedItemCount} postes utilisés n’ont pas de prix de matériaux ou de main-d’œuvre. Le total est partiel et exclut ces coûts manquants.`
                  : `${result.unpricedItemCount} active line items are missing a material rate or labor rate. The displayed total is partial and excludes those missing costs.`}
              </Text>
            </View>
          )}
          <View style={ui.totalBox}>
            <Text style={ui.totalLabel}>
              {result.unpricedItemCount > 0 ? t.incompleteTotal : t.total}
            </Text>
            <Text style={ui.totalValue}>
              {money(result.total, selectedCurrency)}
            </Text>
          </View>
        </View>
      )}

      <View style={ui.warningBox}>
        <Text style={ui.warningTitle}>{t.note}</Text>
        <Text style={ui.warningText}>{t.warning}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
  },
  back: {
    color: GOLD,
    fontSize: 15,
    marginBottom: 18,
  },
  title: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '900',
  },
  subtitle: {
    color: '#b7bbc0',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  rtl: {
    textAlign: 'right',
  },
  infoBox: {
    backgroundColor: '#201c14',
    borderColor: '#6b5736',
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 16,
  },
  infoText: {
    color: '#e7d2a7',
    fontSize: 12,
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: '#171c22',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#51432f',
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  marketBenchmarks: {
    backgroundColor: '#20262d',
    borderWidth: 1,
    borderColor: '#51432f',
    borderRadius: 11,
    padding: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  marketBenchmarksTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
  },
  marketBenchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#3b4145',
  },
  marketBenchmarkText: {
    flex: 1,
  },
  marketBenchmarkItem: {
    color: '#f1f1f1',
    fontSize: 11,
    fontWeight: '700',
  },
  marketBenchmarkNote: {
    color: '#aeb4bb',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  marketBenchmarkSource: {
    color: GOLD,
    fontSize: 9,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  marketBenchmarkValueWrap: {
    alignItems: 'flex-end',
    maxWidth: 125,
  },
  marketBenchmarkValue: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
  },
  marketBenchmarkUnit: {
    color: '#c5c9ce',
    fontSize: 9,
    marginTop: 2,
  },
  marketBenchmarkStatus: {
    color: '#9ca3af',
    fontSize: 8,
    marginTop: 3,
  },
  countryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countryOption: {
    width: '31%',
    minWidth: 0,
    minHeight: 76,
    flexGrow: 0,
    borderWidth: 1,
    borderColor: '#45484d',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20262d',
  },
  countryOptionSelected: {
    borderColor: GOLD,
    backgroundColor: '#302719',
  },
  countryOptionText: {
    color: '#ddd',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  countryOptionTextSelected: {
    color: GOLD,
  },
  countryCurrency: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
  floorCard: {
    backgroundColor: '#20262d',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  floorTitle: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 14,
  },
  removeText: {
    color: '#ff8585',
    fontSize: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: '#eee',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#292f36',
    color: '#fff',
    borderRadius: 9,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#45484d',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: GOLD,
    fontWeight: '800',
  },
  calculateButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  calculateButtonText: {
    color: '#17110a',
    fontSize: 13,
    fontWeight: '900',
  },
  error: {
    color: '#ff8585',
    textAlign: 'center',
    marginBottom: 14,
  },
  resultsCard: {
    backgroundColor: '#20272b',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#6c5938',
    marginBottom: 16,
  },
  resultHeading: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#3b4145',
  },
  resultLabel: {
    color: '#ddd',
    flex: 1,
    fontSize: 12,
  },
  resultValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  boldResult: {
    color: GOLD,
    fontWeight: '900',
  },
  resultDivider: {
    height: 1,
    backgroundColor: GOLD,
    marginVertical: 12,
  },
  totalBox: {
    backgroundColor: '#171b20',
    padding: 14,
    borderRadius: 11,
    marginTop: 14,
  },
  totalLabel: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
  },
  totalValue: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: '#2a2117',
    borderWidth: 1,
    borderColor: '#80623b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  warningTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
  },
  warningText: {
    color: '#e2d7c5',
    fontSize: 11,
    lineHeight: 18,
  },
  detailedHint: {
    color: '#b7bbc0',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 13,
  },
  detailedCategory: {
    backgroundColor: '#20262d',
    borderWidth: 1,
    borderColor: '#51432f',
    borderRadius: 11,
    padding: 10,
    marginBottom: 13,
  },
  detailedCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#51432f',
    paddingBottom: 10,
    marginBottom: 10,
    gap: 8,
  },
  detailedCategoryTitle: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  detailedCategoryTotal: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  detailedItem: {
    backgroundColor: '#171c22',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#343a40',
    padding: 9,
    marginBottom: 9,
  },
  detailedItemHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
    gap: 8,
  },
  detailedItemName: {
    color: '#f1f1f1',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  detailedUnit: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
  },
  detailedInputsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  detailedInputColumn: {
    flex: 1,
    minWidth: 0,
  },
  detailedInputLabel: {
    color: '#c4c4c4',
    fontSize: 9,
    marginBottom: 5,
    minHeight: 23,
  },
  rateProvenanceNote: {
    color: '#b7a27f',
    fontSize: 8,
    lineHeight: 11,
    marginTop: 4,
    minHeight: 22,
  },
  detailedInput: {
    backgroundColor: '#292f36',
    color: '#fff',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 9,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#45484d',
    minWidth: 0,
  },
  detailedItemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#343a40',
    marginTop: 9,
    paddingTop: 8,
  },
  detailedItemTotalLabel: {
    color: '#aaa',
    fontSize: 10,
  },
  detailedItemTotalValue: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
  },
  detailedCategoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#6b5736',
    paddingTop: 9,
    marginTop: 2,
  },
  detailedCategoryFooterLabel: {
    color: '#ddd0b5',
    fontSize: 11,
    fontWeight: '700',
  },
  detailedCategoryFooterValue: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
  },
});
