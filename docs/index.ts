import * as $ from 'cash-dom';

import './css/index.scss';

import './index.pug';

import './datatable.pug';
import './lists.pug';

import '../src/ts/index';

import * as Waves from 'node-waves';

$(document).ready(() => {
  Waves.init();
  $('.sidenav').sidenav();
});
