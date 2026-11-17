import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

type Language = 'en' | 'ar' | 'fr';
type Props = { toolId: string; language: Language; units: 'metric' | 'imperial'; onBack: () => void };

export default function MeasurementsToolScreen({ toolId, language, units, onBack }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [zeroPitch, setZeroPitch] = useState(0);
  const [zeroRoll, setZeroRoll] = useState(0);
  const [length, setLength] = useState('5');
  const [width, setWidth] = useState('4');

  const t = (en: string, ar: string, fr: string) => language === 'ar' ? ar : language === 'fr' ? fr : en;
  const isLevelTool = toolId === 'spirit-level';
  const isAngleTool = toolId === 'angle-slope';
  const isAreaTool = toolId === 'area-perimeter';
  const sensorTool = isLevelTool || isAngleTool;
  const pitchValue = pitch - zeroPitch;
  const rollValue = roll - zeroRoll;
  const slope = Math.tan(Math.abs(pitchValue) * Math.PI / 180) * 100;
  const area = Math.max(0, Number(length) || 0) * Math.max(0, Number(width) || 0);
  const perimeter = 2 * (Math.max(0, Number(length) || 0) + Math.max(0, Number(width) || 0));
  const unit = units === 'metric' ? 'm' : 'ft';
  const areaUnit = units === 'metric' ? 'm²' : 'ft²';

  useEffect(() => {
    if (!sensorTool) return;
    let subscription: { remove: () => void } | undefined;
    let active = true;
    if (Platform.OS === 'web') {
      setAvailable(false);
      return;
    }
    DeviceMotion.isAvailableAsync().then(ok => {
      if (!active) return;
      setAvailable(ok);
      if (!ok) return;
      DeviceMotion.setUpdateInterval(100);
      subscription = DeviceMotion.addListener(event => {
        const rotation = event.rotation;
        if (!rotation) return;
        const toDegrees = (value: number) => value * 180 / Math.PI;
        if (typeof rotation.beta === 'number') setPitch(toDegrees(rotation.beta));
        if (typeof rotation.gamma === 'number') setRoll(toDegrees(rotation.gamma));
      });
    }).catch(() => { if (active) setAvailable(false); });
    return () => { active = false; subscription?.remove(); };
  }, [sensorTool]);

  const title = useMemo(() => {
    const names: Record<string, [string, string, string]> = {
      'ar-distance': ['AR Distance Measurement', 'قياس المسافة بالواقع المعزز', 'Mesure de distance AR'],
      'ar-room': ['AR Room Measurement', 'قياس الغرف بالواقع المعزز', 'Mesure de pièce AR'],
      'angle-slope': ['Angle & Slope Measurement', 'قياس الزوايا والانحدار', 'Mesure des angles et pentes'],
      'spirit-level': ['Digital Spirit Level', 'ميزان الماء الرقمي', 'Niveau à bulle numérique'],
      height: ['Height Measurement', 'قياس الارتفاع', 'Mesure de hauteur'],
      'area-perimeter': ['Area & Perimeter Measurement', 'قياس المساحة والمحيط', 'Mesure de surface et périmètre'],
    };
    const tuple = names[toolId] || names['ar-distance'];
    return language === 'ar' ? tuple[1] : language === 'fr' ? tuple[2] : tuple[0];
  }, [toolId, language]);

  const arPlaceholder = t(
    'AR tracking will be added with the native ARCore/ARKit module. This screen does not report estimated distances.',
    'سيتم إضافة التتبع بالواقع المعزز عبر وحدة ARCore/ARKit الأصلية. لا تعرض هذه الشاشة مسافات تقديرية.',
    'Le suivi AR sera ajouté avec le module natif ARCore/ARKit. Aucun résultat de distance estimé ne sera affiché.'
  );

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>{title}</Text>

      {sensorTool && (
        <View style={s.panel}>
          {available === null ? (
            <Text style={s.muted}>{t('Checking device motion sensors…', 'جارٍ التحقق من مستشعرات الحركة…', 'Vérification des capteurs de mouvement…')}</Text>
          ) : available === false ? (
            <Text style={s.muted}>{t('Motion sensors are unavailable on this device or platform. Open this tool in the native mobile app.', 'مستشعرات الحركة غير متاحة على هذا الجهاز أو النظام. افتح الأداة في تطبيق الهاتف الأصلي.', 'Les capteurs de mouvement ne sont pas disponibles sur cet appareil ou cette plateforme. Ouvrez cet outil dans l’application mobile native.')}</Text>
          ) : (
            <>
              <Text style={s.eyebrow}>{isLevelTool ? t('LIVE TWO-AXIS LEVEL', 'ميزان مباشر بمحورين', 'NIVEAU EN DIRECT À DEUX AXES') : t('LIVE DEVICE ANGLES', 'زوايا الجهاز المباشرة', 'ANGLES DE L’APPAREIL EN DIRECT')}</Text>
              <View style={s.readings}>
                <View style={s.reading}><Text style={s.value}>{pitchValue.toFixed(1)}°</Text><Text style={s.label}>{t('Pitch', 'الميل الأمامي', 'Tangage')}</Text></View>
                <View style={s.reading}><Text style={s.value}>{rollValue.toFixed(1)}°</Text><Text style={s.label}>{t('Roll', 'الميل الجانبي', 'Roulis')}</Text></View>
              </View>
              {isAngleTool && <View style={s.result}><Text style={s.label}>{t('Slope from pitch', 'نسبة الانحدار', 'Pente calculée')}</Text><Text style={s.value}>{slope.toFixed(1)}%</Text></View>}
              {isLevelTool && (
                <View style={s.bubbleFrame}>
                  <View style={[s.bubble, { transform: [{ translateX: Math.max(-48, Math.min(48, rollValue * 2.4)) }, { translateY: Math.max(-48, Math.min(48, pitchValue * 2.4)) }] }]} />
                  <View style={s.bubbleCenter} />
                </View>
              )}
              <Pressable style={s.secondaryButton} onPress={() => { setZeroPitch(pitch); setZeroRoll(roll); }}>
                <Text style={s.buttonText}>{t('CALIBRATE ZERO', 'معايرة الصفر', 'CALIBRER LE ZÉRO')}</Text>
              </Pressable>
              <Text style={s.note}>{t('Place the phone flat against the surface, hold it steady, then calibrate if needed. Sensor accuracy depends on the phone.', 'ضع الهاتف على السطح وثبّته جيداً، ثم عاير الصفر عند الحاجة. تعتمد الدقة على الهاتف.', 'Placez le téléphone contre la surface, maintenez-le immobile, puis calibrez si nécessaire. La précision dépend du téléphone.')}</Text>
            </>
          )}
        </View>
      )}

      {isAreaTool && (
        <View style={s.panel}>
          <Text style={s.eyebrow}>{t('RECTANGULAR AREA', 'مساحة مستطيلة', 'SURFACE RECTANGULAIRE')}</Text>
          <Text style={s.label}>{t('Length', 'الطول', 'Longueur')} ({unit})</Text>
          <TextInput value={length} onChangeText={setLength} keyboardType="decimal-pad" style={s.input} placeholder="0" placeholderTextColor="#777" />
          <Text style={s.label}>{t('Width', 'العرض', 'Largeur')} ({unit})</Text>
          <TextInput value={width} onChangeText={setWidth} keyboardType="decimal-pad" style={s.input} placeholder="0" placeholderTextColor="#777" />
          <View style={s.result}><Text style={s.label}>{t('Area', 'المساحة', 'Surface')}</Text><Text style={s.value}>{area.toFixed(2)} {areaUnit}</Text></View>
          <View style={s.result}><Text style={s.label}>{t('Perimeter', 'المحيط', 'Périmètre')}</Text><Text style={s.value}>{perimeter.toFixed(2)} {unit}</Text></View>
          <Text style={s.note}>{t('Enter measured side lengths. This first version calculates rectangular spaces; polygon point marking will be added later.', 'أدخل أطوال الأضلاع المقاسة. تحسب هذه النسخة المساحات المستطيلة؛ وستضاف لاحقاً إمكانية تحديد نقاط الأشكال متعددة الأضلاع.', 'Saisissez les longueurs mesurées. Cette version calcule les rectangles ; le marquage de polygones sera ajouté ensuite.')}</Text>
        </View>
      )}

      {!sensorTool && !isAreaTool && (
        <View style={s.panel}>
          <Text style={s.eyebrow}>{t('NATIVE AR ENGINE REQUIRED', 'يتطلب محرك واقع معزز أصلي', 'MOTEUR AR NATIF REQUIS')}</Text>
          <Text style={s.muted}>{arPlaceholder}</Text>
          <Text style={s.note}>{t('AR measurement will only become available after a compatible Android/iPhone native build is installed.', 'سيصبح القياس بالواقع المعزز متاحاً بعد تثبيت نسخة أصلية متوافقة على أندرويد أو آيفون.', 'La mesure AR sera disponible après installation d’une version native compatible sur Android ou iPhone.')}</Text>
        </View>
      )}

      <Pressable style={s.back} onPress={onBack}><Text style={s.buttonText}>{t('BACK TO MEASUREMENTS', 'العودة إلى القياسات', 'RETOUR AUX MESURES')}</Text></Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32, gap: 14 },
  title: { color: '#E9B85D', fontSize: 21, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  panel: { backgroundColor: '#14191F', borderColor: '#5C4A2D', borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  eyebrow: { color: '#E9B85D', fontSize: 11, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  muted: { color: '#D2D4D7', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  readings: { flexDirection: 'row', gap: 10 },
  reading: { flex: 1, backgroundColor: '#090D11', borderRadius: 12, padding: 14, alignItems: 'center' },
  value: { color: '#E9B85D', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  label: { color: '#D2D4D7', fontSize: 12, textAlign: 'center' },
  result: { backgroundColor: '#090D11', borderRadius: 12, padding: 14, gap: 5, alignItems: 'center' },
  bubbleFrame: { alignSelf: 'center', width: 124, height: 124, borderRadius: 62, borderWidth: 3, borderColor: '#E9B85D', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080B0E' },
  bubble: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E9B85D', opacity: 0.9 },
  bubbleCenter: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  input: { backgroundColor: '#080B0E', color: '#FFFFFF', borderColor: '#66553A', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  secondaryButton: { borderWidth: 1, borderColor: '#E9B85D', borderRadius: 10, padding: 13, alignItems: 'center' },
  back: { backgroundColor: '#E9B85D', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#17110A', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  note: { color: '#AEB4BB', fontSize: 11, lineHeight: 17, textAlign: 'center' },
});
