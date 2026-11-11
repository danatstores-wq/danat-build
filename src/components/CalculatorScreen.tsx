
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { calculateTool } from '../calculators';
import { getThemedStyles } from '../theme';

type Props = {
  calculatorId: string;
  language: 'en' | 'ar' | 'fr';
  units: 'metric' | 'imperial';
  onBack: () => void;
  theme: 'dark' | 'light';
};

type Field = {
  key: string;
  label: {
    en: string;
    ar: string;
    fr: string;
  };
  defaultValue: string;
};

const GOLD = '#E9B85D';

const fields: Record<string, Field[]> = {
  concrete: [
    { key: 'length', label: { en: 'Length (m)', ar: 'الطول (م)', fr: 'Longueur (m)' }, defaultValue: '5' },
    { key: 'width', label: { en: 'Width (m)', ar: 'العرض (م)', fr: 'Largeur (m)' }, defaultValue: '4' },
    { key: 'thickness', label: { en: 'Thickness (m)', ar: 'السماكة (م)', fr: 'Épaisseur (m)' }, defaultValue: '0.15' },
    { key: 'waste', label: { en: 'Wastage (%)', ar: 'نسبة الهدر (%)', fr: 'Perte (%)' }, defaultValue: '10' },
  ],
  tiles: [
    { key: 'length', label: { en: 'Room length (m)', ar: 'طول الغرفة (م)', fr: 'Longueur de la pièce (m)' }, defaultValue: '5' },
    { key: 'width', label: { en: 'Room width (m)', ar: 'عرض الغرفة (م)', fr: 'Largeur de la pièce (m)' }, defaultValue: '4' },
    { key: 'tileLength', label: { en: 'Tile length (cm)', ar: 'طول البلاطة (سم)', fr: 'Longueur du carreau (cm)' }, defaultValue: '60' },
    { key: 'tileWidth', label: { en: 'Tile width (cm)', ar: 'عرض البلاطة (سم)', fr: 'Largeur du carreau (cm)' }, defaultValue: '60' },
    { key: 'waste', label: { en: 'Wastage (%)', ar: 'نسبة الهدر (%)', fr: 'Perte (%)' }, defaultValue: '10' },
  ],
  paint: [
    { key: 'wallLength', label: { en: 'Wall length (m)', ar: 'طول الجدار (م)', fr: 'Longueur du mur (m)' }, defaultValue: '5' },
    { key: 'wallHeight', label: { en: 'Wall height (m)', ar: 'ارتفاع الجدار (م)', fr: 'Hauteur du mur (m)' }, defaultValue: '3' },
    { key: 'numberOfWalls', label: { en: 'Number of walls', ar: 'عدد الجدران', fr: 'Nombre de murs' }, defaultValue: '4' },
    { key: 'coats', label: { en: 'Number of coats', ar: 'عدد طبقات الدهان', fr: 'Nombre de couches' }, defaultValue: '2' },
    { key: 'coverage', label: { en: 'Coverage (m²/L)', ar: 'التغطية (م²/لتر)', fr: 'Couverture (m²/L)' }, defaultValue: '10' },
    { key: 'waste', label: { en: 'Wastage (%)', ar: 'نسبة الهدر (%)', fr: 'Perte (%)' }, defaultValue: '10' },
    { key: 'openings', label: { en: 'Doors and windows area (m²)', ar: 'مساحة الأبواب والنوافذ (م²)', fr: 'Surface des portes et fenêtres (m²)' }, defaultValue: '0' },
  ],
  blocks: [
    { key: 'wallLength', label: { en: 'Wall length (m)', ar: 'طول الجدار (م)', fr: 'Longueur du mur (m)' }, defaultValue: '5' },
    { key: 'wallHeight', label: { en: 'Wall height (m)', ar: 'ارتفاع الجدار (م)', fr: 'Hauteur du mur (m)' }, defaultValue: '3' },
    { key: 'blockLength', label: { en: 'Block length (cm)', ar: 'طول البلوك (سم)', fr: 'Longueur du bloc (cm)' }, defaultValue: '40' },
    { key: 'blockHeight', label: { en: 'Block height (cm)', ar: 'ارتفاع البلوك (سم)', fr: 'Hauteur du bloc (cm)' }, defaultValue: '20' },
    { key: 'waste', label: { en: 'Wastage (%)', ar: 'نسبة الهدر (%)', fr: 'Perte (%)' }, defaultValue: '5' },
    { key: 'openings', label: { en: 'Doors and windows area (m²)', ar: 'مساحة الأبواب والنوافذ (م²)', fr: 'Surface des portes et fenêtres (m²)' }, defaultValue: '0' },
  ],
  sand: [
    { key: 'length', label: { en: 'Length (m)', ar: 'الطول (م)', fr: 'Longueur (m)' }, defaultValue: '1' },
    { key: 'width', label: { en: 'Width (m)', ar: 'العرض (م)', fr: 'Largeur (m)' }, defaultValue: '1' },
    { key: 'thickness', label: { en: 'Thickness (m)', ar: 'السماكة (م)', fr: 'Épaisseur (m)' }, defaultValue: '1' },
    { key: 'cementRatio', label: { en: 'Cement ratio', ar: 'نسبة الإسمنت', fr: 'Proportion de ciment' }, defaultValue: '1' },
    { key: 'sandRatio', label: { en: 'Sand ratio', ar: 'نسبة الرمل', fr: 'Proportion de sable' }, defaultValue: '4' },
  ],
  cost: [
    { key: 'materialCost', label: { en: 'Materials cost', ar: 'تكلفة المواد', fr: 'Coût des matériaux' }, defaultValue: '2000' },
    { key: 'labourCost', label: { en: 'Labour cost', ar: 'تكلفة العمالة', fr: 'Coût de la main-d’œuvre' }, defaultValue: '1000' },
    { key: 'equipmentCost', label: { en: 'Equipment cost', ar: 'تكلفة المعدات', fr: 'Coût des équipements' }, defaultValue: '300' },
    { key: 'additionalCost', label: { en: 'Additional costs', ar: 'تكاليف إضافية', fr: 'Coûts supplémentaires' }, defaultValue: '200' },
    { key: 'contingency', label: { en: 'Contingency (%)', ar: 'نسبة الاحتياطي (%)', fr: 'Imprévus (%)' }, defaultValue: '10' },
  ],
};

