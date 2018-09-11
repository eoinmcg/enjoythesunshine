const instruments = {
  VOX: {
    wave: 'square',
    pan: -0.1,
    gain: 0.1,
  },
  BSS: {
    wave: 'triangle',
    pan: 0.5,
    gain: 0.7,
  },
};

const tracks = {
  win: {
    bpm: 120,
    isLooping: false,
    parts: [
      'VOXA41A#41A41A#41G44C54',
      'BSSA41A#41A41A#41G44C54',
    ],
  },
  dead: {
    bpm: 120,
    isLooping: false,
    parts: [
      'VOXF31E31D31B31A#24',
      'BSSF31E31D31B31A#24',
    ],
  },
  help: {
    bpm: 180,
    isLooping: false,
    parts: [
      'VOXC22C22G12G12A#12A#12B12B12G12E12G14',
      'BSSC22C22G12G12A#12A#12B12B12G12E12G14',
    ],
  },
};

export { instruments, tracks };
