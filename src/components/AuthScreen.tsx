import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
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

export default function AuthScreen({ language, theme, onAuthenticated }: Props) {
  const ui = getThemedStyles(styles, theme);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await ensureUserProfile(credential.user);
        onAuthenticated();

      } else if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await ensureUserProfile(credential.user);
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
        <TextInput
          style={ui.input}
          placeholder={t(
            'Password (minimum 6 characters)',
            'كلمة المرور (6 أحرف على الأقل)',
            'Mot de passe (6 caractères minimum)'
          )}
          placeholderTextColor="#92979d"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
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
