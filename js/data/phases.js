const PHASES = [
  {
    id: 'forest',
    label: '育林・山林',
    labelEn: 'Forest',
    color: '#2d6a4f',
    colorLight: '#95d5b2',
    icon: '🌲',
    description: '苗木から立木へ。数十年かけて森が育つ。',
    shape: 'tree',
    x: 0, y: 0
  },
  {
    id: 'harvest',
    label: '伐採・搬出',
    labelEn: 'Harvest',
    color: '#6b4226',
    colorLight: '#c9a47e',
    icon: '🪓',
    description: '適切な時期に伐採し、山から搬出する。',
    shape: 'log',
    x: 1, y: 0
  },
  {
    id: 'sawmill',
    label: '製材・加工',
    labelEn: 'Sawmill',
    color: '#8b5e3c',
    colorLight: '#d4a97a',
    icon: '🏭',
    description: '丸太を板材・角材へ加工する。',
    shape: 'lumber',
    x: 2, y: 0
  },
  {
    id: 'distribution',
    label: '流通・販売',
    labelEn: 'Distribution',
    color: '#e07b39',
    colorLight: '#f4b183',
    icon: '🚛',
    description: '木材市場・商社を経て建材として流通する。',
    shape: 'package',
    x: 3, y: 0
  },
  {
    id: 'construction',
    label: '設計・施工',
    labelEn: 'Construction',
    color: '#4a7fb5',
    colorLight: '#a8c8e8',
    icon: '🏗️',
    description: '設計者・施工業者により建物が建てられる。',
    shape: 'building',
    x: 4, y: 0
  },
  {
    id: 'use',
    label: '使用・維持管理',
    labelEn: 'Use & Maintenance',
    color: '#5a7d9a',
    colorLight: '#a9c4d8',
    icon: '🏠',
    description: '建物として使われ、維持管理される。',
    shape: 'house',
    x: 5, y: 0
  },
  {
    id: 'reuse',
    label: '改修・再利用',
    labelEn: 'Reuse',
    color: '#7b9e6b',
    colorLight: '#b8d4a8',
    icon: '♻️',
    description: '解体・改修され、材料として再利用される。',
    shape: 'recycle',
    x: 6, y: 0
  },
  {
    id: 'end',
    label: '廃棄・燃焼',
    labelEn: 'End of Life',
    color: '#c0392b',
    colorLight: '#e8a09a',
    icon: '🔥',
    description: 'バイオマス燃料や廃棄物として処理される。',
    shape: 'fire',
    x: 7, y: 0
  }
];
