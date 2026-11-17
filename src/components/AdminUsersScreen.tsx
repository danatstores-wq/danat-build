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
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firestore';
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
    const exactEmail = email.trim();
    if (!exactEmail) {
      setError(t('Enter the user email address.', 'أدخل البريد الإلكتروني للمستخدم.', 'Saisissez l’adresse e-mail.'));
      return;
    }
    setLoading(true);
    setError('');
    setUser(null);
    try {
      // Firestore rules permit this directory query only to admin-token users.
      const matches = await getDocs(query(
        collection(db, 'users'),
        where('email', '==', exactEmail),
        limit(1),
      ));
      if (matches.empty) {
        throw new Error(t(
          'No Danat Build profile was found for this exact email. Ask the user to sign in once, then try again.',
          'لم يتم العثور على ملف بهذا البريد. اطلب من المستخدم تسجيل الدخول مرة واحدة ثم أعد المحاولة.',
          'Aucun profil trouvé pour cet e-mail exact. Demandez à l’utilisateur de se connecter une fois, puis réessayez.',
        ));
      }

      const profile = matches.docs[0];
      const uid = profile.id;
      const entitlementSnapshot = await getDoc(doc(db, 'entitlements', uid));
      const data = entitlementSnapshot.data();
      const hasOverride = data?.adminOverride === true;
      const expiry = typeof data?.expiresAt?.toMillis === 'function'
        ? data.expiresAt.toMillis()
        : null;
      const isProfessional = hasOverride
        ? data?.adminStatus === 'professional'
        : data?.status === 'active' && typeof expiry === 'number' && expiry > Date.now();

      setUser({
        uid,
        email: String(profile.data().email || exactEmail),
        access: isProfessional ? 'professional' : 'free',
        source: hasOverride ? 'admin' : (data?.source || 'subscription'),
        expiresAt: hasOverride ? null : expiry,
      });
    } catch (e: any) {
      setError(e?.message || t('Could not find this user.', 'تعذر العثور على المستخدم.', 'Utilisateur introuvable.'));
    } finally {
      setLoading(false);
    }
  };

  const changeAccess = (access: Access) => {
    if (!user || user.access === access) return;
    if (user.uid === auth.currentUser?.uid) {
      setError(t(
        'For safety, use another administrator account to change your own access.',
        'لأسباب أمنية، استخدم حساب مدير آخر لتغيير صلاحية حسابك.',
        'Pour votre sécurité, utilisez un autre compte administrateur pour modifier votre propre accès.',
      ));
      return;
    }
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
              const adminUid = auth.currentUser?.uid;
              if (!adminUid) throw new Error('Administrator sign-in is required.');
              const now = serverTimestamp();
              await setDoc(doc(db, 'entitlements', user.uid), {
                adminOverride: true,
                adminStatus: access,
                status: access === 'professional' ? 'active' : 'revoked',
                expiresAt: access === 'professional' ? new Date('9999-12-31T23:59:59.000Z') : null,
                source: 'admin',
                platform: 'admin',
                productId: null,
                adminUpdatedBy: adminUid,
                adminUpdatedAt: now,
              }, { merge: true });
              await addDoc(collection(db, 'adminAccessChanges'), {
                targetUid: user.uid,
                changedBy: adminUid,
                access,
                changedAt: now,
              });
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
      <Text style={styles.brand}>DANAT BUILD</Text>
      <Text style={styles.heading}>{t('Admin Users', 'إدارة المستخدمين', 'Gestion des utilisateurs')}</Text>
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
  brand: { color: GOLD, fontSize: 13, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginTop: 10 },
  heading: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 18, marginBottom: 16 },
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
