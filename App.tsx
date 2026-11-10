import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { calculateConcrete } from './src/calculators/concrete';

type Tool = { id: string; en: string; ar: string; fr: string; icon: string; desc: string };
const GOLD = '#E9B85D';
const tools: Tool[] = [
  { id:'concrete', en:'Concrete', ar:'حساب الباطون', fr:'Béton', icon:'🏗️', desc:'Volume and wastage' },
  { id:'tiles', en:'Tiles & Ceramics', ar:'السيراميك والبلاط', fr:'Carrelage', icon:'🔶', desc:'Floor and wall coverage' },
  { id:'paint', en:'Paint', ar:'الدهان', fr:'Peinture', icon:'🖌️', desc:'Paint quantity estimate' },
  { id:'blocks', en:'Blocks & Bricks', ar:'البلوك والطوب', fr:'Blocs & briques', icon:'🧱', desc:'Wall material quantities' },
  { id:'sand', en:'Sand & Cement', ar:'الرمل والإسمنت', fr:'Sable & ciment', icon:'⛰️', desc:'Basic mix estimates' },
  { id:'cost', en:'Project Cost', ar:'تكلفة المشروع', fr:'Coût du projet', icon:'🧮', desc:'Materials and labour' },
];

export default function App() {
  const [lang, setLang] = useState<'en'|'ar'|'fr'>('en');
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState('professional');
  const [selected, setSelected] = useState('concrete');
  const [length, setLength] = useState('5.0');
  const [width, setWidth] = useState('4.0');
  const [thickness, setThickness] = useState('0.15');
  const [waste, setWaste] = useState('10');
  const [calculated, setCalculated] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const isAr = lang === 'ar';
  const rtl = isAr ? 'right' : 'left';
  const tr = (en:string, ar:string, fr:string) => lang === 'ar' ? ar : lang === 'fr' ? fr : en;
  const activeTool = tools.find(t => t.id === selected) || tools[0];
  const concrete = useMemo(() => {
    try { return calculateConcrete(Number(length), Number(width), Number(thickness), Number(waste)); }
    catch { return null; }
  }, [length, width, thickness, waste]);
  const title = (tool:Tool) => lang === 'ar' ? tool.ar : lang === 'fr' ? tool.fr : tool.en;
  const openTool = (id:string) => { setSelected(id); setCalculated(false); setScreen('calculator'); };
  const nav = (target:string, label:string, icon:string) => <Pressable onPress={() => setScreen(target)} style={s.navItem}><Text style={[s.navIcon, screen===target && {color:GOLD}]}>{icon}</Text><Text style={[s.navLabel, screen===target && {color:GOLD}]}>{label}</Text></Pressable>;
  const field = (label:string, value:string, setter:(v:string)=>void) => <View style={s.field}><Text style={[s.label,{textAlign:rtl}]}>{label}</Text><TextInput value={value} onChangeText={v=>{setter(v);setCalculated(false);}} keyboardType="decimal-pad" style={s.input} placeholderTextColor="#888" /></View>;

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor="#080B0E" />
    {screen === 'welcome' ? <ScrollView contentContainerStyle={s.welcome}>
      <View style={s.logoSymbol}><Text style={s.shell}>✿</Text><Text style={s.pearl}>●</Text></View>
      <Text style={s.welcomeBrand}>DANAT</Text><Text style={s.welcomeBrand}>BUILD</Text>
      <Text style={s.welcomeSub}>SMART CONSTRUCTION</Text><Text style={s.welcomeSub}>CALCULATOR</Text>
      <View style={s.welcomeRule}/><Text style={s.script}>{tr('Build Smarter.\nCalculate Better.','ابنِ بذكاء.\nاحسب بدقة.','Construisez mieux.\nCalculez juste.')}</Text>
      <View style={s.langRow}>{(['en','ar','fr'] as const).map(l=><Pressable key={l} onPress={()=>setLang(l)} style={[s.langBtn,lang===l&&s.langOn]}><Text style={[s.langText,lang===l&&s.langTextOn]}>{l==='en'?'English':l==='ar'?'العربية':'Français'}</Text></Pressable>)}</View>
      <Pressable style={s.goldButton} onPress={()=>setScreen('home')}><Text style={s.goldButtonText}>{tr('GET STARTED  ›','ابدأ الآن  ›','COMMENCER  ›')}</Text></Pressable>
      <Text style={s.footerTag}>DANAT BUILD  •  BUILD SMARTER</Text>
    </ScrollView> : <>
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.topbar}><Pressable onPress={()=>setScreen('home')}><Text style={s.backIcon}>{screen==='home'?'☰':'‹'}</Text></Pressable><View style={{flex:1}}><Text style={s.brand}>✿ DANAT BUILD</Text><Text style={s.topSub}>SMART CONSTRUCTION CALCULATOR</Text></View><Pressable onPress={()=>setScreen('menu')}><Text style={s.menuIcon}>⋮</Text></Pressable></View>
        {screen==='home' && <>
          <Text style={s.welcomeArabic}>{tr('Welcome to Danat Build','مرحباً بك في دانات بيلد','Bienvenue chez Danat Build')}</Text>
          <Text style={s.centerMuted}>{tr('Choose your experience','اختر نوع الاستخدام','Choisissez votre mode')}</Text>
          <View style={s.modeRow}>{[['professional','👷',tr('Professional','المهني','Professionnel')],['homeowner','🏡',tr('Homeowner','صاحب المنزل','Propriétaire')]].map(([id,ic,label])=><Pressable key={String(id)} onPress={()=>setMode(String(id))} style={[s.modeCard,mode===id&&s.modeActive]}><Text style={s.modeEmoji}>{ic}</Text><Text style={s.modeText}>{label}</Text><Text style={s.modeHint}>{id==='professional'?tr('Advanced tools','أدوات متقدمة','Outils avancés'):tr('Simple estimates','حسابات بسيطة','Estimations simples')}</Text></Pressable>)}</View>
          <Text style={s.section}>{tr('QUICK CALCULATORS','أدوات الحساب السريعة','CALCULATEURS RAPIDES')}</Text>
          <View style={s.toolGrid}>{tools.map(tool=><Pressable key={tool.id} onPress={()=>openTool(tool.id)} style={s.toolCard}><Text style={s.toolEmoji}>{tool.icon}</Text><Text style={s.toolTitle}>{title(tool)}</Text><Text style={s.toolDesc}>{tr(tool.desc,tool.id==='concrete'?'الحجم والهدر':tool.id==='tiles'?'مساحة الأرض والجدران':'تقدير الكميات',tool.desc)}</Text></Pressable>)}</View>
          <View style={s.tipBox}><Text style={s.tipTitle}>✦ {tr('BUILD SMARTER','ابنِ بذكاء','CONSTRUIRE INTELLIGEMMENT')}</Text><Text style={s.tipText}>{tr('Plan quantities before you buy materials.','خطط لكميات المواد قبل الشراء.','Planifiez les quantités avant vos achats.')}</Text></View>
        </>}
        {screen==='calculator' && <>
          <Pressable onPress={()=>setScreen('home')}><Text style={s.backText}>‹  {tr('Back to calculators','العودة إلى الأدوات','Retour aux calculateurs')}</Text></Pressable>
          <View style={s.calcTitleRow}><Text style={s.calcEmoji}>{activeTool.icon}</Text><View style={{flex:1}}><Text style={s.h1}>{title(activeTool)}</Text><Text style={s.centerMuted}>{tr(activeTool.desc, 'أدخل القياسات للحصول على تقدير', activeTool.desc)}</Text></View><Pressable onPress={()=>setFavourites(old=>old.includes(selected)?old.filter(x=>x!==selected):[...old,selected])}><Text style={s.star}>{favourites.includes(selected)?'★':'☆'}</Text></Pressable></View>
          {selected==='concrete' ? <>
            <View style={s.photoPlaceholder}><Text style={s.photoEmoji}>🏗️</Text><Text style={s.photoText}>{tr('CONCRETE VOLUME ESTIMATE','تقدير حجم الباطون','ESTIMATION DU VOLUME DE BÉTON')}</Text></View>
            <View style={s.formCard}>{field(tr('Length (m)','الطول (متر)','Longueur (m)'),length,setLength)}{field(tr('Width (m)','العرض (متر)','Largeur (m)'),width,setWidth)}{field(tr('Thickness (m)','السماكة (متر)','Épaisseur (m)'),thickness,setThickness)}{field(tr('Wastage (%)','نسبة الهدر (%)','Perte (%)'),waste,setWaste)}
              <Pressable style={s.goldButton} onPress={()=>setCalculated(true)}><Text style={s.goldButtonText}>▦  {tr('CALCULATE RESULT','احسب النتيجة','CALCULER')}</Text></Pressable>
            </View>
            {calculated && <View style={s.resultCard}><Text style={s.resultLabel}>{tr('CONCRETE REQUIRED','حجم الباطون المطلوب','BÉTON NÉCESSAIRE')}  ✓</Text><Text style={s.resultValue}>{concrete===null?'—':concrete.toFixed(2)+' m³'}</Text><Text style={s.resultHint}>{tr('Including','مع','Incluant')} {waste}% {tr('wastage','هدر','de perte')}</Text></View>}
          </> : <View style={s.comingCard}><Text style={s.comingIcon}>{activeTool.icon}</Text><Text style={s.h1}>{tr('Calculator design ready','تصميم الحاسبة جاهز','Design du calculateur prêt')}</Text><Text style={s.centerMuted}>{tr('This calculator screen is designed. Its calculation formula and material assumptions will be implemented and checked in the next development step.','تم تجهيز تصميم هذه الحاسبة. ستتم إضافة معادلات الحساب وافتراضات المواد والتحقق منها في المرحلة التالية.','Cet écran est conçu. Les formules et hypothèses de matériaux seront ajoutées et vérifiées à la prochaine étape.')}</Text></View>}
        </>}
        {screen==='menu' && <><Text style={s.h1}>{tr('More','المزيد','Plus')}</Text>{['About Danat Build','Tips & Guide','Contact Us','Settings','Language'].map((item,i)=><Pressable key={item} style={s.menuRow} onPress={()=>i===4&&setScreen('home')}><Text style={s.menuRowText}>{['ⓘ','♥','☎','⚙','◎'][i]}   {item}</Text><Text style={s.menuArrow}>›</Text></Pressable>)}</>}
      </ScrollView>
      <View style={s.bottomNav}>{nav('home',tr('Home','الرئيسية','Accueil'),'⌂')}{nav('favorites',tr('Favorites','المفضلة','Favoris'),'☆')}{nav('menu',tr('More','المزيد','Plus'),'•••')}</View>
    </>}
  </SafeAreaView>;
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#080B0E'},page:{paddingHorizontal:18,paddingTop:12,paddingBottom:28},welcome:{flexGrow:1,alignItems:'center',justifyContent:'center',padding:26,backgroundColor:'#080B0E'},logoSymbol:{width:116,height:100,alignItems:'center',justifyContent:'center',marginBottom:14},shell:{fontSize:88,color:GOLD,lineHeight:96},pearl:{position:'absolute',fontSize:36,color:'#fff',top:33},welcomeBrand:{fontSize:46,fontWeight:'300',letterSpacing:5,color:GOLD,lineHeight:48},welcomeSub:{fontSize:14,letterSpacing:3,color:'#f5f3ef',marginTop:4},welcomeRule:{width:110,height:2,backgroundColor:GOLD,marginVertical:28},script:{color:GOLD,fontSize:21,fontStyle:'italic',textAlign:'center',lineHeight:30,marginBottom:30},langRow:{flexDirection:'row',gap:8,marginBottom:28},langBtn:{borderWidth:1,borderColor:'#514b40',borderRadius:30,paddingVertical:11,paddingHorizontal:15},langOn:{backgroundColor:GOLD,borderColor:GOLD},langText:{color:'#eee',fontSize:12},langTextOn:{color:'#17110a',fontWeight:'800'},goldButton:{backgroundColor:GOLD,borderRadius:14,paddingVertical:16,paddingHorizontal:18,alignItems:'center',justifyContent:'center',width:'100%',shadowColor:GOLD,shadowOpacity:.2,shadowRadius:12,elevation:4},goldButtonText:{color:'#17110a',fontWeight:'900',fontSize:15,letterSpacing:.5},footerTag:{color:'#777',fontSize:9,letterSpacing:2,marginTop:35},topbar:{flexDirection:'row',alignItems:'center',gap:14,paddingBottom:16,borderBottomWidth:1,borderBottomColor:'#4b3c25',marginBottom:20},backIcon:{fontSize:29,color:'#fff',width:28},brand:{color:GOLD,fontSize:19,fontWeight:'900',letterSpacing:2},topSub:{fontSize:8,color:'#b8b8b8',letterSpacing:1.5,marginTop:3},menuIcon:{fontSize:27,color:GOLD},welcomeArabic:{fontSize:22,color:'#fff',fontWeight:'800',textAlign:'center',marginTop:6},centerMuted:{color:'#b7bbc0',fontSize:12,textAlign:'center',marginTop:5,lineHeight:19},modeRow:{flexDirection:'row',gap:12,marginTop:20},modeCard:{flex:1,backgroundColor:'#191e24',borderWidth:1,borderColor:'#66553a',borderRadius:16,padding:14,alignItems:'center',minHeight:130,justifyContent:'center'},modeActive:{borderColor:GOLD,backgroundColor:'#242019'},modeEmoji:{fontSize:35,marginBottom:8},modeText:{fontSize:16,color:GOLD,fontWeight:'800'},modeHint:{fontSize:11,color:'#ddd',marginTop:5,textAlign:'center'},section:{color:GOLD,fontSize:12,fontWeight:'900',letterSpacing:1.3,marginTop:26,marginBottom:13},toolGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},toolCard:{width:'48%',minHeight:125,backgroundColor:'#191e24',borderWidth:1,borderColor:'#5b5142',borderRadius:15,alignItems:'center',justifyContent:'center',padding:12},toolEmoji:{fontSize:31,marginBottom:7},toolTitle:{color:'#fff',fontSize:14,fontWeight:'800',textAlign:'center'},toolDesc:{color:'#aeb2b8',fontSize:10,marginTop:5,textAlign:'center'},tipBox:{marginTop:22,padding:16,borderRadius:14,backgroundColor:'#171b20',borderWidth:1,borderColor:'#57472d'},tipTitle:{color:GOLD,fontWeight:'900',fontSize:12},tipText:{color:'#c7c9cb',fontSize:12,marginTop:6},backText:{color:GOLD,fontSize:14,marginBottom:20},calcTitleRow:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:18},calcEmoji:{fontSize:36},h1:{fontSize:22,color:'#fff',fontWeight:'800'},star:{fontSize:29,color:GOLD},photoPlaceholder:{height:130,backgroundColor:'#20262c',borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#5b513f',marginBottom:15},photoEmoji:{fontSize:45},photoText:{color:GOLD,fontSize:10,fontWeight:'900',letterSpacing:1.4,marginTop:5},formCard:{backgroundColor:'#171c22',borderRadius:16,padding:15,borderWidth:1,borderColor:'#3c3e40'},field:{marginBottom:13},label:{color:'#e9e9e9',fontSize:13,marginBottom:7},input:{backgroundColor:'#292f36',color:'#fff',borderRadius:10,padding:13,fontSize:16,borderWidth:1,borderColor:'#45484d'},resultCard:{marginTop:17,backgroundColor:'#20272b',borderRadius:16,padding:20,alignItems:'center',borderWidth:1,borderColor:'#6c5938'},resultLabel:{color:'#eee',fontSize:13,fontWeight:'700'},resultValue:{color:GOLD,fontSize:36,fontWeight:'900',marginVertical:8},resultHint:{color:'#c4c7ca',fontSize:12},comingCard:{backgroundColor:'#191e24',borderWidth:1,borderColor:'#625239',borderRadius:18,padding:24,alignItems:'center',marginTop:25},comingIcon:{fontSize:54,marginBottom:16},bottomNav:{height:66,backgroundColor:'#101419',borderTopWidth:1,borderTopColor:'#363a3d',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',justifyContent:'center',minWidth:75},navIcon:{color:'#ddd',fontSize:23},navLabel:{color:'#aaa',fontSize:10,marginTop:2},menuRow:{paddingVertical:18,borderBottomWidth:1,borderBottomColor:'#333',flexDirection:'row',justifyContent:'space-between'},menuRowText:{color:'#eee',fontSize:16},menuArrow:{color:GOLD,fontSize:22}});
