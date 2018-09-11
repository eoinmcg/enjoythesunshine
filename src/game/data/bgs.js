export default [
  {
    title: 'The Park',
    col: { bg: 15, ground: 11 },
    floor: 100,
    v: { x: 2, y: 0 },
    bg: [
      { num: 1, name: 'sun' },
      { num: 3, name: 'bush' },
      { num: 4, name: 'cloud' },
      { num: 8, name: 'star' },
    ],
    fg: [
      { num: 8, name: 'flower' },
    ],
    tree: [16,15,370],
    nest: [38,40],
    bird: [38,200],
    ledges: [
      {w: 15, x: 32, y: 58},
      {w: 20, x: 32, y: 200},
      {w: 30, x: 32, y: 300},
    ],
    events: [
      {t: 1000, n: 'Baddie', d: { i: 'hornet', yRange: 200} },
      {t: 2000, n: 'Baddie', d: { i: 'hornet', yRange: 300} },
      {t: 3000, n: 'Baddie', d: { i: 'hornet', yRange: 100} },
      {t: 5000, n: 'Cat', d: {} },
      {t: 7000, n: 'Baddie', d: { i: 'gull', yRange: 100} },
      {t: 8000, n: 'Baddie', d: { i: 'hornet', yRange: 50} }
    ]
  }
];
