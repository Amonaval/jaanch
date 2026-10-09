import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {
  addConfirmedReportEvidenceToHistory,
  confirmReportEvidenceCandidate,
  createReportProvenance,
  decodeLongitudinalHistory,
  encodeLongitudinalHistory,
  extractReportCandidatesFromText,
  type ConfirmedReportEvidence,
  type ReportEvidenceCandidate,
  type ReportProvenance,
} from '@jaanch/core';

const HISTORY_KEY='jaanch.history.v1';
const input={padding:12,borderWidth:1,borderColor:'#cedad3',borderRadius:12,backgroundColor:'#fff'} as const;
const card={padding:16,borderWidth:1,borderColor:'#dfe8e2',borderRadius:18,backgroundColor:'#fff',gap:10} as const;
const primary={paddingVertical:12,paddingHorizontal:16,borderRadius:13,backgroundColor:'#176443'} as const;
const secondary={paddingVertical:12,paddingHorizontal:16,borderRadius:13,borderWidth:1,borderColor:'#cbd8d1',backgroundColor:'#fff'} as const;
const today=()=>new Date().toISOString().slice(0,10);
const asIso=(value:string)=>value?`${value}T00:00:00.000Z`:undefined;

export function ReportImportScreen({onApplied,onBack}:{onApplied:()=>void;onBack:()=>void}){
 const [provenance,setProvenance]=useState<ReportProvenance>();
 const [reportDate,setReportDate]=useState(today);
 const [text,setText]=useState('');
 const [candidates,setCandidates]=useState<ReportEvidenceCandidate[]>([]);
 const [confirmed,setConfirmed]=useState<Record<string,ConfirmedReportEvidence>>({});
 const [message,setMessage]=useState('');
 const [savedCount,setSavedCount]=useState(0);
 const confirmedCount=Object.keys(confirmed).length;
 useEffect(()=>{AsyncStorage.getItem(HISTORY_KEY).then(raw=>setSavedCount(decodeLongitudinalHistory(raw).snapshots.length)).catch(()=>setSavedCount(0));},[]);

 const pick=async()=>{const result=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/*','text/plain'],copyToCacheDirectory:true,multiple:false});if(result.canceled)return;const asset=result.assets[0];setProvenance(createReportProvenance({fileName:asset.name,mimeType:asset.mimeType,sizeBytes:asset.size,extractionMethod:'pasted_text'}));setCandidates([]);setConfirmed({});setMessage('Source attached. Paste report text/OCR output, then verify each candidate.');};
 const extract=()=>{if(!text.trim()){setMessage('Paste report text or OCR output first.');return;}const source=provenance??createReportProvenance({fileName:'Pasted report text',kind:'text',extractionMethod:'pasted_text'});if(!provenance)setProvenance(source);const next=extractReportCandidatesFromText({text,provenance:source,defaultCollectedAt:asIso(reportDate)});setCandidates(next);setConfirmed({});setMessage(next.length?`${next.length} candidate result${next.length===1?'':'s'} found. Extraction alone changes nothing.`:'No structured candidate was found. Use manual entry for anything missed.');};
 const patch=(id:string,update:Partial<ReportEvidenceCandidate>)=>{setCandidates(items=>items.map(item=>item.id===id?{...item,...update,status:'candidate'}:item));setConfirmed(current=>{const next={...current};delete next[id];return next;});};
 const review=(candidate:ReportEvidenceCandidate)=>{const result=confirmReportEvidenceCandidate(candidate);if(result.issues.length){setMessage(result.issues.join(' '));return;}setConfirmed(current=>({...current,[candidate.id]:result}));setCandidates(items=>items.map(item=>item.id===candidate.id?{...item,status:'confirmed'}:item));setMessage(result.lab?'Reviewed and ready. Existing lab gates still decide eligibility when applied.':'Reviewed and ready. This marker will remain recorded/unassessed.');};
 const apply=async()=>{if(!confirmedCount){setMessage('Review at least one candidate before applying.');return;}const raw=await AsyncStorage.getItem(HISTORY_KEY);const history=decodeLongitudinalHistory(raw);if(!history.snapshots.length){setMessage('Save a Jaanch check-in first. Report import reassesses your latest saved profile so it never invents missing health context.');return;}const result=addConfirmedReportEvidenceToHistory({history,confirmed:Object.values(confirmed)});if(!result.reassessment){setMessage('No saved baseline was available.');return;}await AsyncStorage.setItem(HISTORY_KEY,encodeLongitudinalHistory(result.history));setSavedCount(result.history.snapshots.length);const r=result.reassessment;setMessage(`Applied ${confirmedCount} reviewed result${confirmedCount===1?'':'s'} in one reassessed check-in. ${r.interpretedLabCount} supported lab(s); ${r.recordedUnassessedCount} recorded/unassessed; ${r.duplicateCount} exact duplicate(s) replaced.`);onApplied();};
 return <ScrollView contentContainerStyle={{padding:20,gap:14,backgroundColor:'#f3f7f4'}}>
  <TouchableOpacity style={secondary} onPress={onBack}><Text style={{fontWeight:'800',textAlign:'center'}}>← Assessment</Text></TouchableOpacity>
  <Text style={{fontSize:13,fontWeight:'800',color:'#27765a'}}>CLINICAL EVIDENCE CAPTURE V2</Text><Text style={{fontSize:32,fontWeight:'900'}}>Import a lab report</Text><Text style={{color:'#66776e',fontSize:16}}>Extraction creates candidates only. Verify the value, unit and date before anything is added to Jaanch.</Text>
  <View style={{padding:14,borderRadius:16,backgroundColor:'#eef7f2',gap:5}}><Text style={{fontWeight:'900'}}>Safety boundary</Text><Text>PDF/image attachment preserves source provenance. This alpha does not silently trust document OCR: paste report text/OCR output and review every candidate.</Text></View>
  <Text style={{color:'#66776e'}}>Saved baseline available: {savedCount>0?'Yes':'No — save a check-in in Assessment first.'}</Text>
  <TouchableOpacity style={secondary} onPress={pick}><Text style={{fontWeight:'800',textAlign:'center'}}>Pick PDF / image</Text></TouchableOpacity>
  {provenance?<Text style={{color:'#66776e'}}>{provenance.fileName} · {provenance.kind}{provenance.sizeBytes?` · ${Math.max(1,Math.round(provenance.sizeBytes/1024))} KB`:''}</Text>:null}
  <TextInput style={input} value={reportDate} onChangeText={setReportDate} placeholder="Report date YYYY-MM-DD"/>
  <TextInput multiline numberOfLines={8} style={[input,{minHeight:145,textAlignVertical:'top'}]} value={text} onChangeText={setText} placeholder={'Paste report text / OCR output\nHbA1c: 5.9 %\nVitamin B12: 168 pg/mL'}/>
  <TouchableOpacity style={secondary} onPress={extract}><Text style={{fontWeight:'800',textAlign:'center'}}>Extract candidates</Text></TouchableOpacity>
  {confirmedCount>0?<TouchableOpacity style={primary} onPress={apply}><Text style={{color:'#fff',fontWeight:'800',textAlign:'center'}}>Apply {confirmedCount} reviewed result{confirmedCount===1?'':'s'}</Text></TouchableOpacity>:null}
  {message?<Text style={{color:'#66776e'}}>{message}</Text>:null}
  {candidates.filter(item=>item.status!=='rejected').map(candidate=><View style={card} key={candidate.id}>
   <Text style={{fontSize:18,fontWeight:'900'}}>{candidate.label}</Text><Text style={{color:'#66776e'}}>{Math.round((candidate.extractionConfidence??0)*100)}% extraction confidence · {candidate.markerId==='hba1c'||candidate.markerId==='vitamin_b12'?'supported only through normal lab gates':'recorded/unassessed after apply'}</Text>
   <TextInput style={input} value={candidate.value} onChangeText={value=>patch(candidate.id,{value,numericValue:Number.isFinite(Number(value))?Number(value):undefined})} placeholder="Value"/><TextInput style={input} value={candidate.unit??''} onChangeText={unit=>patch(candidate.id,{unit:unit||undefined})} placeholder="Unit"/><TextInput style={input} value={candidate.collectedAt?.slice(0,10)??reportDate} onChangeText={date=>patch(candidate.id,{collectedAt:asIso(date)})} placeholder="YYYY-MM-DD"/><TextInput style={input} value={candidate.referenceRange??''} onChangeText={referenceRange=>patch(candidate.id,{referenceRange:referenceRange||undefined})} placeholder="Reference range (optional)"/>
   {candidate.issues.length?<Text style={{color:'#775f25'}}>Check: {candidate.issues.join(' ')}</Text>:null}
   <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}><TouchableOpacity style={candidate.status==='confirmed'?secondary:primary} onPress={()=>review(candidate)}><Text style={{fontWeight:'800',color:candidate.status==='confirmed'?'#111':'#fff'}}>{candidate.status==='confirmed'?'Reviewed ✓':'Review & confirm'}</Text></TouchableOpacity><TouchableOpacity style={secondary} onPress={()=>{setCandidates(items=>items.map(item=>item.id===candidate.id?{...item,status:'rejected'}:item));setConfirmed(current=>{const next={...current};delete next[candidate.id];return next;});}}><Text>Ignore</Text></TouchableOpacity></View>
  </View>)}
 </ScrollView>;
}
