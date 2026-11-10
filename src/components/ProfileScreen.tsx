import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firestore';

type Props = {
  language: 'en' | 'ar' | 'fr';
  mode: 'professional' | 'homeowner';
  onSignOut: () => void;
};

const GOLD = '#E9B85D';

export default function ProfileScreen({
  language,
  mode,
  onSignOut,
}: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = (en: string, ar: string, fr: string) =>
    language === 'ar' ? ar : language === 'fr' ? fr : en;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setError(t(
            'No signed-in user found.',
            'لا يوجد مستخدم مسجل الدخول.',
            'Aucun utilisateur connecté.'
          ));
          return;
        }

        const snapshot = await getDoc(doc(db, 'users', user.uid));

        if (snapshot.exists()) {
          setProfile(snapshot.data());
        } else {
          setError(t(
            'Profile not found.',
            'لم يتم العثور على الملف الشخصي.',
            'Profil introuvable.'
          ));
        }
      } catch (e: any) {
        console.error('Profile loading error:', e);
        setError(e?.message || 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const createdAt = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString()
    : t('Not available', 'غير متوفر', 'Non disponible');

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>DANAT BUILD</Text>

      <Text style={styles.heading}>
        {t('My Profile', 'ملفي الشخصي', 'Mon profil')}
      </Text>

      {loading ? (
        <ActivityIndicator color={GOLD} size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.email}>{profile?.email}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              {t('ACCOUNT TYPE', 'نوع الحساب', 'TYPE DE COMPTE')}
            </Text>
            <Text style={styles.value}>
              {mode === 'professional'
                ? t('Professional', 'مهني', 'Professionnel')
                : t('Homeowner', 'صاحب منزل', 'Propriétaire')}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>
              {t('USER ID', 'رقم المستخدم', 'IDENTIFIANT')}
            </Text>
            <Text selectable style={styles.smallValue}>
              {auth.currentUser?.uid}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>
              {t('REGISTRATION DATE', 'تاريخ التسجيل', 'DATE D’INSCRIPTION')}
            </Text>
            <Text style={styles.value}>{createdAt}</Text>
          </View>

          <Text style={styles.note}>
            {t(
              'Subscription management will be available here.',
              'ستتوفر إدارة الاشتراك هنا.',
              'La gestion des abonnements sera disponible ici.'
            )}
          </Text>
        </>
      )}

      <Pressable style={styles.signOut} onPress={onSignOut}>
        <Text style={styles.signOutText}>
          {t('SIGN OUT', 'تسجيل الخروج', 'SE DÉCONNECTER')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B0E',
    padding: 22,
    alignItems: 'center',
  },
  brand: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 12,
  },
  heading: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 25,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#292319',
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: GOLD,
    fontSize: 34,
    fontWeight: '900',
  },
  email: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 25,
  },
  card: {
    width: '100%',
    backgroundColor: '#191e24',
    borderWidth: 1,
    borderColor: '#66553a',
    borderRadius: 16,
    padding: 18,
  },
  label: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    marginTop: 7,
  },
  smallValue: {
    color: '#ddd',
    fontSize: 11,
    marginTop: 7,
  },
  divider: {
    height: 1,
    backgroundColor: '#39352d',
    marginVertical: 16,
  },
  note: {
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: '#ff7777',
    textAlign: 'center',
  },
  signOut: {
    width: '100%',
    backgroundColor: '#292019',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  signOutText: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 13,
  },
});
