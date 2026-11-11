import React, { useEffect, useMemo, useRef, useState } from 'react';
import { estimateBuildingQuantities } from './buildingQuantityEstimator';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

type Language = 'en' | 'ar' | 'fr';

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
};

type CostItem = {
  id: string;
  category: string;
  names: [string, string, string];
  unit: string;
};

type DetailedValues = Record<string, string>;

const GOLD = '#E9B85D';

const translations = {
  en: {
    title: 'Full Building Calculator',
    subtitle: 'Complete building quantity and cost estimation',
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
    plasterArea: 'Plaster area',
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
    reserve: 'Contingency',
    total: 'TOTAL ESTIMATED COST',
    note: 'IMPORTANT ENGINEERING NOTE',
    warning: 'This is a preliminary quantity and cost estimate, not a structural design. Footing, column, beam, slab and reinforcement specifications must be supplied or approved by a qualified structural engineer. Electrical and plumbing quantities are allowances based on the entered point counts.',
    invalid: 'Please enter valid positive dimensions and quantities.',
    professional: 'Professional mode: enter engineering specifications and actual unit prices.',
    homeowner: 'Homeowner mode: enter building dimensions and use contractor-supplied specifications and prices.',
    noFloors: 'At least one floor is required.',
    detailedCosts: 'DETAILED ITEMIZED COSTS',
    detailedHint: 'Enter the quantity, material price per unit and labor price per unit for each item. Leave unused items at zero.',
    quantity: 'Quantity',
    materialUnit: 'Material / unit ($)',
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
    plasterArea: 'مساحة القصارة',
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
    reserve: 'الاحتياطي',
    total: 'التكلفة الإجمالية التقديرية',
    note: 'ملاحظة هندسية مهمة',
    warning: 'هذا تقدير أولي للكميات والتكاليف وليس تصميماً إنشائياً. يجب أن يحدد أو يعتمد مهندس إنشائي مؤهل أبعاد القواعد والأعمدة والجسور والبلاطات وحديد التسليح. كميات الكهرباء والسباكة تقديرية وفق عدد النقاط المدخل.',
    invalid: 'يرجى إدخال أبعاد وكميات صحيحة وموجبة.',
    professional: 'الوضع المهني: أدخل المواصفات الهندسية وأسعار الوحدات الفعلية.',
    homeowner: 'وضع صاحب المنزل: أدخل أبعاد المبنى واستخدم المواصفات والأسعار المقدمة من المقاول.',
    noFloors: 'يجب إضافة طابق واحد على الأقل.',
    detailedCosts: 'تفصيل تكاليف جميع البنود',
    detailedHint: 'أدخل الكمية وسعر المواد للوحدة وأجرة العمل للوحدة لكل بند. اترك البنود غير المستخدمة صفراً.',
    quantity: 'الكمية',
    materialUnit: 'المواد / الوحدة ($)',
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
    plasterArea: 'Surface à enduire',
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
    reserve: 'Imprévus',
    total: 'COÛT TOTAL ESTIMÉ',
    note: 'NOTE TECHNIQUE IMPORTANTE',
    warning: 'Cette estimation préliminaire ne constitue pas une conception structurelle. Les dimensions des semelles, poteaux, poutres, dalles et armatures doivent être fournies ou validées par un ingénieur qualifié. Les quantités électriques et de plomberie sont indicatives.',
    invalid: 'Veuillez saisir des dimensions et quantités positives valides.',
    professional: 'Mode professionnel : saisissez les spécifications techniques et les prix réels.',
    homeowner: 'Mode propriétaire : saisissez les dimensions et utilisez les spécifications et prix du constructeur.',
    noFloors: 'Au moins un étage est requis.',
    detailedCosts: 'COÛTS DÉTAILLÉS PAR POSTE',
    detailedHint: 'Saisissez la quantité, le prix des matériaux par unité et le coût de main-d’œuvre par unité. Laissez les postes inutilisés à zéro.',
    quantity: 'Quantité',
    materialUnit: 'Matériaux / unité ($)',
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
  { id: 'excavation', category: 'earthworks', names: ['Excavation', 'حفر التربة', 'Excavation'], unit: 'm³' },
  { id: 'soilRemoval', category: 'earthworks', names: ['Soil removal and disposal', 'نقل وترحيل الأتربة', 'Évacuation des terres'], unit: 'm³' },
  { id: 'backfilling', category: 'earthworks', names: ['Backfilling', 'ردم التربة', 'Remblayage'], unit: 'm³' },
  { id: 'soilCompaction', category: 'earthworks', names: ['Soil compaction', 'دك التربة', 'Compactage du sol'], unit: 'm²' },
  { id: 'sitePreparation', category: 'earthworks', names: ['Site preparation', 'تجهيز الموقع', 'Préparation du chantier'], unit: 'm²' },

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
  { id: 'scaffolding', category: 'structure', names: ['Scaffolding and supports', 'السقالات والدعائم', 'Échafaudages et étais'], unit: 'm²' },

  // 4. MASONRY
  { id: 'externalBlocks', category: 'masonry', names: ['External wall blocks', 'بلوك الجدران الخارجية', 'Blocs des murs extérieurs'], unit: 'm²' },
  { id: 'internalBlocks', category: 'masonry', names: ['Internal wall blocks', 'بلوك القواطع الداخلية', 'Blocs des cloisons intérieures'], unit: 'm²' },
  { id: 'cementMasonry', category: 'masonry', names: ['Cement for masonry', 'إسمنت البناء', 'Ciment de maçonnerie'], unit: 'bag' },
  { id: 'sandMasonry', category: 'masonry', names: ['Sand for masonry', 'رمل البناء', 'Sable de maçonnerie'], unit: 'm³' },
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
  { id: 'plasterMaterials', category: 'plaster', names: ['Plaster cement and sand', 'إسمنت ورمل القصارة', 'Ciment et sable pour enduit'], unit: 'm³' },

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
  { id: 'elevatorInstallation', category: 'elevator', names: ['Elevator installation and testing', 'تركيب وفحص المصعد', 'Installation et essais'], unit: 'job' },

  // 11. TILING
  { id: 'floorTiles', category: 'tiling', names: ['Floor tiles', 'بلاط الأرضيات', 'Carrelage de sol'], unit: 'm²' },
  { id: 'wallTiles', category: 'tiling', names: ['Wall tiles', 'بلاط الجدران', 'Carrelage mural'], unit: 'm²' },
  { id: 'tileAdhesive', category: 'tiling', names: ['Tile adhesive', 'لاصق البلاط', 'Colle à carrelage'], unit: 'bag' },
  { id: 'tileGrout', category: 'tiling', names: ['Tile grout', 'روبة البلاط', 'Joint de carrelage'], unit: 'bag' },
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
  { id: 'transport', category: 'other', names: ['Material transportation', 'نقل المواد', 'Transport des matériaux'], unit: 'job' },
  { id: 'wasteDisposal', category: 'other', names: ['Construction waste disposal', 'ترحيل مخلفات البناء', 'Évacuation des déchets'], unit: 'job' },
  { id: 'permits', category: 'other', names: ['Permits and inspections', 'رخص وفحوصات', 'Permis et inspections'], unit: 'job' },
  { id: 'siteManagement', category: 'other', names: ['Site management', 'إدارة الموقع', 'Gestion du chantier'], unit: 'job' },
  { id: 'miscellaneous', category: 'other', names: ['Miscellaneous expenses', 'مصاريف متنوعة', 'Dépenses diverses'], unit: 'job' },
];

const DEFAULT_MATERIAL_RATES: Record<string, string> = {
  cementMasonry: '8.50',
  tileAdhesive: '13.00',
  floorTiles: '8.00',
};

function createDetailedCostValues(): DetailedValues {
  const values: DetailedValues = {};
  COST_ITEMS.forEach(item => {
    values[`${item.id}Qty`] = '0';
    values[`${item.id}Material`] = DEFAULT_MATERIAL_RATES[item.id] ?? '0';
    values[`${item.id}Labor`] = '0';
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
  plaster: '2',
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

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
  mode,
  units,
  onBack,
}: Props) {
  const t = translations[language];
  const isArabic = language === 'ar';

  const [floors, setFloors] = useState<FloorData[]>([
    initialFloor(1),
    initialFloor(2),
  ]);

  const [values, setValues] = useState(initialValues);
  const [detailedValues, setDetailedValues] = useState<DetailedValues>(
    createDetailedCostValues
  );
  const manuallyEditedQuantities = useRef<Set<string>>(new Set());
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

    setDetailedValues(old => {
      const next = { ...old };

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

      return next;
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
      manuallyEditedQuantities.current.add(key);
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
        if (!manuallyEditedQuantities.current.has(key)) {
          next[key] = estimate;
        }
      });
      return next;
    });
    setResult(null);
  }, [automaticQuantities]);

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

    const plasterArea = netWallArea * v('plaster');

    const tileArea =
      floorArea * (1 + v('tileWaste') / 100);

    const paintArea =
      netExternalWallArea + partitions + floorArea;

    const paintLitres =
      v('paintCoverage') > 0
        ? (paintArea * v('paintCoats')) / v('paintCoverage')
        : 0;

    const lastFloor = floorData[floorData.length - 1];

    const waterproofArea =
      v('waterproof') > 0
        ? v('waterproof')
        : lastFloor.length * lastFloor.width;

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

      // Every active line item must have both a material and labor rate.
      const materialMissing = material <= 0;
      const laborMissing = labor <= 0;
      if (qty > 0 && (materialMissing || laborMissing)) {
        unpricedItemCount += 1;
      }

      detailedMaterialTotal += materialCost;
      detailedLaborTotal += laborCost;
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + itemTotal;
    });

    const detailedTotal = detailedMaterialTotal + detailedLaborTotal;

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
      electrical: v('electrical'),
      plumbing: v('plumbing'),
      detailedMaterialTotal,
      detailedLaborTotal,
      detailedTotal,
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
    <View key={key} style={styles.field}>
      <Text style={[styles.label, isArabic && styles.rtl]}>
        {labelForUnits(label, units)}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#888"
        style={[styles.input, isArabic && styles.rtl]}
      />
    </View>
  );

  const section = (heading: string, children: React.ReactNode) => (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, isArabic && styles.rtl]}>
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
    <View style={styles.resultRow} key={label}>
      <Text style={[styles.resultLabel, bold && styles.boldResult]}>
        {label}
      </Text>
      <Text style={[styles.resultValue, bold && styles.boldResult]}>
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

  const detailedField = (
    key: string,
    label: string,
    value: string
  ) => (
    <View style={styles.detailedInputColumn} key={key}>
      <Text style={styles.detailedInputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={text => updateDetailedValue(key, text)}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#888"
        style={styles.detailedInput}
        selectTextOnFocus
      />
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onBack}>
        <Text style={styles.back}>
          {isArabic ? '‹ العودة' : language === 'fr' ? '‹ Retour' : '‹ Back'}
        </Text>
      </Pressable>

      <Text style={[styles.title, isArabic && styles.rtl]}>
        {t.title}
      </Text>
      <Text style={[styles.subtitle, isArabic && styles.rtl]}>
        {t.subtitle}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {mode === 'professional' ? t.professional : t.homeowner}
        </Text>
      </View>

      {section(
        t.floors,
        <>
          {floors.map((floor, index) => (
            <View key={floor.id} style={styles.floorCard}>
              <View style={styles.floorHeader}>
                <Text style={styles.floorTitle}>
                  {language === 'ar'
                    ? `الطابق ${index + 1}`
                    : language === 'fr'
                    ? `Étage ${index + 1}`
                    : `Floor ${index + 1}`}
                </Text>
                {floors.length > 1 && (
                  <Pressable onPress={() => removeFloor(floor.id)}>
                    <Text style={styles.removeText}>{t.remove}</Text>
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
          <Pressable style={styles.secondaryButton} onPress={addFloor}>
            <Text style={styles.secondaryButtonText}>{t.addFloor}</Text>
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
              ['plaster', t.plaster],
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


      {section(
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
          <Text style={styles.detailedHint}>{t.detailedHint}</Text>

          {COST_CATEGORIES.map(category => {
            const items = COST_ITEMS.filter(
              item => item.category === category.id
            );
            const categoryTotal =
              calculations?.categoryTotals?.[category.id] || 0;

            return (
              <View key={category.id} style={styles.detailedCategory}>
                <View style={styles.detailedCategoryHeader}>
                  <Text style={styles.detailedCategoryTitle}>
                    {category.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0]}
                  </Text>
                  <Text style={styles.detailedCategoryTotal}>
                    {money(categoryTotal)}
                  </Text>
                </View>

                {items.map(item => {
                  const qty = Number(detailedValues[`${item.id}Qty`] || 0);
                  const material = Number(detailedValues[`${item.id}Material`] || 0);
                  const labor = Number(detailedValues[`${item.id}Labor`] || 0);
                  const itemTotal = qty * (material + labor);

                  return (
                    <View key={item.id} style={styles.detailedItem}>
                      <View style={styles.detailedItemHeading}>
                        <Text style={styles.detailedItemName}>
                          {item.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0]}
                        </Text>
                        <Text style={styles.detailedUnit}>
                          {unitForItem(item.unit)}
                        </Text>
                      </View>

                      <View style={styles.detailedInputsRow}>
                        {detailedField(
                          `${item.id}Qty`,
                          t.quantity,
                          detailedValues[`${item.id}Qty`]
                        )}
                        {detailedField(
                          `${item.id}Material`,
                          t.materialUnit,
                          detailedValues[`${item.id}Material`]
                        )}
                        {detailedField(
                          `${item.id}Labor`,
                          t.laborUnit,
                          detailedValues[`${item.id}Labor`]
                        )}
                      </View>

                      <View style={styles.detailedItemTotalRow}>
                        <Text style={styles.detailedItemTotalLabel}>
                          {t.itemTotal}
                        </Text>
                        <Text style={styles.detailedItemTotalValue}>
                          {money(itemTotal)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                <View style={styles.detailedCategoryFooter}>
                  <Text style={styles.detailedCategoryFooterLabel}>
                    {t.categoryTotal}
                  </Text>
                  <Text style={styles.detailedCategoryFooterValue}>
                    {money(categoryTotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      <Pressable style={styles.calculateButton} onPress={calculate}>
        <Text style={styles.calculateButtonText}>{t.calculate}</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultHeading}>{t.results}</Text>
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

          <View style={styles.resultDivider} />
          {resultRow(t.materialTotal, money(result.materialTotal))}
          {resultRow(t.laborResult, money(result.labor))}
          {resultRow(t.equipmentResult, money(result.equipment))}
          {resultRow(t.extraResult, money(result.extra))}

          {COST_CATEGORIES.map(category =>
            resultRow(
              category.names[language === 'ar' ? 1 : language === 'fr' ? 2 : 0],
              money(result.categoryTotals[category.id] || 0)
            )
          )}

          {resultRow(t.subtotal, money(result.subtotal))}
          {resultRow(t.reserve, money(result.reserve))}
          {result.unpricedItemCount > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>
                {language === 'ar'
                  ? 'تنبيه: أسعار غير مكتملة'
                  : language === 'fr'
                  ? 'Attention : tarifs incomplets'
                  : 'Warning: incomplete rates'}
              </Text>
              <Text style={styles.warningText}>
                {language === 'ar'
                  ? `يوجد ${result.unpricedItemCount} بنداً مستخدماً ينقصه سعر مواد أو أجرة عمل. الإجمالي الحالي جزئي ولا يشمل هذه التكاليف الناقصة.`
                  : language === 'fr'
                  ? `${result.unpricedItemCount} postes utilisés n’ont pas de prix de matériaux ou de main-d’œuvre. Le total est partiel et exclut ces coûts manquants.`
                  : `${result.unpricedItemCount} active line items are missing a material rate or labor rate. The displayed total is partial and excludes those missing costs.`}
              </Text>
            </View>
          )}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>
              {result.unpricedItemCount > 0
                ? (language === 'ar'
                    ? 'الإجمالي الجزئي التقديري'
                    : language === 'fr'
                    ? 'TOTAL PARTIEL ESTIMÉ'
                    : 'PARTIAL ESTIMATED COST')
                : t.total}
            </Text>
            <Text style={styles.totalValue}>{money(result.total)}</Text>
          </View>
        </View>
      )}

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>{t.note}</Text>
        <Text style={styles.warningText}>{t.warning}</Text>
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
