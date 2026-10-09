import { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, View } from 'react-native';
import App from './App';
import { ReportImportScreen } from './ReportImportScreen';

export default function Root(){
 const [mode,setMode]=useState<'assessment'|'report'>('assessment');
 const [appRevision,setAppRevision]=useState(0);
 return <SafeAreaView style={{flex:1,backgroundColor:'#f3f7f4'}}>
  <View style={{paddingHorizontal:20,paddingVertical:8,backgroundColor:'#f3f7f4'}}><TouchableOpacity style={{padding:10,borderRadius:12,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'}} onPress={()=>setMode(mode==='assessment'?'report':'assessment')}><Text style={{fontWeight:'800',textAlign:'center'}}>{mode==='assessment'?'Import lab report':'Back to assessment'}</Text></TouchableOpacity></View>
  <View style={{flex:1,display:mode==='assessment'?'flex':'none'}}><App key={appRevision}/></View>
  <View style={{flex:1,display:mode==='report'?'flex':'none'}}><ReportImportScreen onApplied={()=>setAppRevision(value=>value+1)} onBack={()=>setMode('assessment')}/></View>
 </SafeAreaView>;
}
