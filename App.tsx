import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { calculateConcrete } from './src/calculators/concrete';

type Screen = 'home' | 'concrete' | 'summary';
const gold = '#e9b85d';
const dark = '#080b0e';
const panel = '#171c22';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [language, setLanguage] = useState<'en'|'ar'|'fr'>('en');
  const [length, setLength] = useState('5');
  const [width, setWidth] = useState('4');
  const [thickness, setThickness] = useState('0.15');
  const [waste, setWaste] = useState('10');
  const [result, setResult] = useState<number | null>(null);

  const isAr = language === 'ar';
  const t = (en: string, ar: string, fr: string) => language === 'ar' ? ar : language === 'fr' ? fr : en;

  const tile = (title: string, subtitle: string, onPress: () => void, icon: string) => (
    <Pressable onPress={onPress} style={styles.tile}>
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{subtitle}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={dark} />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logoMark}>✺</Text>
          <View>
            <Text style={styles.brand}>DANAT BUILD</Text>
            <Text style={styles.tagline}>SMART CONSTRUCTION CALCULATOR</Text>
          </View>
        </View>

        {screen === 'home' && <>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{t('BUILD SMARTER', 'ابنِ بذكاء', 'CONSTRUIRE INTELLIGEMMENT')}</Text>
            <Text style={styles.heading}>{t('Welcome to Danat Build', 'مرحباً بك في دانات بيلد', 'Bienvenue chez Danat Build')}</Text>
            <Text style={styles.muted}>{t('Choose a tool to estimate materials and project costs.', 'اختر الأداة لتقدير المواد وتكاليف المشروع.', 'Choisissez un outil pour estimer les matériaux et les coûts.')}</Text>
          </View>
          <View style={styles.languageRow}>
            {(['en','ar','fr'] as const).map(lang => <Pressable key={lang} onPress={() => setLanguage(lang)} style={[styles.lang, language === lang && styles.langActive]}><Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : 'Français'}</Text></Pressable>)}
          </View>
          <Text style={styles.sectionTitle}>{t('SELECT YOUR MODE', 'اختر طريقة الاستخدام', 'CHOISIR UN MODE')}</Text>
          <View style={styles.grid}>
            {tile(t('Professional','المهني','Professionnel'), t('Advanced tools','أدوات متقدمة','Outils avancés'), () => setScreen('concrete'), '👷')}
            {tile(t('Homeowner','صاحب المنزل','Propriétaire'), t('Simple estimates','حسابات بسيطة','Estimations simples'), () => setScreen('concrete'), '🏡')}
          </View>
          <Text style={styles.sectionTitle}>{t('QUICK CALCULATORS','أدوات الحساب السريعة','CALCULATEURS RAPIDES')}</Text>
          <View style={styles.grid}>
            {tile(t('Concrete','الباطون','Béton'), t('Volume & wastage','الحجم والهدر','Volume et perte'), () => setScreen('concrete'), '🚧')}
            {tile(t('Tiles & ceramics','السيراميك والبلاط','Carrelage'), t('Floor and wall area','مساحة الأرض والجدران','Surface'), () => setScreen('concrete'), '🔶')}
            {tile(t('Paint','الدهان','Peinture'), t('Coverage estimate','تقدير التغطية','Estimation'), () => setScreen('concrete'), '🖌️')}
            {tile(t('Blocks & bricks','البلوك والطوب','Blocs & briques'), t('Quantity estimate','تقدير الكمية','Quantité'), () => setScreen('concrete'), '🧱')}
            {tile(t('Sand & cement','الرمل والإسمنت','Sable & ciment'), t('Material quantities','كميات المواد','Quantités'), () => setScreen('concrete'), '🏗️')}
            {tile(t('Project cost','تكلفة المشروع','Coût du projet'), t('Materials + labour','المواد والعمالة','Matériaux + main-d’œuvre'), () => setScreen('summary'), '🧮')}
          </View>
        </>}

        {screen === 'concrete' && <>
          <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹  {t('Back to home','العودة للرئيسية','Retour')}</Text></Pressable>
          <Text style={styles.heading}>{t('Concrete calculator','حساب الباطون','Calculateur de béton')}</Text>
          <Text style={styles.muted}>{t('Enter dimensions in metres.','أدخل الأبعاد بالمتر.','Saisissez les dimensions en mètres.')}</Text>
          <View style={styles.form}>
            {[[t('Length (m)','الطول (متر)','Longueur (m)'), length, setLength],[t('Width (m)','العرض (متر)','Largeur (m)'), width, setWidth],[t('Thickness (m)','السماكة (متر)','Épaisseur (m)'), thickness, setThickness],[t('Wastage (%)','نسبة الهدر (%)','Perte (%)'), waste, setWaste]].map(([label, value, setter]: any) => (
              <View key={label} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput value={value} onChangeText={setter} keyboardType="decimal-pad" style={styles.input} placeholderTextColor="#777" />
              </View>
            ))}
            <Pressable style={styles.primary} onPress={() => setResult(calculateConcrete(Number(length), Number(width), Number(thickness), Number(waste)))}>
              <Text style={styles.primaryText}>{t('CALCULATE RESULT','احسب النتيجة','CALCULER')}</Text>
            </Pressable>
          </View>
          {result !== null && <View style={styles.result}>
            <Text style={styles.muted}>{t('CONCRETE REQUIRED','حجم الباطون المطلوب','BÉTON NÉCESSAIRE')}</Text>
            <Text style={styles.resultNumber}>{result.toFixed(2)} m³</Text>
            <Text style={styles.muted}>{t('Includes your wastage allowance.','يشمل نسبة الهدر المحددة.','Perte incluse.')}</Text>
          </View>}
          <Pressable onPress={() => setScreen('summary')} style={styles.secondary}><Text style={styles.secondaryText}>{t('PROJECT SUMMARY','ملخص المشروع','RÉSUMÉ DU PROJET')} →</Text></Pressable>
        </>}

        {screen === 'summary' && <>
          <Pressable onPress={() => setScreen('home')}><Text style={styles.back}>‹  {t('Back to home','العودة للرئيسية','Retour')}</Text></Pressable>
          <Text style={styles.heading}>{t('Project summary','ملخص المشروع','Résumé du projet')}</Text>
          <View style={styles.result}>
            <Text style={styles.sectionTitle}>{t('YOUR ESTIMATE','التقدير الخاص بك','VOTRE ESTIMATION')}</Text>
            <Text style={styles.muted}>{t('Concrete volume','حجم الباطون','Volume de béton')}</Text>
            <Text style={styles.resultNumber}>{(result ?? calculateConcrete(Number(length), Number(width), Number(thickness), Number(waste))).toFixed(2)} m³</Text>
            <Text style={styles.note}>{t('Price estimates, labour costs, PDF export and saved projects are planned for the next development stage.','تقدير الأسعار وتكاليف العمالة وتصدير PDF وحفظ المشاريع ضمن المرحلة التالية.','Les prix, la main-d’œuvre, l’export PDF et les projets sauvegardés seront ajoutés ensuite.')}</Text>
          </View>
        </>}

        <View style={styles.footer}><Text style={styles.footerText}>DANAT BUILD  •  {t('BUILD SMARTER. CALCULATE BETTER.','ابنِ بذكاء. احسب بدقة.','CONSTRUIRE MIEUX. CALCULER JUSTE.')}</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:dark}, page:{padding:20,paddingBottom:40}, header:{flexDirection:'row',alignItems:'center',gap:12,borderBottomWidth:1,borderBottomColor:'#5b4829',paddingBottom:18,marginBottom:24}, logoMark:{fontSize:44,color:gold}, brand:{fontSize:25,fontWeight:'900',letterSpacing:2,color:gold}, tagline:{fontSize:9,letterSpacing:2,color:'#ddd',marginTop:3}, hero:{paddingVertical:18}, eyebrow:{color:gold,fontSize:12,fontWeight:'800',letterSpacing:2,marginBottom:10}, heading:{fontSize:27,fontWeight:'800',color:'#fff',marginBottom:8}, muted:{color:'#b7bbc0',fontSize:14,lineHeight:22}, languageRow:{flexDirection:'row',gap:8,marginVertical:14}, lang:{borderWidth:1,borderColor:'#555',borderRadius:22,paddingVertical:9,paddingHorizontal:16},langActive:{backgroundColor:gold,borderColor:gold},langText:{color:'#fff',fontSize:12},langTextActive:{color:'#15100a',fontWeight:'800'}, sectionTitle:{color:gold,fontSize:12,fontWeight:'800',letterSpacing:1.5,marginTop:24,marginBottom:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{width:'48%',minHeight:112,backgroundColor:panel,borderWidth:1,borderColor:'#5b513e',borderRadius:16,padding:14,alignItems:'center',justifyContent:'center'},tileIcon:{fontSize:28,marginBottom:7},tileTitle:{color:'#fff',fontWeight:'800',fontSize:15},tileSub:{color:'#b7bbc0',fontSize:11,marginTop:4,textAlign:'center'},back:{color:gold,fontSize:16,marginBottom:22},form:{backgroundColor:panel,borderRadius:18,padding:16,marginTop:20,borderWidth:1,borderColor:'#4b4437'},field:{marginBottom:14},label:{color:'#eee',fontSize:13,marginBottom:7},input:{backgroundColor:'#292f36',color:'#fff',padding:13,borderRadius:10,fontSize:16,borderWidth:1,borderColor:'#444'},primary:{backgroundColor:gold,borderRadius:12,padding:16,alignItems:'center',marginTop:8},primaryText:{color:'#17110a',fontWeight:'900',letterSpacing:1},result:{backgroundColor:'#1c2428',borderRadius:18,padding:22,marginTop:20,borderWidth:1,borderColor:'#75603a'},resultNumber:{color:gold,fontSize:38,fontWeight:'900',marginVertical:10},secondary:{padding:16,borderRadius:12,borderWidth:1,borderColor:gold,marginTop:16,alignItems:'center'},secondaryText:{color:gold,fontWeight:'800'},note:{color:'#c9cdd0',lineHeight:21,marginTop:12},footer:{marginTop:36,borderTopWidth:1,borderTopColor:'#353535',paddingTop:18,alignItems:'center'},footerText:{fontSize:9,color:'#92979d',letterSpacing:1,textAlign:'center'}
});
