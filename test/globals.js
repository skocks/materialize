const {JSDOM} = require('jsdom');

global.jsdom = new JSDOM();
global.window = jsdom.window;
global.document = window.document;