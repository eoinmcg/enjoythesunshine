import Game from './engine/game';
import Data from './data/base';

import Title from './states/title';
import Main from './states/main';
import Help from './states/help';

import {Sprite} from './entities/sprite';
import {Bird} from './entities/bird';
import {Ledge} from './entities/ledge';
import {Nest} from './entities/nest';
import {Poo} from './entities/poo';
import {Human} from './entities/human';
import {Baddie} from './entities/baddie';
import {Cat} from './entities/cat';
import {Worm} from './entities/worm';
import {Drop} from './entities/drop';
import {Text} from './entities/text';
import {Boom} from './entities/boom';
import {Particle} from './entities/particle';
import {Control} from './entities/control';

const o = Data;
o.states = { 
  Title, 
  Help, 
  Main
  };
o.ents = {
  Sprite,
  Bird, 
  Ledge, 
  Nest, 
  Poo, 
  Human, 
  Baddie, 
  Cat, 
  Worm, 
  Drop, 
  Text, 
  Boom, 
  Particle,
  Control,
};

new Game(o);
