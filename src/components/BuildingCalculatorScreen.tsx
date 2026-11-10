
import React, { useMemo, useState } from 'react';
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
  onBack: () => void;
};

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
    prices: 'UNIT PRICES (USD)',
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
    prices: 'أسعار الوحدات (دولار)',
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
    prices: 'PRIX UNITAIRES (USD)',
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
  },
};

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
  electrical: '80',
  plumbing: '20',
  concretePrice: '110',
  blockPrice: '1',
  plasterPrice: '4',
  tilePrice: '15',
  paintPrice: '8',
  waterproofPrice: '12',
  electricalPrice: '25',
  plumbingPrice: '35',
  labor: '0',
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

export default function BuildingCalculatorScreen({
  language,
  mode,
  onBack,
}: Props) {
  const t = translations[language];
  const isArabic = language === 'ar';

  const [floors, setFloors] = useState<FloorData[]>([
    initialFloor(1),
    initialFloor(2),
  ]);

  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState('');

  const updateValue = (key: string, value: string) => {
    setValues(old => ({ ...old, [key]: value }));
    setResult(null);
  };

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
      length: Number(floor.length),
      width: Number(floor.width),
      height: Number(floor.height),
      openings: Number(floor.openings),
      partitions: Number(floor.partitions),
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

    if (!allFloorValues || !allInputs || floors.length === 0) {
      return null;
    }

    const v = (key: string) => number(values, key);

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

    const concreteCost = concrete * v('concretePrice');
    const blockCost = blocks * v('blockPrice');
    const plasterCost = plasterArea * v('plasterPrice');
    const tileCost = tileArea * v('tilePrice');
    const paintCost = paintLitres * v('paintPrice');
    const waterproofCost = waterproofArea * v('waterproofPrice');
    const electricalCost = v('electrical') * v('electricalPrice');
    const plumbingCost = v('plumbing') * v('plumbingPrice');

    const materialTotal =
      concreteCost +
      blockCost +
      plasterCost +
      tileCost +
      paintCost +
      waterproofCost +
      electricalCost +
      plumbingCost;

    const labor = v('labor');
    const equipment = v('equipment');
    const extra = v('extra');

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
      materialTotal,
      labor,
      equipment,
      extra,
      subtotal,
      reserve,
      total,
    };
  }, [floors, values]);

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
      <Text style={[styles.label, isArabic && styles.rtl]}>{label}</Text>
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
        t.services,
        <>
          {(
            [
              ['electrical', t.electrical],
              ['plumbing', t.plumbing],
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
              ['concretePrice', t.concretePrice],
              ['blockPrice', t.blockPrice],
              ['plasterPrice', t.plasterPrice],
              ['tilePrice', t.tilePrice],
              ['paintPrice', t.paintPrice],
              ['waterproofPrice', t.waterproofPrice],
              ['electricalPrice', t.electricalPrice],
              ['plumbingPrice', t.plumbingPrice],
              ['labor', t.labor],
              ['equipment', t.equipment],
              ['extra', t.extra],
              ['contingency', t.contingency],
            ] as [string, string][]
          ).map(([key, label]) =>
            field(key, label, values[key], value => updateValue(key, value))
          )}
        </>
      )}

      <Pressable style={styles.calculateButton} onPress={calculate}>
        <Text style={styles.calculateButtonText}>{t.calculate}</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultHeading}>{t.results}</Text>
          {resultRow(t.floorArea, `${quantity(result.floorArea)} m²`)}
          {resultRow(t.excavation, `${quantity(result.excavation)} m³`)}
          {resultRow(t.concrete, `${quantity(result.concrete)} m³`)}
          {resultRow(t.blocks, `${quantity(result.blocks)} blocks`)}
          {resultRow(t.wallArea, `${quantity(result.netWallArea)} m²`)}
          {resultRow(t.plasterArea, `${quantity(result.plasterArea)} m²`)}
          {resultRow(t.tileArea, `${quantity(result.tileArea)} m²`)}
          {resultRow(t.paintLitres, `${quantity(result.paintLitres)} L`)}
          {resultRow(t.waterproofArea, `${quantity(result.waterproofArea)} m²`)}
          {resultRow(t.electricalPoints, quantity(result.electrical))}
          {resultRow(t.plumbingPoints, quantity(result.plumbing))}

          <View style={styles.resultDivider} />
          {resultRow(t.materialTotal, money(result.materialTotal))}
          {resultRow(t.laborResult, money(result.labor))}
          {resultRow(t.equipmentResult, money(result.equipment))}
          {resultRow(t.extraResult, money(result.extra))}
          {resultRow(t.subtotal, money(result.subtotal))}
          {resultRow(t.reserve, money(result.reserve))}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{t.total}</Text>
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
});
