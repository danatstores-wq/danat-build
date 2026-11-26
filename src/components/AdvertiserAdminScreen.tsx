import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Timestamp, addDoc, collection, getDocs, orderBy, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firestore';
import { getThemedStyles } from '../theme';

type Lang = 'en' | 'ar' | 'fr';
type Campaign = { id: string; countryCode: string; advertiserName: string; imageUrl: string; clickUrl: string; startsAt: Date; endsAt: Date; active: boolean };
const countries = ['LB', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'EG', 'IQ'];

export default function AdvertiserAdminScreen({ language, theme, onBack }: { language: Lang; theme: 'dark' | 'light'; onBack: () => void }) {
  const ui = getThemedStyles({} as any, theme);
  const [items, setItems] = useState<Campaign[]>([]);
  const [countryCode, setCountryCode] = useState('KW');
  const [advertiserName, setAdvertiserName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const ar = language === 'ar';
  const t = (en: string, a: string, fr: string) => language === 'ar' ? a : language === 'fr' ? fr : en;
  const load = async () => {
    const result = await getDocs(query(collection(db, 'directAdCampaigns'), orderBy('createdAt', 'desc')));
    setItems(result.docs.map(item => {
      const d = item.data();
      return { id: item.id, countryCode: d.countryCode, advertiserName: d.advertiserName, imageUrl: d.imageUrl, clickUrl: d.clickUrl, startsAt: d.startsAt.toDate(), endsAt: d.endsAt.toDate(), active: d.active };
    }));
  };
  useEffect(() => { load().catch(error => console.warn('Could not load direct ad campaigns:', error)); }, []);
  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#E9B85D', fontWeight: '800', marginBottom: 5 }}>{label}</Text>
      <TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor="#888" autoCapitalize="none" style={{ color: '#fff', backgroundColor: '#252b32', borderRadius: 9, borderWidth: 1, borderColor: '#655235', padding: 11 }} />
    </View>
  );
  const save = async () => {
    const start = new Date(startsAt + 'T00:00:00');
    const end = new Date(endsAt + 'T23:59:59');
    if (!advertiserName.trim() || !/^https:\/\//i.test(imageUrl) || !/^https:\/\//i.test(clickUrl) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      Alert.alert(t('Check campaign details', 'تحقق من بيانات الحملة', 'Vérifiez les détails'), t('Enter a company name, HTTPS image and destination URLs, and valid dates.', 'أدخل اسم الشركة وروابط HTTPS وتواريخ صحيحة.', 'Saisissez un nom, des liens HTTPS et des dates valides.'));
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'directAdCampaigns'), { countryCode, advertiserName: advertiserName.trim(), imageUrl: imageUrl.trim(), clickUrl: clickUrl.trim(), startsAt: Timestamp.fromDate(start), endsAt: Timestamp.fromDate(end), active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAdvertiserName(''); setImageUrl(''); setClickUrl('');
      await load();
      Alert.alert(t('Campaign created', 'تم إنشاء الحملة', 'Campagne créée'));
    } catch (error) {
      Alert.alert(t('Could not save', 'تعذر الحفظ', 'Échec de l’enregistrement'), error instanceof Error ? error.message : String(error));
    } finally { setSaving(false); }
  };
  const toggle = async (campaign: Campaign) => {
    try { await updateDoc(doc(db, 'directAdCampaigns', campaign.id), { active: !campaign.active, updatedAt: serverTimestamp() }); await load(); }
    catch (error) { Alert.alert('Error', error instanceof Error ? error.message : String(error)); }
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
      <Pressable onPress={onBack}><Text style={{ color: '#E9B85D', fontSize: 16, marginBottom: 18 }}>‹ {t('Back', 'عودة', 'Retour')}</Text></Pressable>
      <Text style={{ color: '#E9B85D', fontSize: 22, fontWeight: '900' }}>{t('DIRECT ADVERTISERS', 'الإعلانات المباشرة', 'ANNONCEURS DIRECTS')}</Text>
      <Text style={{ color: '#ccc', marginTop: 7, lineHeight: 19 }}>{t('Create paid campaigns for a selected country. Ads appear only while active and within their campaign dates.', 'أنشئ حملات مدفوعة لدولة محددة. تظهر الإعلانات فقط أثناء تفعيل الحملة وضمن تواريخها.', 'Créez des campagnes payantes par pays. Les annonces s’affichent uniquement pendant leur période active.')}</Text>
      <Text style={{ color: '#E9B85D', fontWeight: '900', marginTop: 20 }}>{t('TARGET COUNTRY', 'الدولة المستهدفة', 'PAYS CIBLE')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
        {countries.map(code => <Pressable key={code} onPress={() => setCountryCode(code)} style={{ padding: 10, borderRadius: 9, borderWidth: 1, borderColor: countryCode === code ? '#E9B85D' : '#555', backgroundColor: countryCode === code ? '#4a3920' : '#222831' }}><Text style={{ color: '#fff', fontWeight: '800' }}>{code}</Text></Pressable>)}
      </View>
      {field(t('Company name', 'اسم الشركة', 'Nom de l’entreprise'), advertiserName, setAdvertiserName, 'ABC Building Materials')}
      {field(t('Banner image HTTPS URL', 'رابط صورة الإعلان HTTPS', 'URL HTTPS de la bannière'), imageUrl, setImageUrl, 'https://example.com/banner.jpg')}
      {field(t('Destination HTTPS URL', 'رابط الوجهة HTTPS', 'URL HTTPS de destination'), clickUrl, setClickUrl, 'https://company.com')}
      {field(t('Start date (YYYY-MM-DD)', 'تاريخ البداية', 'Date de début'), startsAt, setStartsAt, '2026-11-26')}
      {field(t('End date (YYYY-MM-DD)', 'تاريخ الانتهاء', 'Date de fin'), endsAt, setEndsAt, '2026-12-26')}
      <Pressable disabled={saving} onPress={save} style={{ backgroundColor: '#E9B85D', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 18, opacity: saving ? 0.6 : 1 }}><Text style={{ color: '#17110A', fontWeight: '900' }}>{saving ? t('SAVING…', 'جارٍ الحفظ…', 'ENREGISTREMENT…') : t('CREATE CAMPAIGN', 'إنشاء الحملة', 'CRÉER LA CAMPAGNE')}</Text></Pressable>
      <Text style={{ color: '#E9B85D', fontWeight: '900', marginTop: 26, marginBottom: 10 }}>{t('EXISTING CAMPAIGNS', 'الحملات الحالية', 'CAMPAGNES EXISTANTES')}</Text>
      {items.length === 0 ? <Text style={{ color: '#aaa' }}>{t('No campaigns yet.', 'لا توجد حملات بعد.', 'Aucune campagne pour le moment.')}</Text> : items.map(item => (
        <View key={item.id} style={{ backgroundColor: '#1b2229', borderColor: '#655235', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 9 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{item.advertiserName} · {item.countryCode}</Text>
          <Text style={{ color: '#bbb', marginTop: 4 }}>{item.startsAt.toLocaleDateString()} – {item.endsAt.toLocaleDateString()}</Text>
          <Text style={{ color: item.active ? '#7fd49b' : '#e2a66b', marginTop: 4 }}>{item.active ? t('ACTIVE', 'نشطة', 'ACTIVE') : t('INACTIVE', 'متوقفة', 'INACTIVE')}</Text>
          <Pressable onPress={() => toggle(item)} style={{ padding: 10, borderRadius: 8, backgroundColor: '#303943', marginTop: 9, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '800' }}>{item.active ? t('DEACTIVATE', 'إيقاف', 'DÉSACTIVER') : t('ACTIVATE', 'تفعيل', 'ACTIVER')}</Text></Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
