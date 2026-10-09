import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  addSnapshot,
  decodeLongitudinalHistory,
  decodeProfileBundle,
  encodeLongitudinalHistory,
  encodeProfileBundle,
  mockProfileBundles,
  profileBundleFromHistory,
  runProfileBundle,
  type JaanchProfileBundle,
  type ProfileRunResult,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';
const card={padding:18,borderWidth:1,borderColor:'#dfe8e2',borderRadius:22,backgroundColor:'#fff',gap:10} as const;
const primary={paddingVertical:12,paddingHorizontal:16,borderRadius:14,backgroundColor:'#176443'} as const;
const secondary={paddingVertical:12,paddingHorizontal:16,borderRadius:14,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'} as const;

type Props={onApplied:()=>void;onBack:()=>void};

export function ProfileLabScreen({onApplied,onBack}:Props){
 const [selectedId,setSelectedId]=useState(mockProfileBundles[0]?.id??'');
 const [imported,setImported]=useState<JaanchProfileBundle>();
 const [runResult,setRunResult]=useState<ProfileRunResult>();
 const [message,setMessage]=useState('Choose a mock or import a JAANCH-PROFILE-1.0 JSON file. Running it uses the current deterministic engine and saves one local check-in.');
 const selected=useMemo(()=>imported??mockProfileBundles.find(item=>item.id===selectedId)??mockProfileBundles[0],[imported,selectedId]);

 const run=async(bundle:JaanchProfileBundle)=>{
  try{
   const result=runProfileBundle(bundle);
   const history=decodeLongitudinalHistory(await AsyncStorage.getItem(HISTORY_KEY));
   await AsyncStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(addSnapshot(history,result.snapshot)));
   setRunResult(result);setMessage(`Ran “${bundle.label}” and saved the resulting check-in locally.`);onApplied();
  }catch(error){setMessage(error instanceof Error?error.message:'Could not run profile.');}
 };
 const shareBundle=async(bundle:JaanchProfileBundle)=>{
  try{
   if(!(await Sharing.isAvailableAsync())) throw new Error('File sharing is not available on this device.');
   const safeId=(bundle.id||'jaanch-profile').replace(/[^a-zA-Z0-9._-]+/g,'-');
   const file=new File(Paths.cache,`${safeId}-${Date.now()}.jaanch-profile.json`);
   file.create();
   file.write(encodeProfileBundle(bundle));
   await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:`Export ${bundle.label}`});
   setMessage(`Exported “${bundle.label}” as a JAANCH-PROFILE-1.0 JSON file.`);
  }catch(error){setMessage(error instanceof Error?error.message:'Could not export profile JSON.');}
 };
 const importProfile=async()=>{
  try{
   const picked=await DocumentPicker.getDocumentAsync({type:'application/json',copyToCacheDirectory:true,multiple:false});
   if(picked.canceled||!picked.assets?.[0])return;
   const file=new File(picked.assets[0].uri);
   const bundle=decodeProfileBundle(await file.text());
   setImported(bundle);setSelectedId('');await run(bundle);
  }catch(error){setMessage(error instanceof Error?error.message:'Could not import profile JSON.');}
 };
 const exportLatest=async()=>{
  try{const history=decodeLongitudinalHistory(await AsyncStorage.getItem(HISTORY_KEY));await shareBundle(profileBundleFromHistory(history,'Exported Jaanch profile'));}catch(error){setMessage(error instanceof Error?error.message:'Nothing to export yet.');}
 };

 return <SafeAreaView style={{flex:1,backgroundColor:'#f3f7f4'}}><ScrollView contentContainerStyle={{padding:20,gap:16}}>
  <TouchableOpacity style={secondary} onPress={onBack}><Text style={{fontWeight:'800',textAlign:'center'}}>← Back to assessment</Text></TouchableOpacity>
  <View style={card}><Text style={{fontSize:13,fontWeight:'800',textTransform:'uppercase'}}>Test & portability</Text><Text style={{fontSize:30,fontWeight:'900'}}>Profiles & mock scenarios</Text><Text>Import/export is local JSON portability, not an account or cloud-sync feature. Imported profiles are rerun through the current engine.</Text></View>
  <View style={card}><Text style={{fontWeight:'900'}}>JAANCH-PROFILE-1.0</Text><Text>{message}</Text><View style={{flexDirection:'row',gap:10,flexWrap:'wrap'}}><TouchableOpacity style={primary} onPress={importProfile}><Text style={{color:'#fff',fontWeight:'800'}}>Import JSON</Text></TouchableOpacity><TouchableOpacity style={secondary} onPress={exportLatest}><Text style={{fontWeight:'800'}}>Export latest</Text></TouchableOpacity></View><Text style={{fontSize:12}}>Export creates a .jaanch-profile.json file through the phone share sheet. Import accepts the same JSON document format.</Text></View>
  <View style={card}><Text style={{fontSize:22,fontWeight:'900'}}>Mock profiles</Text>{mockProfileBundles.map(profile=><View key={profile.id} style={{paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#edf1ee',gap:8}}><Text style={{fontWeight:'900'}}>{profile.label}</Text><Text>{profile.description}</Text><View style={{flexDirection:'row',gap:10}}><TouchableOpacity style={primary} onPress={()=>{setImported(undefined);setSelectedId(profile.id);run(profile);}}><Text style={{color:'#fff',fontWeight:'800'}}>Run</Text></TouchableOpacity><TouchableOpacity style={secondary} onPress={()=>shareBundle(profile)}><Text style={{fontWeight:'800'}}>Export JSON</Text></TouchableOpacity></View></View>)}</View>
  {selected&&<View style={card}><Text style={{fontSize:20,fontWeight:'900'}}>Selected profile</Text><Text style={{fontWeight:'800'}}>{selected.label}</Text><Text>{selected.description}</Text><TouchableOpacity style={primary} onPress={()=>run(selected)}><Text style={{color:'#fff',fontWeight:'800',textAlign:'center'}}>Run selected profile</Text></TouchableOpacity></View>}
  {runResult&&<View style={card}><Text style={{fontSize:13,fontWeight:'800',textTransform:'uppercase'}}>Current-engine result</Text><Text style={{fontSize:22,fontWeight:'900'}}>{runResult.bundle.label}</Text><Text>{runResult.snapshot.assessment.evidenceCompleteness}% questionnaire evidence completeness — not an overall health score.</Text>{runResult.snapshot.assessment.findings.map(item=><View key={item.id} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#edf1ee',gap:4}}><Text style={{fontWeight:'900'}}>{item.title}</Text><Text>{item.status} · {item.urgency} · {item.evidenceLevel}</Text><Text>{item.summary}</Text></View>)}<Text style={{fontSize:18,fontWeight:'900',marginTop:8}}>Actions</Text>{runResult.snapshot.recommendationPlan.recommendations.slice(0,8).map(item=><View key={item.id} style={{paddingVertical:8,gap:3}}><Text style={{fontWeight:'800'}}>{item.title}</Text><Text>{item.priority} · {item.disposition}</Text></View>)}</View>}
 </ScrollView></SafeAreaView>;
}
