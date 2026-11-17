import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';

// Firebase's React Native runtime exports this API, but some Firebase SDK type
// entrypoints omit it from their declarations.
const getReactNativePersistence = (FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
}).getReactNativePersistence;
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firestore';
import { getThemedStyles } from '../theme';

type Props = {
  language: 'en' | 'ar' | 'fr';
  onAuthenticated: () => void;
  theme: 'dark' | 'light';
};

type AuthMode = 'login' | 'register' | 'forgot';

const GOLD = '#E9B85D';

async function ensureUserProfile(user: {
  uid: string;
  email: string | null;
}) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}


async function ensureUserProfileBestEffort(user: { uid: string; email: string | null }) {
  try {
    await ensureUserProfile(user);
  } catch (error: any) {
    // Authentication must not be blocked by a profile/rules deployment issue.
    console.warn('User profile could not be saved yet:', error?.code, error?.message);
  }
}

export default function AuthScreen({ language, theme, onAuthenticated }: Props) {
  const ui = getThemedStyles(styles, theme);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('danatBuildRememberMe').then(value => {
      if (value !== null) setRememberMe(value === 'true');
    }).catch(error => console.warn('Could not load remember-me preference:', error));
  }, []);

  const updateRememberMe = (value: boolean) => {
    setRememberMe(value);
    AsyncStorage.setItem('danatBuildRememberMe', value ? 'true' : 'false')
      .catch(error => console.warn('Could not save remember-me preference:', error));
  };

  const applyAuthPersistence = async () => {
    const persistence = Platform.OS === 'web'
      ? (rememberMe ? browserLocalPersistence : browserSessionPersistence)
      : (rememberMe ? getReactNativePersistence(AsyncStorage) : inMemoryPersistence);
    await setPersistence(auth, persistence);
  };

  const t = (en: string, ar: string, fr: string) =>
    language === 'ar' ? ar : language === 'fr' ? fr : en;

  const submit = async () => {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError(t(
        'Enter your email address.',
        'أدخل بريدك الإلكتروني.',
        'Saisissez votre adresse e-mail.'
      ));
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setError(t(
        'Password must contain at least 6 characters.',
        'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
        'Le mot de passe doit contenir au moins 6 caractères.'
      ));
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await applyAuthPersistence();
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await sendEmailVerification(credential.user);
        await ensureUserProfileBestEffort(credential.user);
        setVerificationPending(true);
        setMessage(t(
          'Verification email sent. Open the link in your inbox, then return here and confirm.',
          'تم إرسال رسالة التحقق. افتح الرابط في بريدك ثم عد إلى هنا للتأكيد.',
          'E-mail de vérification envoyé. Ouvrez le lien reçu, puis revenez ici pour confirmer.'
        ));

      } else if (mode === 'login') {
        await applyAuthPersistence();
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        if (!credential.user.emailVerified) {
          // Keep existing accounts usable even if Firebase cannot deliver the
          // legacy verification email. Verification can be completed later.
          try {
            await sendEmailVerification(credential.user);
          } catch (verificationError: any) {
            console.warn('Verification email resend failed:', verificationError?.code, verificationError?.message);
          }
        }

        await ensureUserProfileBestEffort(credential.user);
        onAuthenticated();

      } else {
        await sendPasswordResetEmail(auth, email.trim());

        setMessage(t(
          'Password reset email sent. Check your inbox.',
          'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.',
          'E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception.'
        ));
      }
    } catch (e: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': t(
          'This email is already registered.',
          'هذا البريد مسجل بالفعل.',
          'Cette adresse e-mail est déjà inscrite.'
        ),
        'auth/invalid-email': t(
          'Invalid email address.',
          'البريد الإلكتروني غير صالح.',
          'Adresse e-mail invalide.'
        ),
        'auth/weak-password': t(
          'Choose a stronger password.',
          'اختر كلمة مرور أقوى.',
          'Choisissez un mot de passe plus fort.'
        ),
        'auth/invalid-credential': t(
          'Incorrect email or password.',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
          'E-mail ou mot de passe incorrect.'
        ),
        'auth/user-not-found': t(
          'Account not found.',
          'الحساب غير موجود.',
          'Compte introuvable.'
        ),
        'auth/wrong-password': t(
          'Incorrect password.',
          'كلمة المرور غير صحيحة.',
          'Mot de passe incorrect.'
        ),
        'auth/too-many-requests': t(
          'Too many attempts. Try again later.',
          'محاولات كثيرة. حاول لاحقاً.',
          'Trop de tentatives. Réessayez plus tard.'
        ),
        'permission-denied': t(
          'Your profile could not be saved. Check Firestore security rules.',
          'تعذر حفظ ملفك الشخصي. تحقق من قواعد أمان Firestore.',
          'Impossible d’enregistrer votre profil. Vérifiez les règles Firestore.'
        ),
      };

      console.error(
        'Authentication or Firestore error:',
        e?.code,
        e?.message
      );

      setError(
        messages[e?.code] ||
        `${e?.code || 'unknown'}: ${e?.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError(t(
        'Please sign in again to resend the verification email.',
        'يرجى تسجيل الدخول مجدداً لإعادة إرسال رسالة التحقق.',
        'Reconnectez-vous pour renvoyer l’e-mail de vérification.'
      ));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendEmailVerification(user);
      setMessage(t(
        'A new verification email has been sent. Check your inbox and spam folder.',
        'تم إرسال رسالة تحقق جديدة. تحقق من الوارد والبريد غير المرغوب فيه.',
        'Un nouvel e-mail de vérification a été envoyé. Vérifiez votre boîte de réception et les courriers indésirables.'
      ));
    } catch (e: any) {
      setError(e?.message || t('Could not send the verification email.', 'تعذر إرسال رسالة التحقق.', 'Impossible d’envoyer l’e-mail de vérification.'));
    } finally {
      setLoading(false);
    }
  };

  const confirmVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await reload(user);
      if (user.emailVerified) {
        await ensureUserProfileBestEffort(user);
        onAuthenticated();
      } else {
        setMessage(t(
          'We have not detected verification yet. Open the link in your email, then try again.',
          'لم نكتشف إتمام التحقق بعد. افتح الرابط في بريدك ثم حاول مجدداً.',
          'La vérification n’a pas encore été détectée. Ouvrez le lien reçu, puis réessayez.'
        ));
      }
    } catch (e: any) {
      setError(e?.message || t('Could not check verification status.', 'تعذر التحقق من الحالة.', 'Impossible de vérifier le statut.'));
    } finally {
      setLoading(false);
    }
  };

  if (verificationPending) {
    return (
      <View style={ui.container}>
        <Text style={ui.brand}>DANAT BUILD</Text>
        <Text style={ui.heading}>
          {t('Verify your email', 'تحقق من بريدك الإلكتروني', 'Vérifiez votre e-mail')}
        </Text>
        <Text style={ui.subtitle}>
          {t(
            'We sent a verification link to your email address. You must verify it before entering Danat Build.',
            'أرسلنا رابط تحقق إلى بريدك الإلكتروني. يجب تأكيده قبل الدخول إلى Danat Build.',
            'Nous avons envoyé un lien de vérification. Vous devez confirmer votre adresse avant d’accéder à Danat Build.'
          )}
        </Text>
        {!!message && <Text style={ui.success}>{message}</Text>}
        {!!error && <Text style={ui.error}>{error}</Text>}
        <Pressable
          style={[ui.button, loading && ui.disabled]}
          onPress={confirmVerification}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#17110a" />
            : <Text style={ui.buttonText}>
                {t('I HAVE VERIFIED MY EMAIL', 'تحققت من بريدي الإلكتروني', 'J’AI VÉRIFIÉ MON E-MAIL')}
              </Text>}
        </Pressable>
        <Pressable onPress={resendVerification} disabled={loading}>
          <Text style={ui.link}>
            {t('Resend verification email', 'إعادة إرسال رسالة التحقق', 'Renvoyer l’e-mail de vérification')}
          </Text>
        </Pressable>
        <Pressable onPress={async () => {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
          setVerificationPending(false);
          setMode('login');
          setMessage('');
          setError('');
        }}>
          <Text style={ui.link}>
            {t('Back to sign in', 'العودة لتسجيل الدخول', 'Retour à la connexion')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const heading = mode === 'register'
    ? t('Create Account', 'إنشاء حساب', 'Créer un compte')
    : mode === 'forgot'
    ? t('Reset Password', 'إعادة تعيين كلمة المرور', 'Réinitialiser le mot de passe')
    : t('Welcome Back', 'مرحباً بعودتك', 'Bon retour');

  return (
    <View style={ui.container}>
      <Text style={ui.brand}>DANAT BUILD</Text>
      <Text style={ui.heading}>{heading}</Text>

      <Text style={ui.subtitle}>
        {mode === 'register'
          ? t(
              'Create your account to get started.',
              'أنشئ حسابك للبدء.',
              'Créez votre compte pour commencer.'
            )
          : mode === 'forgot'
          ? t(
              'Enter your email to receive a reset link.',
              'أدخل بريدك لاستلام رابط إعادة التعيين.',
              'Saisissez votre e-mail pour recevoir un lien.'
            )
          : t(
              'Sign in to continue.',
              'سجل الدخول للمتابعة.',
              'Connectez-vous pour continuer.'
            )}
      </Text>

      <TextInput
        style={ui.input}
        placeholder={t('Email address', 'البريد الإلكتروني', 'Adresse e-mail')}
        placeholderTextColor="#92979d"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {mode !== 'forgot' && (
        <View>
          <TextInput
            style={[ui.input, ui.passwordInput]}
            placeholder={t(
              'Password (minimum 6 characters)',
              'كلمة المرور (6 أحرف على الأقل)',
              'Mot de passe (6 caractères minimum)'
            )}
            placeholderTextColor="#92979d"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable
            style={ui.passwordToggle}
            onPress={() => setShowPassword((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={showPassword
              ? t('Hide password', 'إخفاء كلمة المرور', 'Masquer le mot de passe')
              : t('Show password', 'إظهار كلمة المرور', 'Afficher le mot de passe')}
          >
            <Text style={ui.passwordToggleText}>
              {showPassword
                ? t('HIDE', 'إخفاء', 'MASQUER')
                : t('SHOW', 'إظهار', 'AFFICHER')}
            </Text>
          </Pressable>
        </View>
      )}

      {mode === 'login' && (
        <Pressable
          onPress={() => updateRememberMe(!rememberMe)}
          style={ui.rememberRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
        >
          <View style={[ui.rememberBox, rememberMe && ui.rememberBoxChecked]}>
            {rememberMe && <Text style={ui.rememberTick}>✓</Text>}
          </View>
          <View style={ui.rememberCopy}>
            <Text style={ui.rememberLabel}>
              {t('Remember me on this device', 'تذكرني على هذا الجهاز', 'Se souvenir de moi sur cet appareil')}
            </Text>
            <Text style={ui.rememberHint}>
              {t('Keep me signed in. Your password is never stored by the app.', 'ابقني مسجلاً للدخول. لا يحفظ التطبيق كلمة مرورك.', 'Rester connecté. Votre mot de passe n’est jamais enregistré par l’application.')}
            </Text>
          </View>
        </Pressable>
      )}

      {!!error && <Text style={ui.error}>{error}</Text>}
      {!!message && <Text style={ui.success}>{message}</Text>}

      <Pressable
        style={[ui.button, loading && ui.disabled]}
        onPress={submit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#17110a" />
          : <Text style={ui.buttonText}>
              {mode === 'register'
                ? t('CREATE ACCOUNT', 'إنشاء الحساب', 'CRÉER UN COMPTE')
                : mode === 'forgot'
                ? t('SEND RESET LINK', 'إرسال رابط التعيين', 'ENVOYER LE LIEN')
                : t('SIGN IN', 'تسجيل الدخول', 'SE CONNECTER')}
            </Text>}
      </Pressable>

      {mode === 'login' && (
        <Pressable onPress={() => {
          setMode('forgot');
          setError('');
          setMessage('');
        }}>
          <Text style={ui.link}>
            {t('Forgot password?', 'نسيت كلمة المرور؟', 'Mot de passe oublié ?')}
          </Text>
        </Pressable>
      )}

      {mode !== 'forgot' ? (
        <Pressable onPress={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError('');
          setMessage('');
        }}>
          <Text style={ui.link}>
            {mode === 'login'
              ? t(
                  "Don't have an account? Register",
                  'ليس لديك حساب؟ أنشئ حساباً',
                  'Pas de compte ? Inscrivez-vous'
                )
              : t(
                  'Already have an account? Sign in',
                  'لديك حساب بالفعل؟ سجل الدخول',
                  'Déjà un compte ? Connectez-vous'
                )}
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => {
          setMode('login');
          setError('');
          setMessage('');
        }}>
          <Text style={ui.link}>
            {t('Back to sign in', 'العودة لتسجيل الدخول', 'Retour à la connexion')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#11161c',
    borderWidth: 1,
    borderColor: '#66553a',
    borderRadius: 18,
    padding: 22,
    marginTop: 12,
  },
  brand: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  heading: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 22,
  },
  subtitle: {
    color: '#b7bbc0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 22,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2, marginBottom: 10, gap: 10 },
  rememberBox: { width: 19, height: 19, borderRadius: 5, borderWidth: 1.5, borderColor: '#8b795b', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  rememberBoxChecked: { backgroundColor: GOLD, borderColor: GOLD },
  rememberTick: { color: '#17110a', fontSize: 14, fontWeight: '900', lineHeight: 17 },
  rememberCopy: { flex: 1 },
  rememberLabel: { color: '#f0e7d7', fontSize: 12, fontWeight: '800' },
  rememberHint: { color: '#92979d', fontSize: 10, marginTop: 3, lineHeight: 15 },
  input: {
    backgroundColor: '#080b0e',
    borderWidth: 1,
    borderColor: '#514b40',
    borderRadius: 11,
    padding: 15,
    color: '#fff',
    fontSize: 14,
    marginBottom: 13,
  },
  passwordInput: {
    paddingRight: 88,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 15,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  passwordToggleText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: GOLD,
    borderRadius: 11,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.6 },
  buttonText: {
    color: '#17110a',
    fontSize: 13,
    fontWeight: '900',
  },
  link: {
    color: GOLD,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    fontWeight: '700',
  },
  error: { color: '#ff7777', fontSize: 12, marginBottom: 12 },
  success: { color: '#75d69b', fontSize: 12, marginBottom: 12 },
});
