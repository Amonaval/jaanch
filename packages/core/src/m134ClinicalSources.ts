import type { ClinicalSource } from './types';

export const m134ClinicalSources:ClinicalSource[]=[
  {
    id:'ESC-BP-2024',title:'2024 ESC Guidelines for the Management of Elevated Blood Pressure and Hypertension',issuingBody:'European Society of Cardiology',url:'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/elevated-blood-pressure-and-hypertension/',publicationDate:'2024-08-30',versionLabel:'2024 ESC guideline',evidenceType:'clinical_guideline',
    population:'Adults undergoing blood-pressure evaluation; pregnancy-specific hypertensive-disorder management is outside the current Jaanch module.',
    applicabilityNotes:['Supports the 2024 ESC office-BP classification used by the prototype: non-elevated <120/<70, elevated 120–139 and/or 70–89, hypertension ≥140/90.','Jaanch treats one reading as a measurement signal and does not diagnose hypertension from a single reading.','Pregnancy-specific blood-pressure interpretation is excluded from this module.'],
    sourceStatus:'current',reviewStatus:'captured',lastVerifiedOn:'2026-10-09',
  },
  {
    id:'AHA-ACC-DYSLIPIDEMIA-2026',title:'2026 ACC/AHA Guideline on the Management of Dyslipidemia',issuingBody:'American College of Cardiology / American Heart Association and partner societies',url:'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia',publicationDate:'2026-03-13',versionLabel:'2026 guideline',evidenceType:'clinical_guideline',
    population:'Children and adults with lipid disorders; Jaanch M13.4 deliberately limits interpretation to adult screening/risk context.',
    applicabilityNotes:['Supports earlier management of atherogenic lipoprotein exposure and PREVENT-based risk assessment in primary prevention.','The guideline highlights LDL-C ≥160 mg/dL as important context in young adulthood and specific management pathways for triglycerides ≥500 mg/dL, with pancreatitis-prevention treatment especially emphasized at ≥1000 mg/dL.','Jaanch does not calculate PREVENT risk or recommend autonomous medication changes in M13.4.'],
    sourceStatus:'current',reviewStatus:'captured',lastVerifiedOn:'2026-10-09',
  },
  {
    id:'WHO-ANAEMIA-2024',title:'Guideline on haemoglobin cutoffs to define anaemia in individuals and populations',issuingBody:'World Health Organization',url:'https://www.who.int/publications/i/item/9789240088542',publicationDate:'2024-03-05',versionLabel:'2024 WHO guideline',evidenceType:'clinical_guideline',
    population:'Individuals and populations across age/physiological groups; Jaanch M13.4 uses only the adult 15–65 nonpregnant male/female thresholds.',
    applicabilityNotes:['Supports haemoglobin thresholds of <120 g/L for nonpregnant women and <130 g/L for men aged 15–65, with severe anaemia below 80 g/L in these adult groups.','Altitude, smoking, pregnancy and other context can alter interpretation; the current module is intentionally narrow and nonpregnant.','Jaanch does not infer the cause of anaemia from haemoglobin alone.'],
    sourceStatus:'current',reviewStatus:'captured',lastVerifiedOn:'2026-10-09',
  },
  {
    id:'WHO-FERRITIN-2020',title:'WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations',issuingBody:'World Health Organization',url:'https://www.who.int/publications/i/item/9789240000124',publicationDate:'2020-04-21',versionLabel:'2020 WHO guideline',evidenceType:'clinical_guideline',
    population:'Individuals and populations across age groups; current Jaanch use is limited to adult low-ferritin/depleted-iron-store context.',
    applicabilityNotes:['Supports low ferritin as evidence of depleted iron stores and an adult threshold of <15 µg/L in otherwise healthy adults.','Inflammation/infection can increase ferritin, so a non-low ferritin value does not exclude iron deficiency in every clinical context.','Jaanch does not prescribe therapeutic iron based on ferritin alone.'],
    sourceStatus:'current',reviewStatus:'captured',lastVerifiedOn:'2026-10-09',
  },
  {
    id:'NICE-THYROID-NG145',title:'Thyroid disease: assessment and management',issuingBody:'National Institute for Health and Care Excellence',url:'https://www.nice.org.uk/guidance/ng145/chapter/recommendations',publicationDate:'2019-11-20',versionLabel:'NG145, updated 12 October 2023',evidenceType:'clinical_guideline',
    population:'Adults, children and young people with suspected or established thyroid disease; Jaanch M13.4 is adult-only and excludes pregnancy-specific interpretation.',
    applicabilityNotes:['Supports TSH as the initial adult test when secondary thyroid dysfunction is not suspected, with FT4/FT3 follow-up depending on whether TSH is high or low.','For adults with subclinical hypothyroidism, NICE uses TSH ≥10 mIU/L on two separate occasions three months apart when considering treatment; a single value is not enough.','For persistent TSH <0.1 mIU/L with evidence/symptoms of thyroid disease, NICE recommends specialist advice; Jaanch does not diagnose or change thyroid medication.'],
    sourceStatus:'current',reviewStatus:'captured',lastVerifiedOn:'2026-10-09',
  },
];