const titles: Record<string, { en: string; ar: string; fr: string }> = {
  concrete: { en: 'Concrete Calculator', ar: 'حاسبة الباطون', fr: 'Calculateur de béton' },
  tiles: { en: 'Tiles & Ceramics', ar: 'حاسبة البلاط والسيراميك', fr: 'Carrelage et céramique' },
  paint: { en: 'Paint Calculator', ar: 'حاسبة الدهان', fr: 'Calculateur de peinture' },
  blocks: { en: 'Blocks & Bricks', ar: 'حاسبة البلوك والطوب', fr: 'Blocs et briques' },
  sand: { en: 'Sand & Cement', ar: 'حاسبة الرمل والإسمنت', fr: 'Sable et ciment' },
  cost: { en: 'Project Cost', ar: 'حاسبة تكلفة المشروع', fr: 'Coût du projet' },
};

const resultLabels: Record<string, Record<string, string>> = {
  result: { en: 'Concrete required (m³)', ar: 'كمية الباطون المطلوبة (م³)', fr: 'Béton nécessaire (m³)' },
  floorArea: { en: 'Floor area (m²)', ar: 'مساحة الأرضية (م²)', fr: 'Surface du sol (m²)' },
  tileArea: { en: 'One tile area (m²)', ar: 'مساحة البلاطة (م²)', fr: 'Surface du carreau (m²)' },
  tilesWithoutWaste: { en: 'Tiles before wastage', ar: 'عدد البلاط قبل الهدر', fr: 'Carreaux sans perte' },
  recommendedTiles: { en: 'Recommended tiles', ar: 'عدد البلاط المطلوب', fr: 'Carreaux recommandés' },
  totalAreaWithWaste: { en: 'Area with wastage (m²)', ar: 'المساحة مع الهدر (م²)', fr: 'Surface avec perte (m²)' },
  wallArea: { en: 'Wall area (m²)', ar: 'مساحة الجدار (م²)', fr: 'Surface du mur (m²)' },
  totalArea: { en: 'Total painted area (m²)', ar: 'مساحة الدهان الإجمالية (م²)', fr: 'Surface totale à peindre (m²)' },
  paintLitres: { en: 'Paint required (L)', ar: 'الدهان المطلوب (لتر)', fr: 'Peinture nécessaire (L)' },
  recommendedLitres: { en: 'Recommended litres', ar: 'الكمية المقترحة باللتر', fr: 'Litres recommandés' },
  blockArea: { en: 'One block area (m²)', ar: 'مساحة البلوكة (م²)', fr: 'Surface du bloc (m²)' },
  blocksWithoutWaste: { en: 'Blocks before wastage', ar: 'البلوك قبل الهدر', fr: 'Blocs sans perte' },
  recommendedBlocks: { en: 'Recommended blocks', ar: 'عدد البلوك المطلوب', fr: 'Blocs recommandés' },
  wetVolume: { en: 'Wet volume (m³)', ar: 'الحجم الرطب (م³)', fr: 'Volume humide (m³)' },
  dryVolume: { en: 'Dry volume (m³)', ar: 'الحجم الجاف (م³)', fr: 'Volume sec (m³)' },
  cementVolume: { en: 'Cement volume (m³)', ar: 'حجم الإسمنت (م³)', fr: 'Volume de ciment (m³)' },
  sandVolume: { en: 'Sand volume (m³)', ar: 'حجم الرمل (م³)', fr: 'Volume de sable (m³)' },
  cementBags: { en: '50 kg cement bags', ar: 'أكياس الإسمنت 50 كغ', fr: 'Sacs de ciment 50 kg' },
  cementWeightKg: { en: 'Cement weight (kg)', ar: 'وزن الإسمنت (كغ)', fr: 'Poids du ciment (kg)' },
  materialCost: { en: 'Materials cost', ar: 'تكلفة المواد', fr: 'Coût des matériaux' },
  labourCost: { en: 'Labour cost', ar: 'تكلفة العمالة', fr: 'Coût de la main-d’œuvre' },
  equipmentCost: { en: 'Equipment cost', ar: 'تكلفة المعدات', fr: 'Coût des équipements' },
  additionalCost: { en: 'Additional costs', ar: 'تكاليف إضافية', fr: 'Coûts supplémentaires' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي', fr: 'Sous-total' },
  contingency: { en: 'Contingency', ar: 'الاحتياطي', fr: 'Imprévus' },
  totalCost: { en: 'Total project cost', ar: 'التكلفة الإجمالية للمشروع', fr: 'Coût total du projet' },
};


const FT_TO_M = 0.3048;
const IN_TO_CM = 2.54;
const SQFT_TO_SQM = 0.09290304;
const CUFT_TO_CUM = 0.028316846592;
const US_GAL_TO_L = 3.785411784;

const feetInputKeys = [
  'length', 'width', 'thickness', 'wallLength', 'wallHeight',
];

const inchInputKeys = [
  'tileLength', 'tileWidth', 'blockLength', 'blockHeight',
];

const areaInputKeys = ['openings'];

const areaResultKeys = [
  'floorArea', 'tileArea', 'totalAreaWithWaste',
  'wallArea', 'totalArea', 'blockArea',
];

const volumeResultKeys = [
  'result', 'wetVolume', 'dryVolume',
  'cementVolume', 'sandVolume',
];

function inputToMetric(key: string, value: number, units: Props['units']) {
  if (units === 'metric') return value;
  if (feetInputKeys.includes(key)) return value * FT_TO_M;
  if (inchInputKeys.includes(key)) return value * IN_TO_CM;
  if (areaInputKeys.includes(key)) return value * SQFT_TO_SQM;
  if (key === 'coverage') return value * SQFT_TO_SQM / US_GAL_TO_L;
  return value;
}

function resultFromMetric(key: string, value: number, units: Props['units']) {
  if (units === 'metric') return value;
  if (areaResultKeys.includes(key)) return value / SQFT_TO_SQM;
  if (volumeResultKeys.includes(key)) return value / CUFT_TO_CUM;
  if (key === 'paintLitres' || key === 'recommendedLitres') {
    return value / US_GAL_TO_L;
  }
  return value;
}

function defaultInputValue(field: Field, units: Props['units']) {
  const value = Number(field.defaultValue);
  if (units === 'metric') return field.defaultValue;

  if (feetInputKeys.includes(field.key)) {
    return String(Number((value / FT_TO_M).toFixed(3)));
  }
  if (inchInputKeys.includes(field.key)) {
    return String(Number((value / IN_TO_CM).toFixed(3)));
  }
  if (areaInputKeys.includes(field.key)) {
    return String(Number((value / SQFT_TO_SQM).toFixed(3)));
  }
  if (field.key === 'coverage') {
    return String(Number((value * US_GAL_TO_L / SQFT_TO_SQM).toFixed(3)));
  }
  return field.defaultValue;
}

function unitLabel(label: string, units: Props['units']) {
  if (units === 'metric') return label;

  return label
    .replaceAll('(m²/L)', '(ft²/US gal)')
    .replaceAll('(m²)', '(ft²)')
    .replaceAll('(m³)', '(ft³)')
    .replaceAll('(m)', '(ft)')
    .replaceAll('(cm)', '(in)')
    .replaceAll('(م²/لتر)', '(ft²/US gal)')
    .replaceAll('(م²)', '(ft²)')
    .replaceAll('(م³)', '(ft³)')
    .replaceAll('(م)', '(ft)')
    .replaceAll('(سم)', '(in)')
    .replaceAll('(لتر)', '(US gal)')
    .replaceAll('باللتر', 'بالغالون')
    .replaceAll('(L)', '(US gal)');
}

function formatLabel(key: string, language: Props['language'], units: Props['units']): string {
  return unitLabel(resultLabels[key]?.[language] || key, units);
}

export default function CalculatorScreen({
  calculatorId,
  language,
  theme,
  units,
  onBack,
}: Props) {
  const ui = getThemedStyles(styles, theme);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      (fields[calculatorId] || []).map(field => [
        field.key,
        defaultInputValue(field, units),
      ])
    )
  );

  useEffect(() => {
    setValues(
      Object.fromEntries(
        (fields[calculatorId] || []).map(field => [
          field.key,
          defaultInputValue(field, units),
        ])
      )
    );
    setResult(null);
    setError('');
  }, [calculatorId, units]);

  const [result, setResult] = useState<
    Record<string, number> | number | null
  >(null);

  const [error, setError] = useState('');

  const isArabic = language === 'ar';
  const title = titles[calculatorId]?.[language] || 'Calculator';

  const calculate = () => {
    try {
      const numericValues: Record<string, number> = {};

      for (const field of fields[calculatorId] || []) {
        const rawValue = values[field.key]?.trim();

        if (rawValue === '') {
          throw new Error('Please fill in all fields');
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
          throw new Error('Please enter valid numbers');
        }

        numericValues[field.key] = inputToMetric(field.key, value, units);
      }

      const calculated = calculateTool(calculatorId, numericValues);

      setResult(calculated as Record<string, number> | number);
      setError('');
    } catch (e) {
      setResult(null);

      setError(
        isArabic
          ? 'يرجى التحقق من القياسات المدخلة'
          : language === 'fr'
          ? 'Veuillez vérifier les mesures saisies'
          : e instanceof Error
          ? e.message
          : 'Calculation failed'
      );
    }
  };

  const resultEntries: [string, number][] =
    result !== null && typeof result === 'object'
      ? Object.entries(result)
      : result !== null
      ? [['result', result]]
      : [];

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
        {title}
      </Text>

      <Text style={[ui.subtitle, isArabic && ui.rtl]}>
        {isArabic
          ? 'أدخل القياسات للحصول على تقدير'
          : language === 'fr'
          ? 'Saisissez les mesures pour obtenir une estimation'
          : 'Enter your measurements to get an estimate'}
      </Text>

      <View style={ui.card}>
        {(fields[calculatorId] || []).map(field => (
          <View key={field.key} style={ui.field}>
            <Text style={[ui.label, isArabic && ui.rtl]}>
              {unitLabel(field.label[language], units)}
            </Text>

            <TextInput
              value={values[field.key] ?? ''}
              onChangeText={value => {
                setValues(old => ({
                  ...old,
                  [field.key]: value,
                }));
                setResult(null);
                setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#888"
              style={[ui.input, isArabic && ui.rtl]}
            />
          </View>
        ))}

        <Pressable style={ui.button} onPress={calculate}>
          <Text style={ui.buttonText}>
            {isArabic
              ? 'احسب النتيجة'
              : language === 'fr'
              ? 'CALCULER'
              : 'CALCULATE RESULT'}
          </Text>
        </Pressable>
      </View>

      {!!error && (
        <Text style={ui.error}>{error}</Text>
      )}

      {result !== null && (
        <View style={ui.resultCard}>
          <Text style={ui.resultHeading}>
            {isArabic
              ? 'النتائج'
              : language === 'fr'
              ? 'RÉSULTATS'
              : 'CALCULATION RESULTS'}
          </Text>

          {resultEntries.map(([key, value]) => (
            <View key={key} style={ui.resultRow}>
              <Text
                style={[
                  ui.resultLabel,
                  isArabic && ui.rtl,
                ]}
              >
                {formatLabel(key, language, units)}
              </Text>

              <Text style={ui.resultValue}>
                {resultFromMetric(key, Number(value), units).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  back: {
    color: GOLD,
    fontSize: 15,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#b7bbc0',
    fontSize: 13,
    marginTop: 7,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#171c22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#51432f',
  },
  field: {
    marginBottom: 15,
  },
  label: {
    color: '#eee',
    fontSize: 13,
    marginBottom: 7,
  },
  rtl: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#292f36',
    color: '#fff',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#45484d',
  },
  button: {
    backgroundColor: GOLD,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#17110a',
    fontWeight: '900',
    fontSize: 14,
  },
  error: {
    color: '#ff7777',
    marginTop: 15,
    textAlign: 'center',
  },
  resultCard: {
    marginTop: 18,
    backgroundColor: '#20272b',
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: '#6c5938',
  },
  resultHeading: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3b4145',
    gap: 10,
  },
  resultLabel: {
    color: '#ddd',
    flex: 1,
    fontSize: 12,
  },
  resultValue: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '800',
  },
});
