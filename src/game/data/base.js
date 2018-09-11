import Images from './images';
import Sfx from './sfx';
import { instruments, tracks } from './music';


export default {
  title: 'ENJOY THE SUNSHINE',
  start: 'Title',
  w: 320,
  h: 480,
  pal: [ // AndroidArts16 - https://androidarts.com/palette/16pal.htm
    [0, 0, 0], // 0 void
    [157, 157, 157], // 1 ash
    [255, 255, 255], // 2 white
    [190, 38, 51], // 3 bloodred
    [224, 111, 139], // 4 pigmeat
    [73, 60, 43], // 5 oldpoop
    [164, 100, 34], // 6 newpoop
    [235, 137, 49], // 7 orange
    [247, 226, 107], // 8 yellow
    [42, 72, 78], // 9 darkgreen
    [68, 137, 26], // 10 green
    [163, 206, 39], // 11 slimegreen
    [27, 38, 50], // 12 nightblue
    [0, 87, 132], // 13 seablue
    [49, 162, 242], // 14 skyblue
    [178, 220, 239], // 15 cloudblue
  ],
  i: Images,
  scale: ['circle', 'star', 'dot', 'font'],
  sfx: Sfx,
  instruments,
  tracks,
};
