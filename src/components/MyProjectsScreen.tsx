import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet,TextInput,Alert} from 'react-native';
import {getLocalProjects,deleteLocalProject,deleteLocalCalculation,renameLocalProject,LocalProject,SavedCalculation} from '../storage/localProjects';
type Props={language:'en'|'ar'|'fr';theme:'dark'|'light';userId:string;onBack:()=>void;onOpen:(calculation:SavedCalculation)=>void};
const GOLD='#E9B85D';
export default function MyProjectsScreen({language,theme,userId,onBack,onOpen}:Props){
 const [projects,setProjects]=useState<LocalProject[]>([]);
 const [loading,setLoading]=useState(true);
 const [editingId,setEditingId]=useState<string|null>(null);
 const [editName,setEditName]=useState('');
 const [message,setMessage]=useState('');
 const t=(en:string,ar:string,fr:string)=>language==='ar'?ar:language==='fr'?fr:en;
 const refresh=useCallback(async()=>{setLoading(true);setProjects(await getLocalProjects(userId));setLoading(false);},[userId]);
 useEffect(()=>{refresh();},[refresh]);
 const confirmDeleteProject=(project:LocalProject)=>{
  Alert.alert(t('Delete project?','حذف المشروع؟','Supprimer le projet ?'),t('This also deletes all saved calculations in this project.','سيؤدي ذلك أيضاً إلى حذف جميع الحسابات المحفوظة في هذا المشروع.','Cela supprimera aussi tous les calculs enregistrés dans ce projet.'),[
   {text:t('Cancel','إلغاء','Annuler'),style:'cancel'},
   {text:t('Delete','حذف','Supprimer'),style:'destructive',onPress:async()=>setProjects(await deleteLocalProject(userId,project.id))}
  ]);
 };
 const confirmDeleteCalculation=(project:LocalProject,item:SavedCalculation)=>{
  Alert.alert(t('Delete calculation?','حذف الحساب؟','Supprimer le calcul ?'),t('This saved calculation will be permanently removed.','سيتم حذف هذا الحساب المحفوظ نهائياً.','Ce calcul enregistré sera définitivement supprimé.'),[
   {text:t('Cancel','إلغاء','Annuler'),style:'cancel'},
   {text:t('Delete','حذف','Supprimer'),style:'destructive',onPress:async()=>setProjects(await deleteLocalCalculation(userId,project.id,item.id))}
  ]);
 };
 const saveRename=async(projectId:string)=>{
  try{setProjects(await renameLocalProject(userId,projectId,editName));setEditingId(null);setMessage(t('Project name updated.','تم تحديث اسم المشروع.','Nom du projet mis à jour.'));}
  catch(error){setMessage(error instanceof Error?error.message:'Could not rename project.');}
 };
 return <ScrollView contentContainerStyle={styles.container}>
  <Pressable onPress={onBack}><Text style={styles.back}>{t('‹ Back','‹ العودة','‹ Retour')}</Text></Pressable>
  <Text style={[styles.title,theme==='light'&&styles.lightText]}>{t('My Projects','مشاريعي','Mes projets')}</Text>
  <Text style={styles.subtitle}>{t('Manage your saved projects and calculations on this device.','إدارة مشاريعك وحساباتك المحفوظة على هذا الجهاز.','Gérez vos projets et calculs enregistrés sur cet appareil.')}</Text>
  {!!message&&<Text style={styles.message}>{message}</Text>}
  {loading?<Text style={styles.muted}>{t('Loading…','جارٍ التحميل…','Chargement…')}</Text>:projects.length===0?<View style={styles.card}><Text style={styles.empty}>{t('No projects yet. From a calculator, enter a project name and tap Save to Project.','لا توجد مشاريع بعد. من شاشة الحاسبة، أدخل اسم المشروع واضغط حفظ في المشروع.','Aucun projet. Dans un calculateur, saisissez un nom de projet puis appuyez sur Enregistrer.')}</Text></View>:projects.map(project=><View key={project.id} style={styles.card}>
   {editingId===project.id?<View style={styles.editBox}>
    <TextInput value={editName} onChangeText={setEditName} placeholder={t('Project name','اسم المشروع','Nom du projet')} placeholderTextColor="#888" style={styles.input}/>
    <View style={styles.actions}>
     <Pressable onPress={()=>saveRename(project.id)} style={styles.smallButton}><Text style={styles.smallButtonText}>{t('Save','حفظ','Enregistrer')}</Text></Pressable>
     <Pressable onPress={()=>setEditingId(null)}><Text style={styles.cancel}>{t('Cancel','إلغاء','Annuler')}</Text></Pressable>
    </View>
   </View>:<View style={styles.row}>
    <Text style={styles.projectName}>{project.name}</Text>
    <Pressable onPress={()=>{setEditingId(project.id);setEditName(project.name);setMessage('');}}><Text style={styles.edit}>{t('Rename','إعادة تسمية','Renommer')}</Text></Pressable>
    <Pressable onPress={()=>confirmDeleteProject(project)}><Text style={styles.delete}>{t('Delete','حذف','Supprimer')}</Text></Pressable>
   </View>}
   <Text style={styles.muted}>{project.calculations.length} {t('saved calculations','حسابات محفوظة','calculs enregistrés')}</Text>
   {project.calculations.map(item=><View key={item.id} style={styles.calculation}>
    <Pressable onPress={()=>onOpen({...item,projectName:project.name})} style={styles.openRow} accessibilityRole="button">
     <View style={{flex:1}}><Text style={styles.calcTitle}>{item.title}</Text><Text style={styles.muted}>{new Date(item.savedAt).toLocaleString()}</Text></View>
     <Text style={styles.openLabel}>{t('OPEN ›','فتح ›','OUVRIR ›')}</Text>
    </Pressable>
    <View style={styles.calculationActions}>
     <Pressable onPress={()=>confirmDeleteCalculation(project,item)} style={styles.removeCalculation}><Text style={styles.delete}>{t('Delete calculation','حذف الحساب','Supprimer le calcul')}</Text></Pressable>
    </View>
   </View>)}
  </View>)}
  <Text style={styles.footnote}>{t('Local only — not uploaded to Firebase. Clearing app data or uninstalling the app can erase these projects.','محلياً فقط — لا تُرفع إلى Firebase. قد يؤدي مسح بيانات التطبيق أو حذفه إلى فقدان المشاريع.','Stockage local uniquement — aucun envoi à Firebase. Effacer les données ou désinstaller l’application peut supprimer ces projets.')}</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
 container:{padding:18,paddingBottom:40},back:{color:GOLD,fontSize:15,marginBottom:18},title:{color:'#fff',fontSize:24,fontWeight:'900'},lightText:{color:'#27231c'},
 subtitle:{color:'#b7bbc0',fontSize:12,lineHeight:19,marginTop:7,marginBottom:18},card:{backgroundColor:'#171c22',borderRadius:14,padding:15,borderWidth:1,borderColor:'#51432f',marginBottom:12},
 empty:{color:'#ddd',textAlign:'center',lineHeight:22},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},projectName:{color:GOLD,fontSize:16,fontWeight:'900',flex:1},
 delete:{color:'#ff8d8d',fontSize:11},edit:{color:GOLD,fontSize:11,fontWeight:'800'},muted:{color:'#aeb4bb',fontSize:10,marginTop:6},
 calculation:{borderTopWidth:1,borderTopColor:'#3b4145',paddingTop:9,marginTop:9},calcTitle:{color:'#eee',fontSize:12,fontWeight:'700'},openRow:{flexDirection:'row',alignItems:'center',gap:10},
 openLabel:{color:GOLD,fontSize:11,fontWeight:'900'},footnote:{color:'#999',fontSize:10,lineHeight:16,marginTop:12},message:{color:GOLD,fontSize:12,marginBottom:10},
 editBox:{gap:9},input:{backgroundColor:'#292f36',color:'#fff',borderRadius:9,padding:11,borderWidth:1,borderColor:'#6c5938'},actions:{flexDirection:'row',alignItems:'center',gap:14},
 smallButton:{backgroundColor:GOLD,paddingHorizontal:16,paddingVertical:8,borderRadius:8},smallButtonText:{color:'#171717',fontSize:11,fontWeight:'900'},cancel:{color:'#c5c5c5',fontSize:11},
 calculationActions:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:9},removeCalculation:{alignSelf:'flex-end',paddingTop:7}
});
