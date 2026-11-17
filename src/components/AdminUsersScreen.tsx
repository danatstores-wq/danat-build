import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase';
import { getThemedStyles } from '../theme';

type Language = 'en' | 'ar' | 'fr';
type Access = 'free' | 'professional';
type UserResult = {
  uid: string;
  email: string;
  access: Access;
  source: string;
  expiresAt: number | null;
};

type Props = {
  language: Language;
  theme: 'dark' | 'light';
  onBack: () => void;
};

const GOLD = '#E9B85D';
const functions = getFunctions(app, 'us-central1');
const lookupAdminUser = httpsCallable<{ email: string }, UserResult>(functions, 'adminLookupUser');
const setAdminUserAccess = httpsCallable<{ uid: string; access: Access }, { success: boolean }>(functions, 'adminSetUserAccess');

export default function AdminUsersScreen({ language, theme, onBack }: Props) {
  const ui = getThemedStyles(styles, theme);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const t = (en: string, ar: string, fr: string) =>
    language === 'ar' ? ar : language === 'fr' ? fr : en;

  const search = async () => {
    if (!email.trim()) {
      setError(t('Enter the user email address.', 'أدخل البريد الإلكتروني للمستخدم.', 'Saisissez l’adresse e-mail.'));
      return;
    }
    setLoading(true);
    setError('');
    setUser(null);
    try {
      const result = await lookupAdminUser({ email: email.trim() });
      setUser(result.data);
    } catch (e: any) {
      setError(e?.message || t('Could not find this user.', 'تعذر العثور على المستخدم.', 'Utilisateur introuvable.'));
    } finally {
      setLoading(false);
    }
  };

  const changeAccess = (access: Access) => {
    if (!user || user.access === access) return;
    const label = access === 'professional'
      ? t('Professional', 'محترف', 'Professionnel')
      : t('Free / Homeowner', 'مجاني / مالك منزل', 'Gratuit / Propriétaire');
    Alert.alert(
      t('Confirm account change', 'تأكيد تغيير الحساب', 'Confirmer le changement'),
      t(`Change ${user.email} to ${label}?`, `هل تريد تغيير ${user.email} إلى ${label}؟`, `Passer ${user.email} à ${label} ?`),
      [
        { text: t('Cancel', 'إلغاء', 'Annuler'), style: 'cancel' },
        {
          text: t('Confirm', 'تأكيد', 'Confirmer'),
          onPress: async () => {
            setSaving(true);
            setError('');
            try {
              await setAdminUserAccess({ uid: user.uid, access });
              setUser({ ...user, access, source: 'admin', expiresAt: null });
            } catch (e: any) {
              setError(e?.message || t('Could not update account access.', 'تعذر تحديث صلاحية الحساب.', 'Impossible de modifier l’accès.'));
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={ui.container}>
      <Text style={ui.brand}>DANAT BUILD</Text>
      <Text style={ui.heading}>{t('Admin Users', 'إدارة المستخدمين', 'Gestion des utilisateurs')}</Text>
      <Text style={styles.help}>{t('Search by the exact email address, then change the account access.', 'ابحث باستخدام البريد الإلكتروني ثم غيّر صلاحية الحساب.', 'Recherchez par adresse e-mail puis modifiez l’accès.')}</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t('User email address', 'البريد الإلكتروني للمستخدم', 'E-mail de l’utilisateur')}
        placeholderTextColor="#92979d"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={search}
      />
      <Pressable style={styles.primaryButton} onPress={search} disabled={loading || saving}>
        {loading ? <ActivityIndicator color="#17110a" /> : <Text style={styles.primaryText}>{t('SEARCH USER', 'بحث عن المستخدم', 'RECHERCHER')}</Text>}
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {user && (
        <View style={styles.userCard}>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.meta}>{t('Account access', 'صلاحية الحساب', 'Accès au compte')}: <Text style={styles.status}>{user.access === 'professional' ? 'PROFESSIONAL' : 'FREE / HOMEOWNER'}</Text></Text>
          <Text style={styles.meta}>{t('Access control', 'مصدر الصلاحية', 'Contrôle d’accès')}: {user.source === 'admin' ? t('Manual admin control', 'تحكم يدوي من المدير', 'Contrôle manuel admin') : t('Store subscription', 'اشتراك المتجر', 'Abonnement boutique')}</Text>
          {user.expiresAt ? <Text style={styles.meta}>{t('Subscription expiry', 'انتهاء الاشتراك', 'Expiration')}: {new Date(user.expiresAt).toLocaleDateString()}</Text> : null}
          <Text selectable style={styles.uid}>UID: {user.uid}</Text>

          <Pressable style={[styles.accessButton, user.access === 'professional' && styles.disabled]} onPress={() => changeAccess('professional')} disabled={saving || user.access === 'professional'}>
            {saving ? <ActivityIndicator color="#17110a" /> : <Text style={styles.primaryText}>{t('GRANT PROFESSIONAL ACCESS', 'منح صلاحية المحترف', 'ACCORDER L’ACCÈS PROFESSIONNEL')}</Text>}
          </Pressable>
          <Pressable style={[styles.freeButton, user.access === 'free' && styles.disabled]} onPress={() => changeAccess('free')} disabled={saving || user.access === 'free'}>
            <Text style={styles.freeText}>{t('CHANGE TO FREE / HOMEOWNER', 'تغيير إلى مجاني / مالك منزل', 'PASSER À GRATUIT / PROPRIÉTAIRE')}</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.freeText}>{t('BACK', 'رجوع', 'RETOUR')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  help: { color: '#b7bbc0', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 18 },
  input: { backgroundColor: '#080b0e', borderWidth: 1, borderColor: '#66553a', borderRadius: 11, padding: 14, color: '#fff', marginBottom: 12 },
  primaryButton: { backgroundColor: GOLD, borderRadius: 11, padding: 15, alignItems: 'center' },
  primaryText: { color: '#17110a', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  error: { color: '#ff7777', marginTop: 12, textAlign: 'center' },
  userCard: { backgroundColor: '#191e24', borderWidth: 1, borderColor: '#66553a', borderRadius: 15, padding: 16, marginTop: 22 },
  email: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  meta: { color: '#c5c8cc', fontSize: 12, marginBottom: 9 },
  status: { color: GOLD, fontWeight: '900' },
  uid: { color: '#92979d', fontSize: 10, marginTop: 5, marginBottom: 16 },
  accessButton: { backgroundColor: GOLD, borderRadius: 10, padding: 14, marginTop: 5 },
  freeButton: { borderColor: GOLD, borderWidth: 1, borderRadius: 10, padding: 14, marginTop: 10 },
  freeText: { color: GOLD, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  backButton: { padding: 16, marginTop: 16 },
});
