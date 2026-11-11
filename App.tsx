import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

import CalculatorScreen from './src/components/CalculatorScreen';
import BuildingCalculatorScreen from './src/components/BuildingCalculatorScreen';
import AuthScreen from './src/components/AuthScreen';
import ProfileScreen from './src/components/ProfileScreen';
import { AppTheme, getThemedStyles } from './src/theme';
import { signOut } from 'firebase/auth';
import { auth } from './src/firebase';

type Language = 'en' | 'ar' | 'fr';
type Screen = 'welcome' | 'auth' | 'home' | 'calculator' | 'building' | 'favorites' | 'menu' | 'profile' | 'about' | 'guide' | 'settings';
type Mode = 'professional' | 'homeowner';

type Tool = {
  id: string;
  en: string;
  ar: string;
  fr: string;
  icon: string;
  desc: string;
};

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
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selected, setSelected] = useState('concrete');
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('danatBuildSettings');

        if (saved) {
          const settings = JSON.parse(saved);

          if (['en', 'ar', 'fr'].includes(settings.lang)) setLang(settings.lang);
          if (['professional', 'homeowner'].includes(settings.mode)) setMode(settings.mode);
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
    setSelected(id);
    setScreen('calculator');
  };

  const toggleFavourite = (id: string) => {
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
      onPress={() => setScreen(target)}
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
      <Image
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
        style={ui.toolImage}
        resizeMode="contain"
      />

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
              style={ui.welcomeLogo}
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
              onPress={() => setScreen('auth')}
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
                <Pressable onPress={() => setScreen('home')}>
                  <Text style={ui.backIcon}>
                    {screen === 'home' ? '☰' : '‹'}
                  </Text>
                </Pressable>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Image
                    source={require('./assets/branding/danat-build-brand.png')}
                    style={ui.innerBrandLogo}
                    resizeMode="contain"
                  />

                  <Text style={ui.topSub}>
                    SMART CONSTRUCTION CALCULATOR
                  </Text>
                </View>

                <Pressable onPress={() => setScreen('menu')}>
                  <Text style={ui.menuIcon}>⋮</Text>
                </Pressable>
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
                      onPress={() => setMode('professional')}
                      style={[
                        ui.modeCard,
                        mode === 'professional' && ui.modeActive,
                      ]}
                    >
                      <Image source={require("./assets/icons/professional.png")} style={ui.modeImage} resizeMode="contain" />

                      <Text style={ui.modeText}>
                        {tr(
                          'Professional',
                          'المهني',
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
                    </Pressable>

                    <Pressable
                      onPress={() => setMode('homeowner')}
                      style={[
                        ui.modeCard,
                        mode === 'homeowner' && ui.modeActive,
                      ]}
                    >
                      <Image source={require("./assets/icons/homeowner.png")} style={ui.modeImage} resizeMode="contain" />

                      <Text style={ui.modeText}>
                        {tr(
                          'Homeowner',
                          'صاحب المنزل',
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
                    </Pressable>
                  </View>

                  {mode === 'professional' && (
                  <Pressable
                    onPress={() => setScreen('building')}
                    style={ui.buildingCard}
                  >
                    <Image source={require("./assets/icons/full-building-calculator.png")} style={ui.buildingImage} resizeMode="contain" />
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

              {screen === 'calculator' && (
                <CalculatorScreen
                  calculatorId={selected}
                  language={lang}
                  theme={theme}
                  units={units}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'building' && (
                <BuildingCalculatorScreen
                  language={lang}
                  theme={theme}
                  mode={mode}
                  units={units}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'profile' && (
                <ProfileScreen
                  language={lang}
                  theme={theme}
                  mode={mode}
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

                  <Text style={ui.section}>
                    {tr('DEFAULT WORKING MODE', 'وضع العمل الافتراضي', 'MODE DE TRAVAIL PAR DÉFAUT')}
                  </Text>

                  <View style={ui.langRow}>
                    {(['professional', 'homeowner'] as const).map(option => (
                      <Pressable
                        key={option}
                        onPress={() => setMode(option)}
                        style={[ui.langBtn, mode === option && ui.langOn]}
                      >
                        <Text style={[ui.langText, mode === option && ui.langTextOn]}>
                          {option === 'professional'
                            ? tr('Professional', 'احترافي', 'Professionnel')
                            : tr('Homeowner', 'صاحب المنزل', 'Propriétaire')}
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
                  ].map((item, index) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        if (index === 0) setScreen('about');
                        if (index === 1) setScreen('guide');
                        if (index === 3) setScreen('settings');
                      }}
                      style={ui.menuRow}
                    >
                      <Text style={ui.menuRowText}>
                        {['ⓘ', '♥', '☎', '⚙'][index]}   {item}
                      </Text>

                      <Text style={ui.menuArrow}>›</Text>
                    </Pressable>
                  ))}

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
    backgroundColor: '#191e24',
    borderWidth: 1,
    borderColor: '#66553a',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  modeActive: {
    borderColor: GOLD,
    backgroundColor: '#242019',
  },
  modeImage: {
    width: 56,
    height: 56,
    marginBottom: 8,
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
  toolCard: {
    width: '48%',
    minHeight: 125,
    backgroundColor: '#191e24',
    borderWidth: 1,
    borderColor: '#5b5142',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    position: 'relative',
  },
  toolImage: {
    width: 58,
    height: 58,
    marginBottom: 7,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    padding: 16,
    backgroundColor: '#1c1a15',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 16,
  },
  buildingImage: {
    width: 48,
    height: 48,
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