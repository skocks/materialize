import 'materialize-strict/dist/materialize-strict.css';

import './index.pug';

import './collapsible.pug';
import './datatable.pug';
import './lists.pug';

import * as materialize from 'materialize-strict';
const { Collapsible, Sidenav } = materialize;

// import * as Waves from 'node-waves';

document.addEventListener('DOMContentLoaded', () => {
  console.log(materialize);
  // Waves.init();
  Sidenav.initialize();
  Collapsible.initialize();
});
