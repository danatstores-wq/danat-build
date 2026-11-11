import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet} from 'react-native';
import {getLocalProjects,deleteLocalProject,LocalProject} from '../storage/localProjects';
type Props={language:'en'|'ar'|'fr';theme:'dark'|'light';userId:string;onBack:()=>void};const GOLD='#E9B85D';
export default function MyProjectsScreen({language,theme,userId,onBack}:Props){
 const [projects,setProjects]=useState<LocalProject[]>([]);const [loading,setLoading]=useState(true);
 const t=(en:string,ar:string,fr:string)=>language==='ar'?ar:language==='fr'?fr:en;
 const refresh=useCallback(async()=>{setLoading(true);setProjects(await getLocalProjects(userId));setLoading(false);},[userId]);useEffect(()=>{refresh();},[refresh]);
 return <ScrollView contentContainerStyle={styles.container}>
 <Pressable onPress={onBack}><Text style={styles.back}>{t('‹ Back','‹ العودة','‹ Retour')}</Text></Pressable>
 <Text style={[styles.title,theme==='light'&&styles.lightText]}>{t('My Projects','مشاريعي','Mes projets')}</Text>
 <Text style={styles.subtitle}>{t('Projects and calculations are stored only on this device.','تُحفظ المشاريع والحسابات على هذا الجهاز فقط.','Les projets et calculs sont enregistrés uniquement sur cet appareil.')}</Text>
 {loading?<Text style={styles.muted}>{t('Loading…','جارٍ التحميل…','Chargement…')}</Text>:projects.length===0?<View style={styles.card}><Text style={styles.empty}>{t('No projects yet. From a calculator, enter a project name and tap Save to Project.','لا توجد مشاريع بعد. من شاشة الحاسبة، أدخل اسم المشروع واضغط حفظ في المشروع.','Aucun projet. Dans un calculateur, saisissez un nom de projet puis appuyez sur Enregistrer.')}</Text></View>:projects.map(project=><View key={project.id} style={styles.card}>
 <View style={styles.row}><Text style={styles.projectName}>{project.name}</Text><Pressable onPress={async()=>setProjects(await deleteLocalProject(userId,project.id))}><Text style={styles.delete}>{t('Delete','حذف','Supprimer')}</Text></Pressable></View>
 <Text style={styles.muted}>{project.calculations.length} {t('saved calculations','حسابات محفوظة','calculs enregistrés')}</Text>
 {project.calculations.map(item=><View key={item.id} style={styles.calculation}><Text style={styles.calcTitle}>{item.title}</Text><Text style={styles.muted}>{new Date(item.savedAt).toLocaleString()}</Text></View>)}
 </View>)}
 <Text style={styles.footnote}>{t('Local only — not uploaded to Firebase. Clearing app data or uninstalling the app can erase these projects.','محلياً فقط — لا تُرفع إلى Firebase. قد يؤدي مسح بيانات التطبيق أو حذفه إلى فقدان المشاريع.','Stockage local uniquement — aucun envoi à Firebase. Effacer les données ou désinstaller l’application peut supprimer ces projets.')}</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({container:{padding:18,paddingBottom:40},back:{color:GOLD,fontSize:15,marginBottom:18},title:{color:'#fff',fontSize:24,fontWeight:'900'},lightText:{color:'#27231c'},subtitle:{color:'#b7bbc0',fontSize:12,lineHeight:19,marginTop:7,marginBottom:18},card:{backgroundColor:'#171c22',borderRadius:14,padding:15,borderWidth:1,borderColor:'#51432f',marginBottom:12},empty:{color:'#ddd',textAlign:'center',lineHeight:22},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},projectName:{color:GOLD,fontSize:16,fontWeight:'900',flex:1},delete:{color:'#ff8d8d',fontSize:11},muted:{color:'#aeb4bb',fontSize:10,marginTop:6},calculation:{borderTopWidth:1,borderTopColor:'#3b4145',paddingTop:9,marginTop:9},calcTitle:{color:'#eee',fontSize:12,fontWeight:'700'},footnote:{color:'#999',fontSize:10,lineHeight:16,marginTop:12}});
