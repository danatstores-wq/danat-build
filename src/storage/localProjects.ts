import AsyncStorage from '@react-native-async-storage/async-storage';
export type SavedCalculation={id:string;title:string;kind:'quick'|'building';savedAt:string;payload:Record<string,unknown>};
export type LocalProject={id:string;name:string;createdAt:string;calculations:SavedCalculation[]};
const storageKey=(userId:string)=>`danatBuildProjects:${userId||'guest'}`;
export async function getLocalProjects(userId:string):Promise<LocalProject[]>{try{const raw=await AsyncStorage.getItem(storageKey(userId));const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[];}catch(error){console.warn('Could not load local projects:',error);return[];}}
export async function saveLocalCalculation(userId:string,projectName:string,calculation:Omit<SavedCalculation,'id'|'savedAt'>):Promise<LocalProject[]>{
 const cleanName=projectName.trim();if(!cleanName)throw new Error('Enter a project name first.');
 let projects=await getLocalProjects(userId);let project=projects.find(item=>item.name.toLowerCase()===cleanName.toLowerCase());
 if(!project){project={id:`project-${Date.now()}`,name:cleanName,createdAt:new Date().toISOString(),calculations:[]};projects=[project,...projects];}
 const saved:SavedCalculation={...calculation,id:`calculation-${Date.now()}`,savedAt:new Date().toISOString()};
 const updated=projects.map(item=>item.id===project!.id?{...item,calculations:[saved,...item.calculations]}:item);
 await AsyncStorage.setItem(storageKey(userId),JSON.stringify(updated));return updated;
}
export async function deleteLocalProject(userId:string,projectId:string):Promise<LocalProject[]>{const next=(await getLocalProjects(userId)).filter(project=>project.id!==projectId);await AsyncStorage.setItem(storageKey(userId),JSON.stringify(next));return next;}
