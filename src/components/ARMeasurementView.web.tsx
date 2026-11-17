import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { mode: 'distance' | 'room'; units: 'metric' | 'imperial'; language: 'en' | 'ar' | 'fr' };

export default function ARMeasurementView({ language }: Props) {
  const copy = language === 'ar'
    ? ['يتطلب قياس AR تطبيق الهاتف الأصلي', 'لا يدعم المتصفح تتبع ARCore أو ARKit. افتح هذه الأداة في نسخة الهاتف الأصلية على جهاز متوافق.']
    : language === 'fr'
    ? ['La mesure AR nécessite l’application mobile native', 'Le navigateur ne prend pas en charge le suivi ARCore ou ARKit. Ouvrez cet outil dans une version native sur un appareil compatible.']
    : ['AR measurement requires the native mobile app', 'The browser cannot access ARCore or ARKit world tracking. Open this tool in a native build on a compatible device.'];
  return <View style={s.panel}><Text style={s.title}>{copy[0]}</Text><Text style={s.note}>{copy[1]}</Text></View>;
}
const s = StyleSheet.create({
  panel: { borderWidth: 1, borderColor: '#5C4A2D', borderRadius: 16, padding: 16, backgroundColor: '#14191F', gap: 10 },
  title: { color: '#E9B85D', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  note: { color: '#D2D4D7', fontSize: 12, lineHeight: 19, textAlign: 'center' },
});
