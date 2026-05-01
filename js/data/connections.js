// phase-to-phase connections (material/information flow)
const PHASE_CONNECTIONS = [
  { source: 'forest',       target: 'harvest',      type: 'material', label: '立木' },
  { source: 'harvest',      target: 'sawmill',      type: 'material', label: '丸太' },
  { source: 'sawmill',      target: 'distribution', type: 'material', label: '板材・角材' },
  { source: 'distribution', target: 'construction', type: 'material', label: '建材' },
  { source: 'construction', target: 'use',          type: 'material', label: '建物' },
  { source: 'use',          target: 'reuse',        type: 'material', label: '古材' },
  { source: 'reuse',        target: 'construction', type: 'material', label: '再生材' },
  { source: 'reuse',        target: 'end',          type: 'material', label: '廃材' },
  { source: 'use',          target: 'end',          type: 'material', label: '廃棄' },
  // information flows
  { source: 'forest',       target: 'distribution', type: 'info',     label: '産地証明' },
  { source: 'sawmill',      target: 'construction', type: 'info',     label: '品質情報' },
  { source: 'construction', target: 'use',          type: 'info',     label: '建物情報' },
  { source: 'use',          target: 'reuse',        type: 'info',     label: '履歴情報' },
];

// potential information connections enabled by SDW
const POTENTIAL_INFO_CONNECTIONS = [
  { source: 'harvest',      target: 'sawmill',      label: '原木ID' },
  { source: 'sawmill',      target: 'distribution', label: '材料追跡' },
  { source: 'construction', target: 'reuse',        label: '建物台帳' },
  { source: 'reuse',        target: 'distribution', label: '古材データ' },
  { source: 'end',          target: 'forest',       label: 'CO₂循環' },
];

// stakeholder-to-stakeholder connections (collaboration)
const STAKEHOLDER_CONNECTIONS = [
  { source: 'landowner',  target: 'forester',   phases: ['forest'] },
  { source: 'forester',   target: 'forestco',   phases: ['forest', 'harvest'] },
  { source: 'forestco',   target: 'logger',     phases: ['harvest'] },
  { source: 'logger',     target: 'sawmiller',  phases: ['sawmill'] },
  { source: 'sawmiller',  target: 'market',     phases: ['distribution'] },
  { source: 'market',     target: 'trader',     phases: ['distribution'] },
  { source: 'trader',     target: 'precut',     phases: ['distribution'] },
  { source: 'precut',     target: 'contractor', phases: ['construction'] },
  { source: 'trader',     target: 'contractor', phases: ['construction'] },
  { source: 'architect',  target: 'contractor', phases: ['construction'] },
  { source: 'architect',  target: 'owner',      phases: ['construction', 'use'] },
  { source: 'owner',      target: 'resident',   phases: ['use'] },
  { source: 'owner',      target: 'facility',   phases: ['use'] },
  { source: 'facility',   target: 'architect',  phases: ['reuse'] },
  { source: 'owner',      target: 'demolish',   phases: ['reuse', 'end'] },
  { source: 'demolish',   target: 'recycler',   phases: ['reuse'] },
  { source: 'demolish',   target: 'biomass',    phases: ['end'] },
  { source: 'admin',      target: 'forester',   phases: ['forest'] },
  { source: 'admin',      target: 'owner',      phases: ['construction'] },
  { source: 'cert',       target: 'forestco',   phases: ['forest'] },
  { source: 'cert',       target: 'sawmiller',  phases: ['sawmill'] },
];
