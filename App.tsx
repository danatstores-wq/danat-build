import React, { useState } from 'react';
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
import { signOut } from 'firebase/auth';
import { auth } from './src/firebase';

type Language = 'en' | 'ar' | 'fr';
type Screen = 'welcome' | 'auth' | 'home' | 'calculator' | 'building' | 'favorites' | 'menu' | 'profile';
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
  const [selected, setSelected] = useState('concrete');
  const [favourites, setFavourites] = useState<string[]>([]);

  const isAr = lang === 'ar';

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
      style={styles.navItem}
    >
      <Text
        style={[
          styles.navIcon,
          screen === target && styles.activeNav,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          screen === target && styles.activeNav,
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
      style={styles.toolCard}
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
        style={styles.toolImage}
        resizeMode="contain"
      />

      <Text style={styles.toolTitle}>{title(tool)}</Text>

      <Text style={styles.toolDesc}>
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
        style={styles.cardStar}
        hitSlop={8}
      >
        <Text style={styles.star}>
          {favourites.includes(tool.id) ? '★' : '☆'}
        </Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BG}
        />

        {screen === 'welcome' ? (
          <ScrollView
            contentContainerStyle={styles.welcome}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('./assets/branding/danat-build-brand.png')}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />

            <Text style={styles.welcomeSub}>
              SMART CONSTRUCTION
            </Text>

            <Text style={styles.welcomeSub}>
              CALCULATOR
            </Text>

            <View style={styles.welcomeRule} />

            <Text style={styles.script}>
              {tr(
                'Build Smarter.\nCalculate Better.',
                'ابنِ بذكاء.\nاحسب بدقة.',
                'Construisez mieux.\nCalculez juste.'
              )}
            </Text>

            <View style={styles.langRow}>
              {(['en', 'ar', 'fr'] as const).map(language => (
                <Pressable
                  key={language}
                  onPress={() => setLang(language)}
                  style={[
                    styles.langBtn,
                    lang === language && styles.langOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.langText,
                      lang === language && styles.langTextOn,
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
              style={styles.goldButton}
              onPress={() => setScreen('auth')}
            >
              <Text style={styles.goldButtonText}>
                {tr(
                  'GET STARTED  ›',
                  'ابدأ الآن  ›',
                  'COMMENCER  ›'
                )}
              </Text>
            </Pressable>

            <Text style={styles.footerTag}>
              DANAT BUILD • BUILD SMARTER
            </Text>
          </ScrollView>
        ) : screen === 'auth' ? (
          <AuthScreen
            language={lang}
            onAuthenticated={() => setScreen('home')}
          />
        ) : (
          <View style={styles.screenWrapper}>
            <ScrollView
              contentContainerStyle={styles.page}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.topbar}>
                <Pressable onPress={() => setScreen('home')}>
                  <Text style={styles.backIcon}>
                    {screen === 'home' ? '☰' : '‹'}
                  </Text>
                </Pressable>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Image
                    source={require('./assets/branding/danat-build-brand.png')}
                    style={styles.innerBrandLogo}
                    resizeMode="contain"
                  />

                  <Text style={styles.topSub}>
                    SMART CONSTRUCTION CALCULATOR
                  </Text>
                </View>

                <Pressable onPress={() => setScreen('menu')}>
                  <Text style={styles.menuIcon}>⋮</Text>
                </Pressable>
              </View>

              {screen === 'home' && (
                <>
                  <Text style={styles.welcomeArabic}>
                    {tr(
                      'Welcome to Danat Build',
                      'مرحباً بك في دانات بيلد',
                      'Bienvenue chez Danat Build'
                    )}
                  </Text>

                  <Text style={styles.centerMuted}>
                    {tr(
                      'Choose your experience',
                      'اختر نوع الاستخدام',
                      'Choisissez votre mode'
                    )}
                  </Text>

                  <View
                    style={[
                      styles.modeRow,
                      isAr && styles.rowRTL,
                    ]}
                  >
                    <Pressable
                      onPress={() => setMode('professional')}
                      style={[
                        styles.modeCard,
                        mode === 'professional' && styles.modeActive,
                      ]}
                    >
                      <Text style={styles.modeEmoji}>👷</Text>

                      <Text style={styles.modeText}>
                        {tr(
                          'Professional',
                          'المهني',
                          'Professionnel'
                        )}
                      </Text>

                      <Text style={styles.modeHint}>
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
                        styles.modeCard,
                        mode === 'homeowner' && styles.modeActive,
                      ]}
                    >
                      <Text style={styles.modeEmoji}>🏡</Text>

                      <Text style={styles.modeText}>
                        {tr(
                          'Homeowner',
                          'صاحب المنزل',
                          'Propriétaire'
                        )}
                      </Text>

                      <Text style={styles.modeHint}>
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
                    style={styles.buildingCard}
                  >
                    <Text style={styles.buildingIcon}>🏗️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.buildingTitle}>
                        {tr(
                          'FULL BUILDING CALCULATOR',
                          'حاسبة البناء الشاملة',
                          'CALCULATEUR COMPLET DU BÂTIMENT'
                        )}
                      </Text>
                      <Text style={styles.buildingDesc}>
                        {tr(
                          'Calculate from foundations to finishing',
                          'احسب من الأساسات حتى التشطيبات',
                          'Des fondations jusqu’aux finitions'
                        )}
                      </Text>
                    </View>
                    <Text style={styles.buildingArrow}>›</Text>
                  </Pressable>
                  )}

                  <Text style={styles.section}>
                    {tr(
                      'QUICK CALCULATORS',
                      'أدوات الحساب السريعة',
                      'CALCULATEURS RAPIDES'
                    )}
                  </Text>

                  <View style={styles.toolGrid}>
                    {tools.map(renderToolCard)}
                  </View>

                  <View style={styles.tipBox}>
                    <Text style={styles.tipTitle}>
                      ✦ {tr(
                        'BUILD SMARTER',
                        'ابنِ بذكاء',
                        'CONSTRUIRE INTELLIGEMMENT'
                      )}
                    </Text>

                    <Text style={styles.tipText}>
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
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'building' && (
                <BuildingCalculatorScreen
                  language={lang}
                  mode={mode}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'profile' && (
                <ProfileScreen
                  language={lang}
                  mode={mode}
                  onSignOut={async () => {
                    await signOut(auth);
                    setScreen('auth');
                  }}
                />
              )}

              {screen === 'favorites' && (
                <>
                  <Text style={styles.h1}>
                    {tr(
                      'My Favorites',
                      'أدواتي المفضلة',
                      'Mes favoris'
                    )}
                  </Text>

                  {favourites.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyIcon}>☆</Text>

                      <Text style={styles.emptyText}>
                        {tr(
                          'No favorites yet. Add calculators using the star icon.',
                          'لا توجد أدوات مفضلة بعد. أضف الأدوات باستخدام علامة النجمة.',
                          'Aucun favori. Ajoutez des calculateurs avec l’étoile.'
                        )}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.toolGrid}>
                      {tools
                        .filter(tool => favourites.includes(tool.id))
                        .map(renderToolCard)}
                    </View>
                  )}
                </>
              )}

              {screen === 'menu' && (
                <>
                  <Text style={styles.h1}>
                    {tr('More', 'المزيد', 'Plus')}
                  </Text>

                  {[
                    tr('About Danat Build', 'عن دانات بيلد', 'À propos'),
                    tr('Tips & Guide', 'النصائح والإرشادات', 'Conseils'),
                    tr('Contact Us', 'اتصل بنا', 'Contact'),
                    tr('Settings', 'الإعدادات', 'Paramètres'),
                  ].map((item, index) => (
                    <Pressable
                      key={item}
                      style={styles.menuRow}
                    >
                      <Text style={styles.menuRowText}>
                        {['ⓘ', '♥', '☎', '⚙'][index]}   {item}
                      </Text>

                      <Text style={styles.menuArrow}>›</Text>
                    </Pressable>
                  ))}

                  <Text style={styles.section}>
                    {tr('LANGUAGE', 'اللغة', 'LANGUE')}
                  </Text>

                  <View style={styles.langRow}>
                    {(['en', 'ar', 'fr'] as const).map(language => (
                      <Pressable
                        key={language}
                        onPress={() => setLang(language)}
                        style={[
                          styles.langBtn,
                          lang === language && styles.langOn,
                        ]}
                      >
                        <Text
                          style={[
                            styles.langText,
                            lang === language && styles.langTextOn,
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
                styles.bottomNav,
                isAr && styles.rowRTL,
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
  modeEmoji: {
    fontSize: 35,
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
  buildingIcon: {
    fontSize: 32,
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