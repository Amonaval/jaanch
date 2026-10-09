import { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, View } from 'react-native';
import App from './App';
import { ReportImportScreen } from './ReportImportScreen';
import { ProfileLabScreen } from './ProfileLabScreen';

export default function Root(){
 const [mode,setMode]=useState<'assessment'|'report'|'profiles'>('assessment');
 const [appRevision,setAppRevision]=useState(0);
 const applied=()=>setAppRevision(value=>value+1);
 return <SafeAreaView style={{flex:1,backgroundColor:'#f3f7f4'}}>
  <View style={{paddingHorizontal:20,paddingVertical:8,backgroundColor:'#f3f7f4',flexDirection:'row',gap:8}}>
   {mode==='assessment'?<><TouchableOpacity style={{flex:1,padding:10,borderRadius:12,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'}} onPress={()=>setMode('report')}><Text style={{fontWeight:'800',textAlign:'center'}}>Import report</Text></TouchableOpacity><TouchableOpacity style={{flex:1,padding:10,borderRadius:12,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'}} onPress={()=>setMode('profiles')}><Text style={{fontWeight:'800',textAlign:'center'}}>Profiles & mocks</Text></TouchableOpacity></>:<TouchableOpacity style={{flex:1,padding:10,borderRadius:12,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'}} onPress={()=>setMode('assessment')}><Text style={{fontWeight:'800',textAlign:'center'}}>Back to assessment</Text></TouchableOpacity>}
  </View>
  <View style={{flex:1,display:mode==='assessment'?'flex':'none'}}><App key={appRevision}/></View>
  <View style={{flex:1,display:mode==='report'?'flex':'none'}}><ReportImportScreen onApplied={applied} onBack={()=>setMode('assessment')}/></View>
  <View style={{flex:1,display:mode==='profiles'?'flex':'none'}}><ProfileLabScreen onApplied={applied} onBack={()=>setMode('assessment')}/></View>
 </SafeAreaView>;
}
