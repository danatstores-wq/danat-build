import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  ImageStyle,
  Linking,
} from 'react-native';

import CalculatorScreen from './src/components/CalculatorScreen';
import BuildingCalculatorScreen from './src/components/BuildingCalculatorScreen';
import AuthScreen from './src/components/AuthScreen';
import ProfileScreen from './src/components/ProfileScreen';
import AdBanner from './src/components/AdBanner';
import AdInterstitial from './src/components/AdInterstitial';
import AdPrivacyOptionsButton from './src/components/AdPrivacyOptionsButton';
import MyProjectsScreen from './src/components/MyProjectsScreen';
import MeasurementsToolScreen from './src/components/MeasurementsToolScreen';
import AdvertiserAdminScreen from './src/components/AdvertiserAdminScreen';
import { SavedCalculation } from './src/storage/localProjects';
import { AppTheme, getThemedStyles } from './src/theme';
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/firebase';

type Language = 'en' | 'ar' | 'fr';
type Screen = 'welcome' | 'auth' | 'home' | 'calculator' | 'building' | 'measurements' | 'measurementTool' | 'favorites' | 'menu' | 'profile' | 'about' | 'guide' | 'settings' | 'projects' | 'contact' | 'advertisers';
type Mode = 'professional' | 'homeowner';

type Tool = {
  id: string;
  en: string;
  ar: string;
  fr: string;
  icon: string;
  desc: string;
};

const measurementTools = [
  { id: 'ar-distance', icon: '📏', en: 'AR Distance Measurement', ar: 'قياس المسافة بالواقع المعزز', fr: 'Mesure de distance AR', desc: 'Measure a walking path with a live camera line.', descAr: 'قس مسار الحركة بخط مباشر عبر الكاميرا.', descFr: 'Mesurez un trajet avec une ligne en direct.' },
  { id: 'ar-room', icon: '🏠', en: 'AR Room Measurement', ar: 'قياس الغرف بالواقع المعزز', fr: 'Mesure de pièce AR', desc: 'Measure room dimensions, floor area and volume.', descAr: 'قس أبعاد الغرفة ومساحة الأرضية والحجم.', descFr: 'Mesurez les dimensions, la surface et le volume.' },
  { id: 'angle-slope', icon: '📐', en: 'Angle & Slope Measurement', ar: 'قياس الزوايا والانحدار', fr: 'Mesure des angles et pentes', desc: 'Check angles, inclinations and gradients.', descAr: 'افحص الزوايا والميل والانحدارات.', descFr: 'Vérifiez les angles, inclinaisons et pentes.' },
  { id: 'spirit-level', icon: '⚖️', en: 'Digital Spirit Level', ar: 'ميزان الماء الرقمي', fr: 'Niveau à bulle numérique', desc: 'Check whether a surface is level or vertical.', descAr: 'تحقق من استواء السطح أو عموديته.', descFr: 'Vérifiez si une surface est horizontale ou verticale.' },
  { id: 'height', icon: '📏', en: 'Height Measurement', ar: 'قياس الارتفاع', fr: 'Mesure de hauteur', desc: 'Measure wall, ceiling and object heights with supported AR.', descAr: 'قس ارتفاع الجدران والأسقف والأجسام باستخدام AR المدعوم.', descFr: 'Mesurez les murs, plafonds et objets avec AR compatible.' },
  { id: 'area-perimeter', icon: '⬛', en: 'Area & Perimeter Measurement', ar: 'قياس المساحة والمحيط', fr: 'Mesure de surface et périmètre', desc: 'Mark boundary points to calculate area and perimeter.', descAr: 'حدد نقاط الحدود لحساب المساحة والمحيط.', descFr: 'Marquez les limites pour calculer la surface et le périmètre.' },
];

const GOLD = '#E9B85D';
const BG = '#080B0E';

