import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pendingChange, setPendingChange] = useState<{ target: UserResult; access: Access } | null>(null);

  const t = (en: string, ar: string, fr: string) =>
    language === 'ar' ? ar : language === 'fr' ? fr : en;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Admin Firestore rules allow this directory read. Each entitlement is read
      // separately so every user's current subscription/manual override is shown.
      const profiles = await getDocs(query(collection(db, 'users'), limit(200)));
      const rows = await Promise.all(profiles.docs.map(async (profile) => {
        const uid = profile.id;
        const profileData = profile.data();
        const entitlementSnapshot = await getDoc(doc(db, 'entitlements', uid));
        const data = entitlementSnapshot.data();
        const hasOverride = data?.adminOverride === true;
        const expiry = typeof data?.expiresAt?.toMillis === 'function'
          ? data.expiresAt.toMillis()
          : null;
        const isProfessional = hasOverride
          ? data?.adminStatus === 'professional'
          : data?.status === 'active' && typeof expiry === 'number' && expiry > Date.now();
        return {
          uid,
          email: String(profileData.email || '(email unavailable)'),
          access: isProfessional ? 'professional' as Access : 'free' as Access,
          source: hasOverride ? 'admin' : String(data?.source || 'subscription'),
          expiresAt: hasOverride ? null : expiry,
        };
      }));
      rows.sort((a, b) => a.email.localeCompare(b.email));
      setUsers(rows);
    } catch (e: any) {
      setError(e?.message || t('Could not load users. Check that the latest Firestore rules are published.', 'تعذر تحميل المستخدمين. تحقق من نشر أحدث قواعد Firestore.', 'Impossible de charger les utilisateurs. Vérifiez les règles Firestore.'));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const value = filter.trim().toLowerCase();
    return value
      ? users.filter((item) => item.email.toLowerCase().includes(value) || item.uid.toLowerCase().includes(value))
      : users;
  }, [filter, users]);

  const changeAccess = (target: UserResult, access: Access) => {
    if (target.access === access || savingUid !== null) return;
    setPendingChange({ target, access });
  };

  const confirmAccessChange = async () => {
    if (!pendingChange) return;
    const { target, access } = pendingChange;
    setPendingChange(null);
    setSavingUid(target.uid);
    setError('');
    try {
      const adminUid = auth.currentUser?.uid;
      if (!adminUid) throw new Error('Administrator sign-in is required.');
      const now = serverTimestamp();
      await setDoc(doc(db, 'entitlements', target.uid), {
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
        targetUid: target.uid,
        changedBy: adminUid,
        access,
        changedAt: now,
      });
      setUsers((current) => current.map((item) => item.uid === target.uid
        ? { ...item, access, source: 'admin', expiresAt: null }
        : item));
    } catch (e: any) {
      setError(e?.message || t('Could not update account access.', 'تعذر تحديث صلاحية الحساب.', 'Impossible de modifier l’accès.'));
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <View style={ui.container}>
      <Text style={styles.brand}>DANAT BUILD</Text>
      <Text style={styles.heading}>{t('Admin Users', 'إدارة المستخدمين', 'Gestion des utilisateurs')}</Text>
      <Text style={styles.help}>{t('All registered users and their current access are shown below. You can manage your own account too.', 'تظهر أدناه جميع الحسابات المسجلة وصلاحية كل منها. يمكنك إدارة حسابك أيضاً.', 'Tous les utilisateurs et leur accès actuel sont affichés ci-dessous. Vous pouvez aussi gérer votre propre compte.')}</Text>

      <TextInput
        style={styles.input}
        value={filter}
        onChangeText={setFilter}
        placeholder={t('Filter by email or UID', 'تصفية حسب البريد أو UID', 'Filtrer par e-mail ou UID')}
        placeholderTextColor="#92979d"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.toolbar}>
        <Text style={styles.count}>{t('Users', 'المستخدمون', 'Utilisateurs')}: {visibleUsers.length} / {users.length}</Text>
        <Pressable style={styles.refreshButton} onPress={loadUsers} disabled={loading || savingUid !== null}>
          <Text style={styles.freeText}>{t('REFRESH', 'تحديث', 'ACTUALISER')}</Text>
        </Pressable>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {pendingChange ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{t('Confirm account change', 'تأكيد تغيير الحساب', 'Confirmer le changement')}</Text>
            <Text style={styles.confirmMessage}>
              {t(
                `Change ${pendingChange.target.email} to ${pendingChange.access === 'professional' ? 'Professional' : 'Free / Homeowner'}?`,
                `هل تريد تغيير ${pendingChange.target.email}؟`,
                `Modifier l’accès de ${pendingChange.target.email} ?`
              )}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.freeButton} onPress={() => setPendingChange(null)}>
                <Text style={styles.freeText}>{t('CANCEL', 'إلغاء', 'ANNULER')}</Text>
              </Pressable>
              <Pressable style={styles.accessButton} onPress={confirmAccessChange}>
                <Text style={styles.primaryText}>{t('CONFIRM', 'تأكيد', 'CONFIRMER')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
      {loading ? <ActivityIndicator color={GOLD} style={{ marginTop: 24 }} /> : null}
      {!loading && users.length === 0 && !error
        ? <Text style={styles.help}>{t('No registered user profiles found yet.', 'لا توجد حسابات مسجلة بعد.', 'Aucun profil utilisateur trouvé.')}</Text>
        : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {visibleUsers.map((item) => {
          const isSelf = item.uid === auth.currentUser?.uid;
          const saving = savingUid === item.uid;
          return (
            <View key={item.uid} style={styles.userCard}>
              <View style={styles.userHeader}>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={[styles.statusBadge, item.access === 'professional' ? styles.professionalBadge : styles.freeBadge]}>
                  {item.access === 'professional' ? 'PROFESSIONAL' : 'FREE / HOMEOWNER'}
                </Text>
              </View>
              <Text style={styles.meta}>{t('Access control', 'مصدر الصلاحية', 'Contrôle d’accès')}: {item.source === 'admin' ? t('Manual admin control', 'تحكم يدوي من المدير', 'Contrôle manuel admin') : t('Store subscription', 'اشتراك المتجر', 'Abonnement boutique')}</Text>
              {isSelf ? <Text style={styles.selfLabel}>{t('YOUR ADMIN ACCOUNT', 'حساب المدير الخاص بك', 'VOTRE COMPTE ADMIN')}</Text> : null}
              <Text selectable style={styles.uid}>UID: {item.uid}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.accessButton, item.access === 'professional' && styles.disabled]}
                  onPress={() => changeAccess(item, 'professional')}
                  disabled={saving || item.access === 'professional'}
                >
                  {saving ? <ActivityIndicator color="#17110a" /> : <Text style={styles.primaryText}>{t('GRANT PROFESSIONAL', 'منح المحترف', 'ACCORDER PRO')}</Text>}
                </Pressable>
                <Pressable
                  style={[styles.freeButton, item.access === 'free' && styles.disabled]}
                  onPress={() => changeAccess(item, 'free')}
                  disabled={saving || item.access === 'free'}
                >
                  <Text style={styles.freeText}>{t('SET FREE', 'تعيين مجاني', 'PASSER GRATUIT')}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.freeText}>{t('BACK', 'رجوع', 'RETOUR')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmOverlay: { position: 'absolute', zIndex: 1000, elevation: 20, top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmCard: { width: '100%', maxWidth: 420, backgroundColor: '#191e24', borderWidth: 1, borderColor: GOLD, borderRadius: 14, padding: 20 },
  confirmTitle: { color: GOLD, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  confirmMessage: { color: '#fff', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 18 },
  container: { flex: 1, padding: 18 },
  brand: { color: GOLD, fontSize: 13, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginTop: 10 },
  heading: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 18, marginBottom: 12 },
  help: { color: '#b7bbc0', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 14 },
  input: { backgroundColor: '#080b0e', borderWidth: 1, borderColor: '#66553a', borderRadius: 11, padding: 14, color: '#fff', marginBottom: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  count: { color: '#c5c8cc', fontSize: 12 },
  refreshButton: { borderColor: GOLD, borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  error: { color: '#ff7777', marginTop: 10, textAlign: 'center' },
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  userCard: { backgroundColor: '#191e24', borderWidth: 1, borderColor: '#66553a', borderRadius: 13, padding: 14, marginTop: 10 },
  userHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  email: { color: '#fff', fontSize: 14, fontWeight: '800', flexShrink: 1 },
  statusBadge: { fontSize: 10, fontWeight: '900', overflow: 'hidden', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8 },
  professionalBadge: { color: '#17110a', backgroundColor: GOLD },
  freeBadge: { color: '#d5d8dc', backgroundColor: '#414850' },
  meta: { color: '#c5c8cc', fontSize: 11, marginBottom: 7 },
  selfLabel: { color: GOLD, fontSize: 10, fontWeight: '900', marginBottom: 6 },
  uid: { color: '#92979d', fontSize: 9, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  accessButton: { flex: 1, backgroundColor: GOLD, borderRadius: 9, padding: 12, alignItems: 'center' },
  primaryText: { color: '#17110a', fontSize: 10, fontWeight: '900', textAlign: 'center' },
  freeButton: { flex: 1, borderColor: GOLD, borderWidth: 1, borderRadius: 9, padding: 12, alignItems: 'center' },
  freeText: { color: GOLD, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  backButton: { padding: 14, marginTop: 6 },
});
