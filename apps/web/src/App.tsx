import { useEffect, useMemo, useState } from 'react';
import {
  addSnapshot,
  assess,
  buildHealthMapViewModel,
  buildLabReassessmentViewModel,
  buildLongitudinalViewModel,
  buildRecommendationPlan,
  buildRecommendationViewModel,
  capturedContextSummary,
  cmToFeetInches,
  cmToInches,
  conditionCatalog,
  concernCatalog,
  createAssessmentSnapshot,
  createBlockNavigation,
  createHap,
  createNamedHealthEntry,
  createRecordedMeasurement,
  currentAssessmentBlock,
  decodeLongitudinalHistory,
  emptyAssessmentCaptureContext,
  emptyLongitudinalHistory,
  encodeLongitudinalHistory,
  exerciseTypeCatalog,
  familyHistoryCatalog,
  feetInchesToCm,
  getAssessmentBlockPlan,
  goBackBlock,
  goForwardBlock,
  inchesToCm,
  jumpToBlock,
  kgToPounds,
  medicationCategoryCatalog,
  poundsToKg,
  questions,
  reassessWithLabs,
  reconcileBlockNavigation,
  recordedMeasurementCatalog,
  SKIPPED_ANSWER,
  supplementCategoryCatalog,
  type AnswerValue,
  type Answers,
  type AssessmentBlockId,
  type AssessmentCaptureContext,
  type LabRecord,
  type LongitudinalHistory,
  type Question,
} from '@jaanch/core';

const HISTORY_KEY = 'jaanch.history.v1';
const interpretedMeasurements = [
  { value: 'hba1c', label: 'HbA1c', unit: '%' },
  { value: 'vitamin_b12', label: 'Vitamin B12', unit: 'pg/mL' },
];
const unitFor = (marker: string) => ({
  vitamin_d_25oh: 'ng/mL', fasting_glucose: 'mg/dL', random_glucose: 'mg/dL', total_cholesterol: 'mg/dL',
  ldl: 'mg/dL', hdl: 'mg/dL', triglycerides: 'mg/dL', hemoglobin: 'g/dL', ferritin: 'ng/mL',
  tsh: 'mIU/L', blood_pressure: 'mmHg',
} as Record<string, string>)[marker] ?? '';
const classNames = (...items: (string | false | undefined)[]) => items.filter(Boolean).join(' ');