const tools: Tool[] = [
  {
    id: 'concrete',
    en: 'Concrete',
    ar: 'حساب الباطون',
    fr: 'Béton',
    icon: '🏗️',
    desc: 'Volume and wastage',
  },
  {
    id: 'tiles',
    en: 'Tiles & Ceramics',
    ar: 'السيراميك والبلاط',
    fr: 'Carrelage',
    icon: '🔶',
    desc: 'Floor and wall coverage',
  },
  {
    id: 'paint',
    en: 'Paint',
    ar: 'الدهان',
    fr: 'Peinture',
    icon: '🖌️',
    desc: 'Paint quantity estimate',
  },
  {
    id: 'blocks',
    en: 'Blocks & Bricks',
    ar: 'البلوك والطوب',
    fr: 'Blocs & briques',
    icon: '🧱',
    desc: 'Wall material quantities',
  },
  {
    id: 'sand',
    en: 'Sand & Cement',
    ar: 'الرمل والإسمنت',
    fr: 'Sable & ciment',
    icon: '⛰️',
    desc: 'Basic mix estimates',
  },
  {
    id: 'cost',
    en: 'Project Cost',
    ar: 'تكلفة المشروع',
    fr: 'Coût du projet',
    icon: '🧮',
    desc: 'Materials and labour',
  },
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mode, setMode] = useState<Mode>('professional');
  // Every calculator and feature is free. Ads are shown to all users.
  const professionalActive = true;
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selected, setSelected] = useState('concrete');
  const [selectedMeasurement, setSelectedMeasurement] = useState(measurementTools[0]);
  const [savedCalculation, setSavedCalculation] = useState<SavedCalculation | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [internetStatus, setInternetStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [adTrigger, setAdTrigger] = useState(0);
  const [internetRetry, setInternetRetry] = useState(0);
  const [isAdvertiserAdmin, setIsAdvertiserAdmin] = useState(false);

  const requestInterstitial = () => setAdTrigger(value => value + 1);

  useEffect(() => {
    let mounted = true;
    let checking = false;
    const checkInternet = async () => {
      if (checking) return;
      checking = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      try {
        // no-cors allows the browser preview to test reachability without needing a readable response.
        await fetch('https://www.google.com/generate_204', { method: 'GET', mode: 'no-cors', cache: 'no-store', signal: controller.signal });
        if (mounted) setInternetStatus('online');
      } catch {
        if (mounted) setInternetStatus('offline');
      } finally {
        clearTimeout(timeout);
        checking = false;
      }
    };
    checkInternet();
    const interval = setInterval(checkInternet, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [internetRetry]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('danatBuildSettings');

        if (saved) {
          const settings = JSON.parse(saved);

          if (['en', 'ar', 'fr'].includes(settings.lang)) setLang(settings.lang);
          if (['metric', 'imperial'].includes(settings.units)) setUnits(settings.units);
          if (['dark', 'light'].includes(settings.theme)) setTheme(settings.theme);
        }
      } catch (error) {
        console.warn('Could not load settings:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (!user) {
        setIsAdvertiserAdmin(false);
        setScreen(current => current === 'building' ? 'home' : current);
        return;
      }

      try {
        const token = await getIdTokenResult(user);
        setIsAdvertiserAdmin(token.claims.advertiserAdmin === true);
      } catch {
        setIsAdvertiserAdmin(false);
      }

      // Keep the existing email-verification policy for newly registered accounts.
      const accountCreatedAt = user.metadata.creationTime
        ? Date.parse(user.metadata.creationTime)
        : Number.NaN;
      const emailVerificationRequired =
        !Number.isFinite(accountCreatedAt) ||
        accountCreatedAt >= Date.parse('2026-11-18T22:00:00.000Z');

      if (!user.emailVerified && emailVerificationRequired) {
        setScreen('auth');
        return;
      }

      // A restored Firebase session bypasses the welcome/language screen.
      setScreen(current => current === 'welcome' || current === 'auth' ? 'home' : current);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    AsyncStorage.setItem(
      'danatBuildSettings',
      JSON.stringify({ lang, mode, units, theme })
    ).catch(error => console.warn('Could not save settings:', error));
  }, [lang, mode, units, theme, settingsLoaded]);

  const isAr = lang === 'ar';
  const isLight = theme === 'light';
  const ui = useMemo(() => getThemedStyles(styles, theme), [theme]);

  const tr = (en: string, ar: string, fr: string) =>
    lang === 'ar' ? ar : lang === 'fr' ? fr : en;

  const title = (tool: Tool) =>
    lang === 'ar' ? tool.ar : lang === 'fr' ? tool.fr : tool.en;

  const openTool = (id: string) => {
    requestInterstitial();
    setSavedCalculation(null);
    setSelected(id);
    setScreen('calculator');
  };

  const toggleFavourite = (id: string) => {
    requestInterstitial();
    setFavourites(old =>
      old.includes(id)
        ? old.filter(item => item !== id)
        : [...old, id]
    );
  };

  const nav = (
    target: Screen,
    label: string,
    icon: string
  ) => (
    <Pressable
      onPress={() => { requestInterstitial(); setScreen(target); }}
      style={ui.navItem}
    >
      <Text
        style={[
          ui.navIcon,
          screen === target && ui.activeNav,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          ui.navLabel,
          screen === target && ui.activeNav,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderToolCard = (tool: Tool) => (
    <Pressable
      key={tool.id}
      onPress={() => openTool(tool.id)}
      style={ui.toolCard}
    >
      <ImageBackground
        source={
          tool.id === 'concrete'
            ? require('./assets/icons/concrete.png')
            : tool.id === 'tiles'
            ? require('./assets/icons/tiles-ceramics.png')
            : tool.id === 'paint'
            ? require('./assets/icons/paint.png')
            : tool.id === 'blocks'
            ? require('./assets/icons/blocks-bricks.png')
            : tool.id === 'sand'
            ? require('./assets/icons/sand-cement.png')
            : require('./assets/icons/project-cost.png')
        }
        style={ui.toolImageBackground}
        imageStyle={ui.toolBackgroundImage as ImageStyle}
        resizeMode="stretch"
      >
        <View style={ui.toolTextOverlay}>
          <Text style={ui.toolTitle}>{title(tool)}</Text>
          <Text style={ui.toolDesc}>
            {tr(
              tool.desc,
              tool.id === 'concrete'
                ? 'الحجم والهدر'
                : tool.id === 'tiles'
                ? 'مساحة الأرض والجدران'
                : 'تقدير الكميات',
              tool.desc
            )}
          </Text>
        </View>
      </ImageBackground>

      <Pressable
        onPress={() => toggleFavourite(tool.id)}
        style={ui.cardStar}
        hitSlop={8}
      >
        <Text style={ui.star}>
          {favourites.includes(tool.id) ? '★' : '☆'}
        </Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={ui.webOuterContainer}>
      <SafeAreaView style={ui.safe}>
        <StatusBar
          barStyle={isLight ? 'dark-content' : 'light-content'}
          backgroundColor={isLight ? '#F1ECE2' : BG}
        />

        {screen === 'welcome' ? (
          <ScrollView
            contentContainerStyle={ui.welcome}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('./assets/branding/danat-build-brand.png')}
              style={ui.welcomeLogo as ImageStyle}
              resizeMode="contain"
            />

            <Text style={ui.welcomeSub}>
              SMART CONSTRUCTION
            </Text>

            <Text style={ui.welcomeSub}>
              CALCULATOR
            </Text>

            <View style={ui.welcomeRule} />

            <Text style={ui.script}>
              {tr(
                'Build Smarter.\nCalculate Better.',
                'ابنِ بذكاء.\nاحسب بدقة.',
                'Construisez mieux.\nCalculez juste.'
              )}
            </Text>

            <View style={ui.langRow}>
              {(['en', 'ar', 'fr'] as const).map(language => (
                <Pressable
                  key={language}
                  onPress={() => setLang(language)}
                  style={[
                    ui.langBtn,
                    lang === language && ui.langOn,
                  ]}
                >
                  <Text
                    style={[
                      ui.langText,
                      lang === language && ui.langTextOn,
                    ]}
                  >
                    {language === 'en'
                      ? 'English'
                      : language === 'ar'
                      ? 'العربية'
                      : 'Français'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={ui.goldButton}
              onPress={() => { requestInterstitial(); setScreen('auth'); }}
            >
              <Text style={ui.goldButtonText}>
                {tr(
                  'GET STARTED  ›',
                  'ابدأ الآن  ›',
                  'COMMENCER  ›'
                )}
              </Text>
            </Pressable>

            <Text style={ui.footerTag}>
              DANAT BUILD • BUILD SMARTER
            </Text>
          </ScrollView>
        ) : screen === 'auth' ? (
          <AuthScreen
            language={lang}
            theme={theme}
            onAuthenticated={() => setScreen('home')}
          />
        ) : (
          <View style={ui.screenWrapper}>
            <ScrollView
              contentContainerStyle={ui.page}
              showsVerticalScrollIndicator={false}
            >
              <View style={ui.topbar}>
                <Pressable onPress={() => { requestInterstitial(); setScreen(screen === 'home' ? 'menu' : 'home'); }}>
                  <Text style={ui.backIcon}>
                    {screen === 'home' ? '☰' : '‹'}
                  </Text>
                </Pressable>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Image
                    source={require('./assets/branding/danat-build-brand.png')}
                    style={ui.innerBrandLogo as ImageStyle}
                    resizeMode="contain"
                  />

                  <Text style={ui.topSub}>
                    SMART CONSTRUCTION CALCULATOR
                  </Text>
                </View>


              </View>

              {screen === 'home' && (
                <>
                  <Text style={ui.welcomeArabic}>
                    {tr(
                      'Welcome to Danat Build',
                      'مرحباً بك في دانات للبناء',
                      'Bienvenue chez Danat Build'
                    )}
                  </Text>

                  <Text style={ui.centerMuted}>
                    {tr(
                      'Choose your experience',
                      'اختر نوع الاستخدام',
                      'Choisissez votre mode'
                    )}
                  </Text>

                  <View
                    style={[
                      ui.modeRow,
                      isAr && ui.rowRTL,
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        requestInterstitial();
                        setMode('professional');
                      }}
                      style={[
                        ui.modeCard,
                        mode === 'professional' && ui.modeActive,
                      ]}
                    >
                      <ImageBackground
                        source={require("./assets/icons/professional.png")}
                        style={ui.modeBackground}
                        imageStyle={ui.modeBackgroundImage as ImageStyle}
                        resizeMode="cover"
                      >
                        <View style={ui.modeTextOverlay}>
                          <Text style={ui.modeText}>
                        {tr(
                          'Professional',
                          'المحترف',
                          'Professionnel'
                        )}
                      </Text>

                          <Text style={ui.modeHint}>
                            {tr(
                              'Advanced tools',
                              'أدوات متقدمة',
                              'Outils avancés'
                            )}
                          </Text>
                        </View>
                      </ImageBackground>
                    </Pressable>

                    <Pressable
                      onPress={() => { requestInterstitial(); setMode('homeowner'); }}
                      style={[
                        ui.modeCard,
                        mode === 'homeowner' && ui.modeActive,
                      ]}
                    >
                      <ImageBackground
                        source={require("./assets/icons/homeowner.png")}
                        style={ui.modeBackground}
                        imageStyle={ui.modeBackgroundImage as ImageStyle}
                        resizeMode="cover"
                      >
                        <View style={ui.modeTextOverlay}>
                          <Text style={ui.modeText}>
                        {tr(
                          'Homeowner',
                          'مالك المنزل',
                          'Propriétaire'
                        )}
                      </Text>

                          <Text style={ui.modeHint}>
                            {tr(
                              'Simple estimates',
                              'حسابات بسيطة',
                              'Estimations simples'
                            )}
                          </Text>
                        </View>
                      </ImageBackground>
                    </Pressable>
                  </View>

                  {mode === 'professional' && professionalActive && (
                  <Pressable
                    onPress={() => { requestInterstitial(); setSavedCalculation(null); setScreen('building'); }}
                    style={ui.buildingCard}
                  >
                    <ImageBackground
                      source={require("./assets/icons/full-building-calculator.png")}
                      style={ui.buildingBackground}
                      imageStyle={ui.buildingBackgroundImage as ImageStyle}
                      resizeMode="cover"
                    >
                      <View style={ui.buildingOverlay}>
                        <View style={{ flex: 1 }}>
                          <Text style={ui.buildingTitle}>
                        {tr(
                          'FULL BUILDING CALCULATOR',
                          'حاسبة البناء الشاملة',
                          'CALCULATEUR COMPLET DU BÂTIMENT'
                        )}
                      </Text>
                      <Text style={ui.buildingDesc}>
                        {tr(
                          'Calculate from foundations to finishing',
                          'احسب من الأساسات حتى التشطيبات',
                          'Des fondations jusqu’aux finitions'
                        )}
                          </Text>
                        </View>
                        <Text style={ui.buildingArrow}>›</Text>
                      </View>
                    </ImageBackground>
                  </Pressable>
                  )}

                  <Text style={ui.section}>
                    {tr(
                      'QUICK CALCULATORS',
                      'أدوات الحساب السريعة',
                      'CALCULATEURS RAPIDES'
                    )}
                  </Text>

                  <View style={ui.toolGrid}>
                    {tools.map(renderToolCard)}
                  </View>

                  <Pressable
                    onPress={() => { requestInterstitial(); setScreen('measurements'); }}
                    style={ui.measurementsEntry}
                  >
                    <View style={ui.measurementsEntryIcon}>
                      <Image
                        source={require('./assets/measurements/measurement.png')}
                        style={ui.measurementsEntryArtwork}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ui.measurementsEntryTitle}>{tr('MEASUREMENTS', 'القياسات', 'MESURES')}</Text>
                      <Text style={ui.measurementsEntryDesc}>{tr('Six tools for on-site measurements', 'ست أدوات للقياس في موقع العمل', 'Six outils de mesure sur chantier')}</Text>
                    </View>
                    <Text style={ui.measurementsEntryArrow}>›</Text>
                  </Pressable>

                  <View style={ui.tipBox}>
                    <Text style={ui.tipTitle}>
                      ✦ {tr(
                        'BUILD SMARTER',
                        'ابنِ بذكاء',
                        'CONSTRUIRE INTELLIGEMMENT'
                      )}
                    </Text>

                    <Text style={ui.tipText}>
                      {tr(
                        'Plan quantities before you buy materials.',
                        'خطط لكميات المواد قبل الشراء.',
                        'Planifiez les quantités avant vos achats.'
                      )}
                    </Text>
                  </View>

                </>
              )}

              {screen === 'measurements' && (
                <>
                  <Text style={ui.h1}>{tr('Measurements', 'القياسات', 'Mesures')}</Text>
                  <Text style={ui.centerMuted}>{tr('Choose a measurement tool', 'اختر أداة القياس', 'Choisissez un outil de mesure')}</Text>
                  <View style={ui.measurementGrid}>
                    {measurementTools.map(tool => (
                      <Pressable
                        key={tool.id}
                        onPress={() => { requestInterstitial(); setSelectedMeasurement(tool); setScreen('measurementTool'); }}
                        style={ui.measurementCard}
                      >
                        <ImageBackground
                          source={
                            tool.id === 'ar-distance'
                              ? require('./assets/measurements/ar-distance.png')
                              : tool.id === 'ar-room'
                              ? require('./assets/measurements/ar-room.png')
                              : tool.id === 'angle-slope'
                              ? require('./assets/measurements/angle-slope.png')
                              : tool.id === 'spirit-level'
                              ? require('./assets/measurements/digital-level.png')
                              : tool.id === 'height'
                              ? require('./assets/measurements/height.png')
                              : require('./assets/measurements/area-perimeter.png')
                          }
                          style={ui.measurementCardBackground}
                          imageStyle={ui.measurementCardArtwork as ImageStyle}
                          resizeMode="stretch"
                        >
                          <View style={ui.measurementTextOverlay}>
                            <Text style={ui.measurementTitle}>{lang === 'ar' ? tool.ar : lang === 'fr' ? tool.fr : tool.en}</Text>
                            <Text style={ui.measurementDesc}>{lang === 'ar' ? tool.descAr : lang === 'fr' ? tool.descFr : tool.desc}</Text>
                          </View>
                        </ImageBackground>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {screen === 'measurementTool' && (
                <MeasurementsToolScreen
                  toolId={selectedMeasurement.id}
                  language={lang}
                  units={units}
                  onBack={() => setScreen('measurements')}
                />
              )}

              {screen === 'calculator' && (
                <>
                  <CalculatorScreen
                    calculatorId={selected}
                    language={lang}
                    theme={theme}
                    units={units}
                    userId={auth.currentUser?.uid || 'guest'}
                    savedCalculation={savedCalculation}
                    onBack={() => { setSavedCalculation(null); setScreen('home'); }}
                  />
                </>
              )}

              {screen === 'building' && professionalActive && (
                <BuildingCalculatorScreen
                  key={savedCalculation?.kind === 'building' ? savedCalculation.id : 'new-building-calculation'}
                  language={lang}
                  theme={theme}
                  mode={mode}
                  units={units}
                  userId={auth.currentUser?.uid || 'guest'}
                  savedCalculation={savedCalculation}
                  onBack={() => { setSavedCalculation(null); setScreen('home'); }}
                />
              )}

              {screen === 'projects' && (
                <MyProjectsScreen language={lang} theme={theme} userId={auth.currentUser?.uid || 'guest'} onBack={() => { setSavedCalculation(null); setScreen('home'); }} onOpen={calculation => {
                  setSavedCalculation(calculation);
                  if (calculation.kind === 'quick') {
                    const payload = calculation.payload as { calculatorId?: string; units?: 'metric' | 'imperial' };
                    if (payload.calculatorId) setSelected(payload.calculatorId);
                    if (payload.units) setUnits(payload.units);
                    setScreen('calculator');
                  } else {
                    const payload = calculation.payload as { units?: 'metric' | 'imperial' };
                    if (payload.units) setUnits(payload.units);
                    setScreen('building');
                  }
                }} />
              )}

              {screen === 'profile' && (
                <ProfileScreen
                  language={lang}
                  theme={theme}
                  mode={professionalActive ? 'professional' : mode}
                  onSignOut={async () => {
                    await signOut(auth);
                    setScreen('auth');
                  }}
                />
              )}

              {screen === 'favorites' && (
                <>
                  <Text style={ui.h1}>
                    {tr(
                      'My Favorites',
                      'أدواتي المفضلة',
                      'Mes favoris'
                    )}
                  </Text>

                  {favourites.length === 0 ? (
                    <View style={ui.emptyCard}>
                      <Text style={ui.emptyIcon}>☆</Text>

                      <Text style={ui.emptyText}>
                        {tr(
                          'No favorites yet. Add calculators using the star icon.',
                          'لا توجد أدوات مفضلة بعد. أضف الأدوات باستخدام علامة النجمة.',
                          'Aucun favori. Ajoutez des calculateurs avec l’étoile.'
                        )}
                      </Text>
                    </View>
                  ) : (
                    <View style={ui.toolGrid}>
                      {tools
                        .filter(tool => favourites.includes(tool.id))
                        .map(renderToolCard)}
                    </View>
                  )}
                </>
              )}

              {screen === 'about' && (
                <>
                  <Text style={ui.h1}>
                    {tr('About Danat Build', 'عن دانات للبناء', 'À propos de Danat Build')}
                  </Text>

                  <View style={ui.emptyCard}>
                    <Text style={ui.emptyIcon}>⌂</Text>
                    <Text style={ui.menuRowText}>DANAT BUILD</Text>

                    <Text style={ui.emptyText}>
                      {tr(
                        'Build smarter. Plan better.',
                        'ابنِ بذكاء وخطط بشكل أفضل.',
                        'Construisez intelligemment. Planifiez mieux.'
                      )}
                    </Text>

                    <Text style={ui.emptyText}>
                      {tr(
                        'Danat Build is a construction planning application designed to help professionals and homeowners calculate building materials, estimate quantities and plan projects more efficiently.',
                        'دانات للبناء هو تطبيق لتخطيط أعمال البناء، يساعد المهندسين والمحترفين وأصحاب المنازل على حساب مواد البناء وتقدير الكميات وتخطيط المشاريع بكفاءة.',
                        'Danat Build est une application de planification de construction qui aide les professionnels et les propriétaires à calculer les matériaux, estimer les quantités et organiser leurs projets.'
                      )}
                    </Text>
                  </View>

                  <Text style={ui.section}>
                    {tr('WHAT YOU CAN DO', 'ماذا يمكنك أن تفعل', 'CE QUE VOUS POUVEZ FAIRE')}
                  </Text>

                  {[
                    tr('Professional construction calculations', 'حسابات البناء للمحترفين', 'Calculs de construction professionnels'),
                    tr('Homeowner project planning', 'تخطيط مشاريع أصحاب المنازل', 'Planification pour les propriétaires'),
                    tr('Full building quantity calculations', 'حساب كميات المباني بالكامل', 'Calcul des quantités d’un bâtiment complet'),
                    tr('Save your favorite calculators', 'حفظ أدواتك المفضلة', 'Enregistrer vos calculateurs favoris'),
                  ].map((feature, index) => (
                    <View key={index} style={ui.menuRow}>
                      <Text style={ui.menuRowText}>✓  {feature}</Text>
                    </View>
                  ))}

                  <Pressable
                    onPress={() => setScreen('menu')}
                    style={ui.menuRow}
                  >
                    <Text style={ui.menuRowText}>
                      ‹  {tr('Back to More', 'العودة إلى المزيد', 'Retour au menu')}
                    </Text>
                  </Pressable>
                </>
              )}


              {screen === 'guide' && (
                <>
                  <Text style={ui.h1}>
                    {tr('Tips & Guide', 'النصائح والإرشادات', 'Conseils et guide')}
                  </Text>

                  <View style={ui.emptyCard}>
                    <Text style={ui.emptyIcon}>📐</Text>
                    <Text style={ui.menuRowText}>
                      {tr('PLAN BEFORE YOU BUILD', 'خطط قبل البناء', 'PLANIFIEZ AVANT DE CONSTRUIRE')}
                    </Text>
                    <Text style={ui.emptyText}>
                      {tr(
                        'Good planning helps reduce waste, control costs and avoid mistakes.',
                        'التخطيط الجيد يساعد على تقليل الهدر وضبط التكاليف وتجنب الأخطاء.',
                        'Une bonne planification réduit les pertes, maîtrise les coûts et évite les erreurs.'
                      )}
                    </Text>
                  </View>

                  {[
                    {
                      icon: '📏',
                      title: tr('1. Measure accurately', '١. قِس بدقة', '1. Mesurez avec précision'),
                      body: tr(
                        'Measure length, width and height carefully. Record every dimension and use the same unit throughout your project.',
                        'قِس الطول والعرض والارتفاع بعناية. سجّل جميع الأبعاد واستخدم وحدة قياس موحدة في المشروع.',
                        'Mesurez soigneusement la longueur, la largeur et la hauteur. Notez chaque dimension et gardez la même unité.'
                      )
                    },
                    {
                      icon: '🧱',
                      title: tr('2. Calculate material quantities', '٢. احسب كميات المواد', '2. Calculez les quantités de matériaux'),
                      body: tr(
                        'Check the dimensions and thickness of each element before calculating concrete, blocks, cement, sand or other materials.',
                        'تحقق من أبعاد وسماكة كل عنصر قبل حساب الخرسانة والبلوك والإسمنت والرمل وباقي المواد.',
                        'Vérifiez les dimensions et l’épaisseur de chaque élément avant de calculer le béton, les blocs, le ciment et le sable.'
                      )
                    },
                    {
                      icon: '🎨',
                      title: tr('3. Plan paint and finishing', '٣. خطط للدهان والتشطيبات', '3. Planifiez la peinture et les finitions'),
                      body: tr(
                        'Measure the surface area, account for doors and windows where appropriate, and check the product coverage and number of coats.',
                        'احسب مساحة الأسطح، واطرح مساحة الأبواب والنوافذ عند الحاجة، وتحقق من تغطية المنتج وعدد الطبقات.',
                        'Mesurez les surfaces, déduisez les portes et fenêtres si nécessaire, puis vérifiez le rendement du produit et le nombre de couches.'
                      )
                    },
                    {
                      icon: '📦',
                      title: tr('4. Allow for material waste', '٤. احسب نسبة الهدر', '4. Prévoyez les pertes'),
                      body: tr(
                        'Allow an appropriate extra quantity for cutting, breakage and site waste. The allowance depends on the material and project conditions.',
                        'أضف كمية احتياطية مناسبة للقص والكسر وهدر الموقع. تختلف النسبة حسب نوع المادة وظروف المشروع.',
                        'Prévoyez une quantité supplémentaire adaptée aux découpes, à la casse et aux pertes sur chantier.'
                      )
                    },
                    {
                      icon: '⭐',
                      title: tr('5. Save your favorite tools', '٥. احفظ أدواتك المفضلة', '5. Enregistrez vos outils favoris'),
                      body: tr(
                        'Use the star icon on calculators to add them to Favorites for quick access later.',
                        'استخدم علامة النجمة على الآلات الحاسبة لإضافتها إلى المفضلة والوصول إليها بسرعة.',
                        'Utilisez l’étoile sur les calculateurs pour les ajouter aux favoris et y accéder rapidement.'
                      )
                    },
                    {
                      icon: '🦺',
                      title: tr('6. Work safely', '٦. اعمل بأمان', '6. Travaillez en sécurité'),
                      body: tr(
                        'Follow site safety procedures. Structural dimensions and reinforcement must always be checked by a qualified engineer.',
                        'اتبع إجراءات السلامة في موقع العمل. يجب أن يتحقق مهندس مختص من الأبعاد الإنشائية وحديد التسليح.',
                        'Respectez les règles de sécurité du chantier. Les dimensions structurelles et les armatures doivent être vérifiées par un ingénieur qualifié.'
                      )
                    }
                  ].map((tip, index) => (
                    <View key={index} style={ui.menuRow}>
                      <Text style={ui.emptyIcon}>{tip.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={ui.menuRowText}>{tip.title}</Text>
                        <Text style={ui.emptyText}>{tip.body}</Text>
                      </View>
                    </View>
                  ))}

                  <Pressable
                    onPress={() => setScreen('menu')}
                    style={ui.menuRow}
                  >
                    <Text style={ui.menuRowText}>
                      ‹  {tr('Back to More', 'العودة إلى المزيد', 'Retour au menu')}
                    </Text>
                  </Pressable>
                </>
              )}

              {screen === 'settings' && (
                <>
                  <Text style={ui.h1}>
                    {tr('Settings', 'الإعدادات', 'Paramètres')}
                  </Text>

                  <Text style={ui.section}>
                    {tr('LANGUAGE', 'اللغة', 'LANGUE')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['en', 'ar', 'fr'] as const).map(language => (
                      <Pressable
                        key={language}
                        onPress={() => setLang(language)}
                        style={[ui.langBtn, lang === language && ui.langOn]}
                      >
                        <Text style={[ui.langText, lang === language && ui.langTextOn]}>
                          {language === 'en' ? 'English' : language === 'ar' ? 'العربية' : 'Français'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={ui.section}>
                    {tr('APPEARANCE', 'المظهر', 'APPARENCE')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['dark', 'light'] as const).map(option => (
                      <Pressable
                        key={option}
                        onPress={() => setTheme(option)}
                        style={[ui.langBtn, theme === option && ui.langOn]}
                      >
                        <Text style={[ui.langText, theme === option && ui.langTextOn]}>
                          {option === 'dark'
                            ? tr('Dark Gold', 'الأسود والذهبي', 'Sombre & or')
                            : tr('Warm Ivory & Gold', 'العاجي الدافئ والذهبي', 'Ivoire chaud et or')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={ui.section}>
                    {tr('MEASUREMENT UNITS', 'وحدات القياس', 'UNITÉS DE MESURE')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['metric', 'imperial'] as const).map(unit => (
                      <Pressable
                        key={unit}
                        onPress={() => setUnits(unit)}
                        style={[ui.langBtn, units === unit && ui.langOn]}
                      >
                        <Text style={[ui.langText, units === unit && ui.langTextOn]}>
                          {unit === 'metric'
                            ? tr('Metric (m, cm)', 'متري (م، سم)', 'Métrique (m, cm)')
                            : tr('Imperial (ft, in)', 'إمبراطوري (قدم، بوصة)', 'Impérial (pi, po)')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <AdPrivacyOptionsButton language={lang} />

                  <Text style={ui.section}>
                    {tr('DEFAULT WORKING MODE', 'وضع العمل الافتراضي', 'MODE DE TRAVAIL PAR DÉFAUT')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['professional', 'homeowner'] as const).map(option => (
                      <Pressable
                        key={option}
                        onPress={() => {
                          setMode(option);
                        }}
                        style={[ui.langBtn, mode === option && ui.langOn]}
                      >
                        <Text style={[ui.langText, mode === option && ui.langTextOn]}>
                          {option === 'professional'
                            ? tr('Professional', 'احترافي', 'Professionnel')
                            : tr('Homeowner', 'مالك المنزل', 'Propriétaire')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable onPress={() => setScreen('menu')} style={ui.menuRow}>
                    <Text style={ui.menuRowText}>
                      ‹  {tr('Back to More', 'العودة إلى المزيد', 'Retour au menu')}
                    </Text>
                  </Pressable>
                </>
              )}

              {screen === 'contact' && (
                <>
                  <Text style={ui.h1}>
                    {tr('Contact Us', 'اتصل بنا', 'Contactez-nous')}
                  </Text>
                  <View style={ui.emptyCard}>
                    <Text style={ui.emptyIcon}>✉</Text>
                    <Text style={ui.menuRowText}>
                      {tr('Danat Build Support', 'دعم دانات للبناء', 'Assistance Danat Build')}
                    </Text>
                    <Text style={ui.emptyText}>
                      {tr('For questions, technical support or feedback, contact us by email:', 'للاستفسارات أو الدعم الفني أو لإرسال ملاحظاتك، تواصل معنا عبر البريد الإلكتروني:', 'Pour toute question, assistance technique ou remarque, contactez-nous par e-mail :')}
                    </Text>
                    <Pressable
                      onPress={() => Linking.openURL('mailto:IT@danat-gulf.com').catch(error => console.warn('Could not open email app:', error))}
                      style={[ui.goldButton, { marginTop: 14 }]}
                      accessibilityRole="button"
                    >
                      <Text style={ui.goldButtonText}>IT@danat-gulf.com</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setScreen('menu')} style={ui.menuRow}>
                    <Text style={ui.menuRowText}>
                      ‹  {tr('Back to More', 'العودة إلى المزيد', 'Retour au menu')}
                    </Text>
                  </Pressable>
                </>
              )}

              {screen === 'advertisers' && isAdvertiserAdmin && (
                <AdvertiserAdminScreen language={lang} theme={theme} onBack={() => setScreen('menu')} />
              )}

              {screen === 'menu' && (
                <>
                  <Text style={ui.h1}>
                    {tr('More', 'المزيد', 'Plus')}
                  </Text>

                  {[
                    tr('About Danat Build', 'عن دانات للبناء', 'À propos'),
                    tr('Tips & Guide', 'النصائح والإرشادات', 'Conseils'),
                    tr('Contact Us', 'اتصل بنا', 'Contact'),
                    tr('Settings', 'الإعدادات', 'Paramètres'),
                    tr('My Projects', 'مشاريعي', 'Mes projets'),
                  ].map((item, index) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        requestInterstitial();
                        if (index === 0) setScreen('about');
                        if (index === 1) setScreen('guide');
                        if (index === 2) setScreen('contact');
                        if (index === 3) setScreen('settings');
                        if (index === 4) setScreen('projects');
                      }}
                      style={ui.menuRow}
                    >
                      <Text style={ui.menuRowText}>
                        {['ⓘ', '♥', '☎', '⚙'][index]}   {item}
                      </Text>

                      <Text style={ui.menuArrow}>›</Text>
                    </Pressable>
                  ))}

                  {isAdvertiserAdmin && (
                    <Pressable onPress={() => setScreen('advertisers')} style={ui.menuRow}>
                      <Text style={ui.menuRowText}>▣   {tr('Direct Advertisers', 'إدارة الإعلانات المباشرة', 'Annonceurs directs')}</Text>
                      <Text style={ui.menuArrow}>›</Text>
                    </Pressable>
                  )}

                  <Text style={ui.section}>
                    {tr('LANGUAGE', 'اللغة', 'LANGUE')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['en', 'ar', 'fr'] as const).map(language => (
                      <Pressable
                        key={language}
                        onPress={() => setLang(language)}
                        style={[
                          ui.langBtn,
                          lang === language && ui.langOn,
                        ]}
                      >
                        <Text
                          style={[
                            ui.langText,
                            lang === language && ui.langTextOn,
                          ]}
                        >
                          {language === 'en'
                            ? 'English'
                            : language === 'ar'
                            ? 'العربية'
                            : 'Français'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <AdBanner enabled={true} />
            <AdInterstitial enabled={true} safeToShow={true} trigger={adTrigger} />

            <View
              style={[
                ui.bottomNav,
                isAr && ui.rowRTL,
              ]}
            >
              {nav(
                'home',
                tr('Home', 'الرئيسية', 'Accueil'),
                '⌂'
              )}

              {nav(
                'favorites',
                tr('Favorites', 'المفضلة', 'Favoris'),
                '☆'
              )}

              {nav(
                'menu',
                tr('More', 'المزيد', 'Plus'),
                '•••'
              )}

              {nav(
                'profile',
                tr('Profile', 'ملفي', 'Profil'),
                '●'
              )}
            </View>
          </View>
        )}
        {internetStatus !== 'online' && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 30, backgroundColor: '#080B0E', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <Text style={{ color: GOLD, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 14 }}>DANAT BUILD</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
              {internetStatus === 'checking' ? tr('Checking internet connection…', 'جارٍ التحقق من اتصال الإنترنت…', 'Vérification de la connexion Internet…') : tr('Internet connection required', 'يلزم الاتصال بالإنترنت', 'Connexion Internet requise')}
            </Text>
            <Text style={{ color: '#C7C9CB', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 22 }}>
              {tr('Please connect to the internet to use Danat Build. Your work will be available when the connection returns.', 'يرجى الاتصال بالإنترنت لاستخدام دانات للبناء. ستتمكن من متابعة عملك عند عودة الاتصال.', 'Veuillez vous connecter à Internet pour utiliser Danat Build. Votre travail sera disponible lorsque la connexion sera rétablie.')}
            </Text>
            <Pressable onPress={() => { setInternetStatus('checking'); setInternetRetry(value => value + 1); }} style={{ backgroundColor: GOLD, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 26 }}>
              <Text style={{ color: '#17110A', fontWeight: '900' }}>{tr('RETRY', 'إعادة المحاولة', 'RÉESSAYER')}</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#030406',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    backgroundColor: BG,
    width: '100%',
    maxWidth: 440,
    maxHeight: Platform.OS === 'web' ? '92%' : '100%',
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#2a2216',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  screenWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  page: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },
  welcome: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
    backgroundColor: BG,
  },
  logoSymbol: {
    width: 116,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  shell: {
    fontSize: 88,
    color: GOLD,
    lineHeight: 96,
  },
  pearl: {
    position: 'absolute',
    fontSize: 36,
    color: '#fff',
    top: 33,
  },
  welcomeLogo: {
    width: 300,
    height: 160,
    alignSelf: 'center',
    marginBottom: 10,
  },
  welcomeBrand: {
    fontSize: 46,
    fontWeight: '300',
    letterSpacing: 5,
    color: GOLD,
    lineHeight: 48,
  },
  welcomeSub: {
    fontSize: 14,
    letterSpacing: 3,
    color: '#f5f3ef',
    marginTop: 4,
  },
  welcomeRule: {
    width: 110,
    height: 2,
    backgroundColor: GOLD,
    marginVertical: 28,
  },
  script: {
    color: GOLD,
    fontSize: 21,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 30,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  langBtn: {
    borderWidth: 1,
    borderColor: '#514b40',
    borderRadius: 30,
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  langOn: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  langText: {
    color: '#eee',
    fontSize: 12,
  },
  langTextOn: {
    color: '#17110a',
    fontWeight: '800',
  },
  goldButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: GOLD,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  goldButtonText: {
    color: '#17110a',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  footerTag: {
    color: '#777',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 35,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4b3c25',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 29,
    color: '#fff',
    width: 28,
  },
  brand: {
    color: GOLD,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 2,
  },
  innerBrandLogo: {
    width: 150,
    height: 65,
    alignSelf: 'center',
  },
  topSub: {
    fontSize: 8,
    color: '#b8b8b8',
    letterSpacing: 1.5,
    marginTop: 3,
  },
  menuIcon: {
    fontSize: 27,
    color: GOLD,
  },
  welcomeArabic: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },
  centerMuted: {
    color: '#b7bbc0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 19,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  modeCard: {
    flex: 1,
    minHeight: 158,
    borderWidth: 1,
    borderColor: '#66553a',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#191e24',
  },
  modeActive: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  modeBackground: {
    width: '100%',
    minHeight: 156,
    justifyContent: 'flex-end',
  },
  modeBackgroundImage: {
    opacity: 0.95,
  },
  modeTextOverlay: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(8, 11, 14, 0.68)',
  },
  modeText: {
    fontSize: 16,
    color: GOLD,
    fontWeight: '800',
  },
  modeHint: {
    fontSize: 11,
    color: '#ddd',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginTop: 26,
    marginBottom: 13,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measurementsEntry: {
    marginTop: 18,
    minHeight: 82,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: '#17191C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 13,
  },
  measurementsEntryIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#292318', alignItems: 'center', justifyContent: 'center' },
  measurementsEntryEmoji: { fontSize: 26 },
  measurementsEntryArtwork: { width: 44, height: 44 },
  measurementsEntryTitle: { color: GOLD, fontSize: 15, fontWeight: '900', letterSpacing: 1.1 },
  measurementsEntryDesc: { color: '#B8B8B8', fontSize: 11, marginTop: 5 },
  measurementsEntryArrow: { color: GOLD, fontSize: 30, fontWeight: '300' },
  measurementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 20 },
  measurementCard: { width: '48%', minHeight: 154, borderRadius: 15, borderWidth: 1, borderColor: '#79613A', backgroundColor: '#17191C', padding: 0, overflow: 'hidden' },
  measurementCardBackground: { flex: 1, minHeight: 154, width: '100%', justifyContent: 'flex-end' },
  measurementCardArtwork: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  measurementTextOverlay: { width: '100%', paddingHorizontal: 9, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8, 11, 14, 0.70)' },
  measurementIcon: { fontSize: 31, marginBottom: 9 },
  measurementTitle: { color: GOLD, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  measurementDesc: { color: '#B8B8B8', fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 7 },
  measurementToolPanel: { alignItems: 'center', paddingTop: 28 },
  measurementIconLarge: { fontSize: 58, marginBottom: 14 },
  measurementNotice: { width: '100%', marginTop: 24, borderRadius: 14, borderWidth: 1, borderColor: '#79613A', backgroundColor: '#17191C', padding: 16 },
  measurementNoticeTitle: { color: GOLD, fontSize: 14, fontWeight: '800', marginBottom: 9, textAlign: 'center' },
  measurementNoticeText: { color: '#D0D0D0', fontSize: 12, lineHeight: 19, textAlign: 'center' },
  measurementBackButton: { marginTop: 22, borderRadius: 12, backgroundColor: GOLD, paddingVertical: 14, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center' },
  measurementBackText: { color: '#17130D', fontSize: 12, fontWeight: '900', letterSpacing: 0.7 },
  toolCard: {
    width: '48%',
    height: 140,
    minHeight: 140,
    backgroundColor: '#191e24',
    borderWidth: 1,
    borderColor: '#5b5142',
    borderRadius: 15,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  toolImageBackground: {
    flex: 1,
    height: '100%',
    minHeight: 140,
    width: '100%',
    justifyContent: 'flex-end',
  },
  toolBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.88,
    borderRadius: 14,
  },
  toolTextOverlay: {
    width: '100%',
    paddingHorizontal: 9,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 14, 0.68)',
  },
  toolEmoji: {
    fontSize: 31,
    marginBottom: 7,
  },
  toolTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  toolDesc: {
    color: '#aeb2b8',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  cardStar: {
    position: 'absolute',
    top: 7,
    right: 9,
    padding: 3,
  },
  star: {
    fontSize: 20,
    color: GOLD,
  },
  buildingCard: {
    marginTop: 22,
    height: 150,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buildingBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  buildingBackgroundImage: {
    borderRadius: 15,
  },
  buildingOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  buildingTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buildingDesc: {
    color: '#c7c9cb',
    fontSize: 10,
    marginTop: 5,
  },
  buildingArrow: {
    color: GOLD,
    fontSize: 28,
  },
  tipBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#171b20',
    borderWidth: 1,
    borderColor: '#57472d',
  },
  tipTitle: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 12,
  },
  tipText: {
    color: '#c7c9cb',
    fontSize: 12,
    marginTop: 6,
  },
  h1: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: '#191e24',
    borderWidth: 1,
    borderColor: '#625239',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    color: GOLD,
  },
  emptyText: {
    color: '#c7c9cb',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  menuRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuRowText: {
    color: '#eee',
    fontSize: 16,
  },
  menuArrow: {
    color: GOLD,
    fontSize: 22,
  },
  bottomNav: {
    height: 66,
    backgroundColor: '#101419',
    borderTopWidth: 1,
    borderTopColor: '#363a3d',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
  },
  navIcon: {
    color: '#ddd',
    fontSize: 23,
  },
  activeNav: {
    color: GOLD,
  },
  navLabel: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 2,
  },
});