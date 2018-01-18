import * as $ from 'cash-dom';

import './css/index.scss';

import './index.pug';

import './collapsible.pug';
import './datatable.pug';
import './lists.pug';

import {Collapsible} from '../src/ts';

import * as Waves from 'node-waves';

document.addEventListener('DOMContentLoaded', () => {
  Waves.init();
  $('.sidenav').sidenav();
  Collapsible.initialize();
});