export default function App() {
  const [answers, setAnswers] = useState<Answers>({});
  const [context, setContext] = useState<AssessmentCaptureContext>(() => emptyAssessmentCaptureContext());
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [done, setDone] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [longitudinalHistory, setLongitudinalHistory] = useState<LongitudinalHistory>(() =>
    typeof window === 'undefined' ? emptyLongitudinalHistory() : decodeLongitudinalHistory(window.localStorage.getItem(HISTORY_KEY)),
  );
  const [nav, setNav] = useState(() => createBlockNavigation(getAssessmentBlockPlan({}, emptyAssessmentCaptureContext())));

  const [customCondition, setCustomCondition] = useState('');
  const [medName, setMedName] = useState('');
  const [medPurpose, setMedPurpose] = useState('');
  const [medCategory, setMedCategory] = useState('lipid_lowering');
  const [suppName, setSuppName] = useState('');
  const [suppCategory, setSuppCategory] = useState('vitamin_d');
  const [customConcern, setCustomConcern] = useState('');
  const [customFamily, setCustomFamily] = useState('');
  const [measurementMarker, setMeasurementMarker] = useState('vitamin_d_25oh');
  const [measurementLabel, setMeasurementLabel] = useState('');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('ng/mL');
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(HISTORY_KEY, encodeLongitudinalHistory(longitudinalHistory));
  }, [longitudinalHistory]);

  const blockPlan = useMemo(() => getAssessmentBlockPlan(answers, context), [answers, context]);
  useEffect(() => setNav(state => reconcileBlockNavigation(state, blockPlan)), [blockPlan.revision]);
  const block = currentAssessmentBlock(nav, blockPlan);
  const effectiveAnswers = blockPlan.effectiveAnswers;
  const baseResult = useMemo(() => assess(effectiveAnswers), [effectiveAnswers]);
  const reassessment = useMemo(() => labRecords.length ? reassessWithLabs(effectiveAnswers, labRecords) : undefined, [effectiveAnswers, labRecords]);
  const result = reassessment?.after ?? baseResult;
  const healthMap = useMemo(() => buildHealthMapViewModel(result), [result]);
  const labView = useMemo(() => reassessment ? buildLabReassessmentViewModel(reassessment) : undefined, [reassessment]);
  const recommendationPlan = useMemo(() => buildRecommendationPlan(effectiveAnswers, result), [effectiveAnswers, result]);
  const recommendationView = useMemo(() => buildRecommendationViewModel(recommendationPlan), [recommendationPlan]);
  const longitudinalView = useMemo(() => buildLongitudinalViewModel(longitudinalHistory), [longitudinalHistory]);
  const contextSummary = useMemo(() => capturedContextSummary(context), [context]);

  const setAnswer = (id: string, value: AnswerValue) => setAnswers(current => ({ ...current, [id]: value }));
  const clearAnswer = (id: string) => setAnswers(current => {
    const next = { ...current };
    delete next[id];
    return next;
  });
  const setOptionalNumber = (id: string, raw: string, transform: (value: number) => number = value => value) => {
    if (raw.trim() === '') return clearAnswer(id);
    const value = Number(raw);
    if (Number.isFinite(value)) setAnswer(id, transform(value));
  };
  const optionalNumber = (raw: string) => raw.trim() === '' ? undefined : Number(raw);
  const updateActivityNumber = (field: 'walkingDaysPerWeek' | 'walkingMinutesPerDay' | 'stepsPerDay' | 'exerciseDaysPerWeek' | 'exerciseMinutesPerSession', raw: string) => {
    const value = optionalNumber(raw);
    setContext(current => ({ ...current, activity: { ...current.activity, [field]: Number.isFinite(value) ? value : undefined } }));
  };

  const toggleAnswer = (id: string, value: string) => setAnswers(current => {
    const list = Array.isArray(current[id]) ? current[id] as string[] : [];
    const next = list.includes(value)
      ? list.filter(item => item !== value)
      : value === 'none' ? ['none'] : [...list.filter(item => item !== 'none'), value];
    return { ...current, [id]: next };
  });
  const toggleContextList = (value: string) => setContext(current => {
    const list = current.familyHistory;
    const next = list.includes(value)
      ? list.filter(item => item !== value)
      : value === 'none' ? ['none'] : [...list.filter(item => item !== 'none'), value];
    return { ...current, familyHistory: next };
  });
  const addCustom = (field: 'customConditions' | 'customConcerns' | 'customFamilyHistory', value: string, clear: () => void) => {
    const clean = value.trim();
    if (!clean) return;
    setContext(current => ({ ...current, [field]: [...current[field], clean] }));
    clear();
  };
  const removeCustom = (field: 'customConditions' | 'customConcerns' | 'customFamilyHistory', index: number) =>
    setContext(current => ({ ...current, [field]: current[field].filter((_, i) => i !== index) }));
  const updateActivity = (patch: Partial<AssessmentCaptureContext['activity']>) =>
    setContext(current => ({ ...current, activity: { ...current.activity, ...patch } }));

  const addMedicine = () => {
    if (!medName.trim()) return;
    setContext(current => ({ ...current, medications: [...current.medications, createNamedHealthEntry({ name: medName, category: medCategory, purpose: medPurpose }, 'medicine')] }));
    setMedName(''); setMedPurpose('');
  };
  const addSupplement = () => {
    if (!suppName.trim()) return;
    setContext(current => ({ ...current, supplements: [...current.supplements, createNamedHealthEntry({ name: suppName, category: suppCategory }, 'supplement')] }));
    setSuppName('');
  };
  const removeNamed = (field: 'medications' | 'supplements', id: string) =>
    setContext(current => ({ ...current, [field]: current[field].filter(item => item.id !== id) }));

  const selectMeasurement = (marker: string) => {
    setMeasurementMarker(marker);
    setMeasurementUnit(marker === 'hba1c' ? '%' : marker === 'vitamin_b12' ? 'pg/mL' : unitFor(marker));
    if (marker !== 'other') setMeasurementLabel('');
  };
  const addMeasurement = () => {
    if (!measurementValue.trim()) return;
    const collectedAt = measurementDate ? `${measurementDate}T00:00:00.000Z` : new Date().toISOString();
    if (measurementMarker === 'hba1c' || measurementMarker === 'vitamin_b12') {
      const value = Number(measurementValue);
      if (!Number.isFinite(value)) return;
      const record: LabRecord = measurementMarker === 'hba1c'
        ? { id: `lab-hba1c-${Date.now()}`, markerId: 'hba1c', value, unit: measurementUnit || '%', collectedAt, source: 'manual', verification: 'user_confirmed' }
        : { id: `lab-b12-${Date.now()}`, markerId: 'vitamin_b12', value, unit: measurementUnit || 'pg/mL', collectedAt, source: 'manual', verification: 'user_confirmed' };
      setLabRecords(items => [...items, record]);
    } else {
      const definition = recordedMeasurementCatalog.find(item => item.value === measurementMarker);
      setContext(current => ({
        ...current,
        recordedMeasurements: [...current.recordedMeasurements, createRecordedMeasurement({
          markerId: measurementMarker,
          label: measurementMarker === 'other' ? (measurementLabel.trim() || 'Other measurement') : (definition?.label ?? measurementMarker),
          value: measurementValue.trim(),
          unit: measurementUnit.trim() || undefined,
          collectedAt: measurementDate || undefined,
          source: 'manual',
          verification: 'user_confirmed',
        })],
      }));
    }
    setAnswers(current => ({ ...current, recentLabs: true }));
    setMeasurementValue('');
  };

  const goNext = () => {
    const next = goForwardBlock(nav, blockPlan);
    setNav(next.state);
    if (next.complete) setDone(true);
  };
  const goBack = () => setNav(state => goBackBlock(state, blockPlan));
  const jump = (id: AssessmentBlockId) => { setDone(false); setNav(state => jumpToBlock(state, blockPlan, id)); };
  const saveCheckIn = () => {
    const snapshot = createAssessmentSnapshot({ answers: effectiveAnswers, capturedContext: context, labs: reassessment?.normalizedLabs ?? [], assessment: result, recommendationPlan });
    setLongitudinalHistory(history => addSnapshot(history, snapshot));
    setSavedMessage(`Saved ${new Date(snapshot.capturedAt).toLocaleString()}`);
  };
  const startNewCheckIn = () => {
    const clean = emptyAssessmentCaptureContext();
    setAnswers({}); setContext(clean); setLabRecords([]); setDone(false); setNav(createBlockNavigation(getAssessmentBlockPlan({}, clean))); setSavedMessage('');
  };
  const clearHistory = () => {
    if (window.confirm('Clear all locally saved Jaanch check-ins on this browser?')) setLongitudinalHistory(emptyLongitudinalHistory());
  };

  const choice = (id: string, value: string, label: string, multi = false) => {
    const current = answers[id];
    const selected = multi ? Array.isArray(current) && current.includes(value) : current === value;
    return <button type="button" key={value} className={classNames('chip', selected && 'selected')} aria-pressed={selected} onClick={() => multi ? toggleAnswer(id, value) : setAnswer(id, value)}>{selected ? '✓ ' : ''}{label}</button>;
  };
  const booleanChoices = (id: string) => {
    const current = answers[id];
    return <div className="chip-row">
      <button type="button" className={classNames('chip', current === true && 'selected')} aria-pressed={current === true} onClick={() => setAnswer(id, true)}>Yes</button>
      <button type="button" className={classNames('chip', current === false && 'selected')} aria-pressed={current === false} onClick={() => setAnswer(id, false)}>No</button>
    </div>;
  };
  const renderQuestion = (q: Question) => {
    const value = answers[q.id];
    return <div className="field" key={q.id}>
      <label>{q.title}</label>
      {q.description && <p className="hint">{q.description}</p>}
      {q.type === 'number'
        ? <input type="number" min={q.min} max={q.max} value={typeof value === 'number' ? value : ''} onChange={event => setOptionalNumber(q.id, event.target.value)} />
        : q.type === 'boolean'
          ? booleanChoices(q.id)
          : <div className="chip-row">{q.options?.map(option => choice(q.id, option.value, option.label, q.type === 'multi'))}</div>}
      <button type="button" className="text-button" onClick={() => setAnswer(q.id, SKIPPED_ANSWER)}>Don't know / skip</button>
    </div>;
  };

  const renderAbout = () => {
    const imperial = context.unitPreference === 'imperial';
    const height = typeof answers.heightCm === 'number' ? Number(answers.heightCm) : undefined;
    const heightParts = height ? cmToFeetInches(height) : { feet: 0, inches: 0 };
    const weight = typeof answers.weightKg === 'number' ? Number(answers.weightKg) : undefined;
    const waist = typeof answers.waistCm === 'number' ? Number(answers.waistCm) : undefined;
    return <>
      <div className="field-grid two">
        <div className="field"><label>Age</label><input type="number" min="1" max="110" value={typeof answers.age === 'number' ? answers.age : ''} onChange={event => setOptionalNumber('age', event.target.value)} /></div>
        <div className="field"><label>Sex at birth</label><div className="chip-row">{[['female', 'Female'], ['male', 'Male'], ['other', 'Other / intersex'], ['prefer_not', 'Prefer not']].map(([v, l]) => choice('sex', v, l))}</div></div>
      </div>
      {answers.sex === 'female' && <div className="field"><label>Pregnancy / breastfeeding context</label><div className="chip-row">{[['none', 'Neither'], ['pregnant', 'Pregnant'], ['trying', 'Trying to conceive'], ['breastfeeding', 'Breastfeeding'], ['unsure', 'Unsure']].map(([v, l]) => choice('reproductiveContext', v, l))}</div></div>}
      <div className="unit-switch"><span>Measurement units</span><button type="button" className={classNames('chip', !imperial && 'selected')} aria-pressed={!imperial} onClick={() => setContext(current => ({ ...current, unitPreference: 'metric' }))}>Metric</button><button type="button" className={classNames('chip', imperial && 'selected')} aria-pressed={imperial} onClick={() => setContext(current => ({ ...current, unitPreference: 'imperial' }))}>ft / in / lb</button></div>
      <div className="field-grid three">
        <div className="field"><label>Height</label>{imperial
          ? <div className="inline"><input aria-label="Height feet" type="number" placeholder="ft" value={height === undefined ? '' : heightParts.feet} onChange={event => event.target.value.trim() === '' ? clearAnswer('heightCm') : setAnswer('heightCm', feetInchesToCm(Number(event.target.value), heightParts.inches))} /><input aria-label="Height inches" type="number" placeholder="in" value={height === undefined ? '' : heightParts.inches} onChange={event => event.target.value.trim() === '' ? clearAnswer('heightCm') : setAnswer('heightCm', feetInchesToCm(heightParts.feet, Number(event.target.value)))} /></div>
          : <div className="input-unit"><input type="number" placeholder="cm" value={height ?? ''} onChange={event => setOptionalNumber('heightCm', event.target.value)} /><span>cm</span></div>}</div>
        <div className="field"><label>Weight</label><div className="input-unit"><input type="number" value={weight === undefined ? '' : imperial ? kgToPounds(weight) : weight} onChange={event => setOptionalNumber('weightKg', event.target.value, imperial ? poundsToKg : value => value)} /><span>{imperial ? 'lb' : 'kg'}</span></div></div>
        <div className="field"><label>Waist circumference</label><div className="input-unit"><input type="number" value={waist === undefined ? '' : imperial ? cmToInches(waist) : waist} onChange={event => setOptionalNumber('waistCm', event.target.value, imperial ? inchesToCm : value => value)} /><span>{imperial ? 'in' : 'cm'}</span></div></div>
      </div>
      {Number(answers.age) >= 65 && <div className="field"><label>Significant frailty, recurrent falls, or help needed with daily activities?</label>{booleanChoices('frailtyConcerns')}</div>}
    </>;
  };

  const renderHistory = () => <>
    <div className="field"><label>Diagnosed conditions</label><p className="hint">Choose everything that applies. Add anything missing below; it will be retained even if Jaanch does not interpret it yet.</p><div className="chip-row">{conditionCatalog.map(option => choice('diagnosedConditions', option.value, option.label, true))}</div></div>
    <div className="manual-add"><input value={customCondition} placeholder="Add another diagnosed condition" onChange={event => setCustomCondition(event.target.value)} /><button type="button" onClick={() => addCustom('customConditions', customCondition, () => setCustomCondition(''))}>Add</button></div>
    {context.customConditions.length > 0 && <div className="tag-list">{context.customConditions.map((item, index) => <span className="tag" key={`${item}-${index}`}>{item}<button type="button" onClick={() => removeCustom('customConditions', index)}>×</button></span>)}</div>}
    <div className="field"><label>Do you take prescription medicines?</label>{booleanChoices('prescriptionMedications')}</div>
    {(answers.prescriptionMedications === true || context.medications.length > 0) && <div className="subcard"><h3>Medicines</h3>{context.medications.map(item => <div className="entry" key={item.id}><div><b>{item.name}</b><small>{[item.purpose, item.category].filter(Boolean).join(' · ')}</small></div><button type="button" onClick={() => removeNamed('medications', item.id)}>Remove</button></div>)}<div className="field-grid three"><input placeholder="Medicine name e.g. atorvastatin" value={medName} onChange={event => setMedName(event.target.value)} /><select value={medCategory} onChange={event => setMedCategory(event.target.value)}>{medicationCategoryCatalog.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select><input placeholder="Why do you take it? e.g. cholesterol" value={medPurpose} onChange={event => setMedPurpose(event.target.value)} /></div><button type="button" className="secondary" onClick={addMedicine}>+ Add medicine</button></div>}
    <div className="field"><label>Do you take vitamins, minerals or herbal supplements?</label>{booleanChoices('supplementUse')}</div>
    {(answers.supplementUse === true || context.supplements.length > 0) && <div className="subcard"><h3>Supplements</h3>{context.supplements.map(item => <div className="entry" key={item.id}><div><b>{item.name}</b><small>{item.category}</small></div><button type="button" onClick={() => removeNamed('supplements', item.id)}>Remove</button></div>)}<div className="field-grid two"><input placeholder="Supplement name" value={suppName} onChange={event => setSuppName(event.target.value)} /><select value={suppCategory} onChange={event => setSuppCategory(event.target.value)}>{supplementCategoryCatalog.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><button type="button" className="secondary" onClick={addSupplement}>+ Add supplement</button></div>}
    <div className="field"><label>Known severe medicine or supplement allergy/reaction?</label>{booleanChoices('medicationOrSupplementAllergy')}</div>
    <div className="field"><label>Important family history</label><div className="chip-row">{familyHistoryCatalog.map(option => { const selected = context.familyHistory.includes(option.value); return <button type="button" key={option.value} className={classNames('chip', selected && 'selected')} aria-pressed={selected} onClick={() => toggleContextList(option.value)}>{selected ? '✓ ' : ''}{option.label}</button>; })}</div><div className="manual-add"><input value={customFamily} placeholder="Add other family history" onChange={event => setCustomFamily(event.target.value)} /><button type="button" onClick={() => addCustom('customFamilyHistory', customFamily, () => setCustomFamily(''))}>Add</button></div>{context.customFamilyHistory.map((item, index) => <span className="tag" key={`${item}-${index}`}>{item}<button type="button" onClick={() => removeCustom('customFamilyHistory', index)}>×</button></span>)}</div>
  </>;

  const renderCurrent = () => <>
    <div className="field"><label>Current health concerns</label><p className="hint">Choose any that apply. Free-text context is preserved but does not silently become a diagnosis.</p><div className="chip-row">{concernCatalog.map(option => choice('currentConcerns', option.value, option.label, true))}</div></div>
    <div className="manual-add"><input value={customConcern} placeholder="Add another concern" onChange={event => setCustomConcern(event.target.value)} /><button type="button" onClick={() => addCustom('customConcerns', customConcern, () => setCustomConcern(''))}>Add</button></div>
    <div className="tag-list">{context.customConcerns.map((item, index) => <span className="tag" key={`${item}-${index}`}>{item}<button type="button" onClick={() => removeCustom('customConcerns', index)}>×</button></span>)}</div>
    <div className="field"><label>Anything else you want Jaanch to retain about these concerns?</label><textarea rows={4} placeholder="Optional details. These are recorded context, not automatically interpreted." value={context.concernDetails ?? ''} onChange={event => setContext(current => ({ ...current, concernDetails: event.target.value }))} /></div>
  </>;

  const renderLifestyle = () => <>
    <div className="field"><label>Usual diet</label><div className="chip-row">{[['vegan', 'Vegan'], ['vegetarian', 'Vegetarian'], ['eggetarian', 'Vegetarian + eggs'], ['mixed', 'Mixed / omnivore']].map(([v, l]) => choice('diet', v, l))}</div></div>
    <div className="subcard"><h3>Walking</h3><p className="hint">Walking counts. It does not need to be a gym workout.</p><div className="field-grid three"><div className="field"><label>Days / week</label><input type="number" min="0" max="7" value={context.activity.walkingDaysPerWeek ?? ''} onChange={event => updateActivityNumber('walkingDaysPerWeek', event.target.value)} /></div><div className="field"><label>Minutes on a typical walking day</label><input type="number" min="0" value={context.activity.walkingMinutesPerDay ?? ''} onChange={event => updateActivityNumber('walkingMinutesPerDay', event.target.value)} /></div><div className="field"><label>Steps / day if known</label><input type="number" min="0" value={context.activity.stepsPerDay ?? ''} onChange={event => updateActivityNumber('stepsPerDay', event.target.value)} /></div></div><div className="chip-row">{[['easy', 'Easy pace'], ['brisk', 'Brisk'], ['fast', 'Fast']].map(([v, l]) => <button type="button" key={v} className={classNames('chip', context.activity.walkingPace === v && 'selected')} aria-pressed={context.activity.walkingPace === v} onClick={() => updateActivity({ walkingPace: v as 'easy' | 'brisk' | 'fast' })}>{l}</button>)}</div></div>
    <div className="subcard"><h3>Other physical activity</h3><div className="chip-row">{exerciseTypeCatalog.map(item => { const selected = context.activity.exerciseTypes.includes(item.value); return <button type="button" key={item.value} className={classNames('chip', selected && 'selected')} aria-pressed={selected} onClick={() => updateActivity({ exerciseTypes: selected ? context.activity.exerciseTypes.filter(value => value !== item.value) : [...context.activity.exerciseTypes, item.value] })}>{selected ? '✓ ' : ''}{item.label}</button>; })}</div><div className="field-grid three"><div className="field"><label>Days / week</label><input type="number" min="0" max="7" value={context.activity.exerciseDaysPerWeek ?? ''} onChange={event => updateActivityNumber('exerciseDaysPerWeek', event.target.value)} /></div><div className="field"><label>Minutes / session</label><input type="number" min="0" value={context.activity.exerciseMinutesPerSession ?? ''} onChange={event => updateActivityNumber('exerciseMinutesPerSession', event.target.value)} /></div><div className="field"><label>Typical intensity</label><div className="chip-row">{['light', 'moderate', 'vigorous'].map(value => <button type="button" key={value} className={classNames('chip', context.activity.exerciseIntensity === value && 'selected')} aria-pressed={context.activity.exerciseIntensity === value} onClick={() => updateActivity({ exerciseIntensity: value as 'light' | 'moderate' | 'vigorous' })}>{value}</button>)}</div></div></div><input placeholder="Other activity detail" value={context.activity.otherActivity ?? ''} onChange={event => updateActivity({ otherActivity: event.target.value })} /></div>
    <div className="field-grid two"><div className="field"><label>Usual sleep hours / night</label><input type="number" min="2" max="14" step="0.5" value={typeof answers.sleepHours === 'number' ? answers.sleepHours : ''} onChange={event => setOptionalNumber('sleepHours', event.target.value)} /></div><div className="field"><label>Currently smoke or use tobacco?</label>{booleanChoices('smoking')}</div></div>
  </>;

  const renderTests = () => <>
    <div className="notice"><b>Record what you know.</b><span>HbA1c and B12 can currently influence deterministic findings after validation. Vitamin D, lipids, thyroid, BP and other values are useful context and remain clearly marked as recorded/unassessed.</span></div>
    <div className="field"><label>Do you have recent tests or measurements?</label>{booleanChoices('recentLabs')}</div>
    <div className="subcard"><h3>Add known result</h3><div className="field-grid two"><select value={measurementMarker} onChange={event => selectMeasurement(event.target.value)}>{interpretedMeasurements.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}{recordedMeasurementCatalog.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{measurementMarker === 'other' && <input placeholder="Test / measurement name" value={measurementLabel} onChange={event => setMeasurementLabel(event.target.value)} />}</div><div className="field-grid three"><input placeholder={measurementMarker === 'blood_pressure' ? 'e.g. 120/80' : 'Value'} value={measurementValue} onChange={event => setMeasurementValue(event.target.value)} /><input placeholder="Unit" value={measurementUnit} onChange={event => setMeasurementUnit(event.target.value)} /><input type="date" value={measurementDate} onChange={event => setMeasurementDate(event.target.value)} /></div><button type="button" className="primary" onClick={addMeasurement}>Add result</button></div>
    {(labRecords.length > 0 || context.recordedMeasurements.length > 0) && <div className="result-list">{labRecords.map(item => <div className="entry" key={item.id}><div><b>{item.markerId === 'hba1c' ? 'HbA1c' : 'Vitamin B12'}: {item.value} {item.unit}</b><small>{item.collectedAt.slice(0, 10)} · eligible pathway after validation</small></div><button type="button" onClick={() => setLabRecords(list => list.filter(value => value.id !== item.id))}>Remove</button></div>)}{context.recordedMeasurements.map(item => <div className="entry" key={item.id}><div><b>{item.label}: {item.value} {item.unit ?? ''}</b><small>{item.collectedAt ?? 'Date not supplied'} · recorded, not yet assessed by Jaanch</small></div><button type="button" onClick={() => setContext(current => ({ ...current, recordedMeasurements: current.recordedMeasurements.filter(value => value.id !== item.id) }))}>Remove</button></div>)}</div>}
    <div className="field"><label>Additional health context</label><textarea rows={4} placeholder="Optional context you want preserved for review." value={context.additionalContext ?? ''} onChange={event => setContext(current => ({ ...current, additionalContext: event.target.value }))} /></div>
  </>;

  const renderAdaptive = () => <>{block?.questionIds.map(id => questions.find(question => question.id === id)).filter((question): question is Question => Boolean(question)).map(renderQuestion)}</>;
  const renderBlock = () => block?.id === 'about' ? renderAbout() : block?.id === 'history' ? renderHistory() : block?.id === 'current' ? renderCurrent() : block?.id === 'lifestyle' ? renderLifestyle() : block?.id === 'tests' ? renderTests() : renderAdaptive();

  if (done) return <main className="app-shell results-shell">
    <header className="result-hero"><div><span className="eyebrow">Your Jaanch Health Map</span><h1>What matters from the information you shared</h1><p>{healthMap.evidence.label}</p></div><button type="button" className="secondary" onClick={() => jump('about')}>Review / edit my information</button></header>
    {healthMap.urgentMessages.map(message => <div className="urgent" key={message}><b>Urgent</b><span>{message}</span></div>)}
    <div className="result-grid"><section className="panel"><span className="eyebrow">Start here</span><h2>Top priorities</h2>{healthMap.topPriorities.length ? <ol className="priority-list">{healthMap.topPriorities.map(item => <li key={item.id}><b>{item.title}</b><span>{item.detail}</span></li>)}</ol> : <p>No high-priority item from the current interpreted evidence.</p>}</section><section className="panel"><span className="eyebrow">Action</span><h2>{recommendationView.title}</h2>{recommendationView.blockedReason ? <p>{recommendationView.blockedReason}</p> : recommendationView.top.length ? recommendationView.top.map(item => <article className="action" key={item.id}><b>{item.title}</b><span>{item.priorityLabel} · {item.dispositionLabel}</span><p>{item.rationale}</p></article>) : <p>No new action recommendation from the current interpreted evidence.</p>}</section></div>
    {contextSummary.length > 0 && <section className="panel"><span className="eyebrow">Captured context</span><h2>Recorded, but not yet assessed by Jaanch</h2><p className="hint">These facts are preserved. They do not influence deterministic findings unless a reviewed rule explicitly supports them.</p><div className="context-grid">{contextSummary.map(item => <article className="context-card" key={item.id}><b>{item.title}</b><span>{item.detail}</span></article>)}</div></section>}
    <section className="panel"><span className="eyebrow">Evidence</span><h2>Findings</h2>{healthMap.findings.map(finding => <article className="finding" key={finding.id}><div><b>{finding.domainLabel}: {finding.title}</b><span>{finding.statusLabel} · {finding.urgencyLabel} · {finding.confidenceLabel}</span></div><p>{finding.summary}</p><details><summary>Why / evidence / clinical details</summary>{finding.supporting.map(item => <p key={item.id}>Supports: {item.label} — {item.detail}</p>)}{finding.contradicting.map(item => <p key={item.id}>Contradicts: {item.label} — {item.detail}</p>)}{finding.missing.map(item => <p key={item.id}>Missing: {item.label} — {item.detail}</p>)}<small>{finding.ruleLabel}</small></details></article>)}</section>
    <section className="panel"><span className="eyebrow">Next evidence</span><h2>What to check next</h2>{healthMap.investigations.blockedReason ? <p>{healthMap.investigations.blockedReason}</p> : healthMap.investigations.minimal.length ? <ol>{healthMap.investigations.minimal.map(item => <li key={item.id}><b>{item.title}</b> — {item.priorityLabel}<br /><span>{item.rationale}</span></li>)}</ol> : <p>{healthMap.investigations.emptyLabel}</p>}</section>
    {labView && <section className="panel"><h2>Lab reassessment</h2><p>{labView.appliedLabel}</p>{labView.changes.map(item => <p key={item.id}><b>{item.title}</b> — {item.detail}</p>)}</section>}
    <section className="panel"><h2>Save this check-in</h2><p>Keep this result locally so a future check-in can show what changed.</p><div className="actions"><button type="button" className="primary" onClick={saveCheckIn}>Save check-in</button><button type="button" className="secondary" onClick={startNewCheckIn}>Start new check-in</button></div>{savedMessage && <p className="success">{savedMessage}</p>}</section>
    {longitudinalView.snapshotCount > 0 && <section className="panel"><h2>{longitudinalView.title}</h2><p>{longitudinalView.snapshotCount} locally saved check-in{longitudinalView.snapshotCount === 1 ? '' : 's'}.</p>{longitudinalView.comparison && <p>Evidence completeness change: {longitudinalView.comparison.evidenceCompletenessDelta >= 0 ? '+' : ''}{longitudinalView.comparison.evidenceCompletenessDelta}%</p>}<details><summary>Saved check-ins</summary><ol>{longitudinalHistory.snapshots.map(snapshot => <li key={snapshot.id}>{new Date(snapshot.capturedAt).toLocaleString()} · {snapshot.assessment.findings.length} finding(s){snapshot.capturedContext?.customConditions.length ? ` · ${snapshot.capturedContext.customConditions.length} custom condition(s)` : ''}</li>)}</ol><button type="button" className="danger-link" onClick={clearHistory}>Clear local history</button></details></section>}
    <details className="technical"><summary>Clinical governance & HAP details</summary><p>{healthMap.governance.label}</p><pre>{JSON.stringify(createHap(effectiveAnswers, result, reassessment?.normalizedLabs, recommendationPlan, context), null, 2)}</pre></details>
  </main>;

  return <main className="app-shell">
    <header className="app-header"><div><span className="eyebrow">Personal health assessment</span><h1>Jaanch</h1><p>Capture the important facts first. Jaanch separates what it can assess from what it simply records for context.</p></div>{longitudinalView.snapshotCount > 0 && <span className="history-badge">{longitudinalView.snapshotCount} saved check-in{longitudinalView.snapshotCount === 1 ? '' : 's'}</span>}</header>
    <nav className="stepper" aria-label="Assessment sections">{blockPlan.blocks.map((item, index) => <button type="button" key={item.id} className={classNames('step', item.id === nav.currentBlockId && 'active', item.kind === 'safety' && 'safety')} aria-current={item.id === nav.currentBlockId ? 'step' : undefined} onClick={() => jump(item.id)}><span>{index + 1}</span>{item.shortTitle}</button>)}</nav>
    {nav.invalidatedBlockIds.length > 0 && <div className="notice"><b>Assessment path updated</b><span>An earlier edit changed which follow-up sections are relevant. Your retained answers were not silently deleted.</span></div>}
    <section className={classNames('assessment-card', block?.kind === 'safety' && 'safety-card')}><span className="eyebrow">{block?.kind === 'primary' ? 'Core section' : block?.kind === 'safety' ? 'Safety follow-up' : 'Adaptive section'}</span><h2>{block?.title}</h2><p className="section-intro">{block?.description}</p>{renderBlock()}</section>
    <nav className="bottom-nav"><button type="button" className="secondary" disabled={!nav.backStack.length} onClick={goBack}>← Back</button><span>{Math.max(1, blockPlan.blocks.findIndex(item => item.id === nav.currentBlockId) + 1)} of {blockPlan.blocks.length} sections</span><button type="button" className="primary" onClick={goNext}>{blockPlan.blocks[blockPlan.blocks.length - 1]?.id === nav.currentBlockId ? 'See Health Map' : 'Continue →'}</button></nav>
  </main>;
}
