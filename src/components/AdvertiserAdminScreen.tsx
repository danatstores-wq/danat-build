import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Timestamp, addDoc, collection, getDocs, orderBy, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firestore';
import { BANNER_UPLOAD_API } from '../config/bannerUpload';

type Lang = 'en' | 'ar' | 'fr';
type Campaign = { id: string; countryCode: string; advertiserName: string; imageUrl: string; clickUrl: string; startsAt: Date; endsAt: Date; active: boolean; displayDurationSeconds: number };
const countries = ['LB', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'EG', 'IQ'];
const MAX_BANNER_BYTES = 5 * 1024 * 1024;

export default function AdvertiserAdminScreen({ language, theme, onBack }: { language: Lang; theme: 'dark' | 'light'; onBack: () => void }) {
  const [items, setItems] = useState<Campaign[]>([]);
  const [countryCode, setCountryCode] = useState('KW');
  const [advertiserName, setAdvertiserName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState('6');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const t = (en: string, a: string, fr: string) => language === 'ar' ? a : language === 'fr' ? fr : en;
  const load = async () => {
    const result = await getDocs(query(collection(db, 'directAdCampaigns'), orderBy('createdAt', 'desc')));
    setItems(result.docs.map(item => {
      const d = item.data();
      return { id: item.id, countryCode: d.countryCode, advertiserName: d.advertiserName, imageUrl: d.imageUrl, clickUrl: d.clickUrl, startsAt: d.startsAt.toDate(), endsAt: d.endsAt.toDate(), active: d.active, displayDurationSeconds: Number(d.displayDurationSeconds) || 6 };
    }));
  };
  useEffect(() => { load().catch(error => console.warn('Could not load direct ad campaigns:', error)); }, []);
  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#E9B85D', fontWeight: '800', marginBottom: 5 }}>{label}</Text>
      <TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor="#888" autoCapitalize="none" style={{ color: '#fff', backgroundColor: '#252b32', borderRadius: 9, borderWidth: 1, borderColor: '#655235', padding: 11 }} />
    </View>
  );
  const processBannerFile = async (file: Blob, mimeType: string, fileName = 'banner') => {
    try {
      if (file.size > MAX_BANNER_BYTES) {
        const message = t('Choose an image smaller than 5 MB.', 'اختر صورة أصغر من 5 ميغابايت.', 'Choisissez une image de moins de 5 Mo.');
        if (Platform.OS === 'web') window.alert(message);
        else Alert.alert(t('Image too large', 'الصورة كبيرة جداً', 'Image trop volumineuse'), message);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        const message = t('Please choose a JPG, PNG or WebP image.', 'اختر صورة JPG أو PNG أو WebP.', 'Choisissez une image JPG, PNG ou WebP.');
        if (Platform.OS === 'web') window.alert(message);
        else Alert.alert(t('Unsupported image', 'صيغة الصورة غير مدعومة', 'Format non pris en charge'), message);
        return;
      }
      if (!BANNER_UPLOAD_API) throw new Error('The secure Cloudflare banner upload service has not been connected yet.');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Please sign in again before uploading.');
      setUploading(true);
      const idToken = await currentUser.getIdToken();
      const form = new FormData();
      form.append('file', file, fileName || 'banner');
      const response = await fetch(`${BANNER_UPLOAD_API.replace(/\/+$/, '')}/api/banner-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
      const result = await response.json().catch(() => ({})) as { imageUrl?: string; error?: string };
      if (!response.ok || !result.imageUrl || !/^https:\/\//i.test(result.imageUrl)) {
        throw new Error(result.error || `Upload service returned HTTP ${response.status}.`);
      }
      setImageUrl(result.imageUrl);
      const message = t('Your banner is ready to use in this campaign.', 'أصبحت الصورة جاهزة للاستخدام في الحملة.', 'Votre bannière est prête pour cette campagne.');
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert(t('Banner uploaded', 'تم رفع الإعلان', 'Bannière envoyée'), message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (Platform.OS === 'web') window.alert(`${t('Upload failed', 'فشل رفع الصورة', 'Échec du téléversement')}: ${message}`);
      else Alert.alert(t('Upload failed', 'فشل رفع الصورة', 'Échec du téléversement'), message);
    } finally {
      setUploading(false);
    }
  };

  const uploadBanner = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.style.display = 'none';
      input.onchange = () => {
        const file = input.files?.[0];
        input.remove();
        if (file) void processBannerFile(file, file.type || 'image/jpeg', file.name);
      };
      document.body.appendChild(input);
      input.click();
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await processBannerFile(blob, asset.mimeType || 'image/jpeg', asset.fileName || 'banner');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(t('Upload failed', 'فشل رفع الصورة', 'Échec du téléversement'), message);
    }
  };
  const save = async () => {
    const start = new Date(startsAt + 'T00:00:00');
    const end = new Date(endsAt + 'T23:59:59');
    if (!advertiserName.trim() || !/^https:\/\//i.test(imageUrl) || !/^https:\/\//i.test(clickUrl) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start || !/^\d+$/.test(displayDurationSeconds) || Number(displayDurationSeconds) < 1 || Number(displayDurationSeconds) > 300) {
      Alert.alert(t('Check campaign details', 'تحقق من بيانات الحملة', 'Vérifiez les détails'), t('Enter a company name, banner, destination URL, valid dates, and a display duration from 1 to 300 seconds.', 'أدخل اسم الشركة والصورة ورابط الوجهة والتواريخ ومدة عرض بين 1 و300 ثانية.', 'Saisissez le nom, la bannière, le lien de destination, des dates valides et une durée de 1 à 300 secondes.'));
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'directAdCampaigns'), { countryCode, advertiserName: advertiserName.trim(), imageUrl: imageUrl.trim(), clickUrl: clickUrl.trim(), startsAt: Timestamp.fromDate(start), endsAt: Timestamp.fromDate(end), active: true, displayDurationSeconds: Number(displayDurationSeconds), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAdvertiserName(''); setImageUrl(''); setClickUrl(''); setDisplayDurationSeconds('6');
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
      <Text style={{ color: '#E9B85D', fontWeight: '800', marginTop: 14, marginBottom: 7 }}>{t('BANNER IMAGE', 'صورة الإعلان', 'IMAGE DE LA BANNIÈRE')}</Text>
      <Pressable disabled={uploading} onPress={uploadBanner} style={{ backgroundColor: '#303943', borderColor: '#E9B85D', borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center', opacity: uploading ? 0.6 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>{uploading ? t('UPLOADING…', 'جارٍ الرفع…', 'TÉLÉVERSEMENT…') : t('UPLOAD BANNER FROM DEVICE', 'رفع صورة من الجهاز', 'TÉLÉVERSER UNE BANNIÈRE')}</Text>
      </Pressable>
      {imageUrl ? <Image source={{ uri: imageUrl }} resizeMode="contain" style={{ width: '100%', height: 150, marginTop: 10, borderRadius: 9, backgroundColor: '#252b32' }} /> : null}
      <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>{t('JPG, PNG or WebP · maximum 5 MB · 16:9 recommended', 'JPG أو PNG أو WebP · الحد الأقصى 5 ميغابايت · يفضل 16:9', 'JPG, PNG ou WebP · 5 Mo maximum · format 16:9 conseillé')}</Text>
      {field(t('Or paste an existing banner HTTPS URL', 'أو أدخل رابط صورة HTTPS', 'Ou collez une URL HTTPS existante'), imageUrl, setImageUrl, 'https://example.com/banner.jpg')}
      {field(t('Destination HTTPS URL', 'رابط الوجهة HTTPS', 'URL HTTPS de destination'), clickUrl, setClickUrl, 'https://company.com')}
      {field(t('Display duration (seconds, 1–300)', 'مدة العرض (بالثواني، 1–300)', 'Durée d’affichage (secondes, 1–300)'), displayDurationSeconds, setDisplayDurationSeconds, '6')}
      {field(t('Start date (YYYY-MM-DD)', 'تاريخ البداية', 'Date de début'), startsAt, setStartsAt, '2026-11-26')}
      {field(t('End date (YYYY-MM-DD)', 'تاريخ الانتهاء', 'Date de fin'), endsAt, setEndsAt, '2026-12-26')}
      <Pressable disabled={saving || uploading} onPress={save} style={{ backgroundColor: '#E9B85D', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 18, opacity: saving || uploading ? 0.6 : 1 }}><Text style={{ color: '#17110A', fontWeight: '900' }}>{saving ? t('SAVING…', 'جارٍ الحفظ…', 'ENREGISTREMENT…') : t('CREATE CAMPAIGN', 'إنشاء الحملة', 'CRÉER LA CAMPAGNE')}</Text></Pressable>
      <Text style={{ color: '#E9B85D', fontWeight: '900', marginTop: 26, marginBottom: 10 }}>{t('EXISTING CAMPAIGNS', 'الحملات الحالية', 'CAMPAGNES EXISTANTES')}</Text>
      {items.length === 0 ? <Text style={{ color: '#aaa' }}>{t('No campaigns yet.', 'لا توجد حملات بعد.', 'Aucune campagne pour le moment.')}</Text> : items.map(item => (
        <View key={item.id} style={{ backgroundColor: '#1b2229', borderColor: '#655235', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 9 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{item.advertiserName} · {item.countryCode}</Text>
          <Text style={{ color: '#bbb', marginTop: 4 }}>{item.startsAt.toLocaleDateString()} – {item.endsAt.toLocaleDateString()} · {item.displayDurationSeconds ?? 6}s</Text>
          <Text style={{ color: item.active ? '#7fd49b' : '#e2a66b', marginTop: 4 }}>{item.active ? t('ACTIVE', 'نشطة', 'ACTIVE') : t('INACTIVE', 'متوقفة', 'INACTIVE')}</Text>
          <Pressable onPress={() => toggle(item)} style={{ padding: 10, borderRadius: 8, backgroundColor: '#303943', marginTop: 9, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '800' }}>{item.active ? t('DEACTIVATE', 'إيقاف', 'DÉSACTIVER') : t('ACTIVATE', 'تفعيل', 'ACTIVER')}</Text></Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
