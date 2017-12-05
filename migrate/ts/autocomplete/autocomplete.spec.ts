import * as $ from 'cash-dom';

import {test} from 'ava';
import {loadHtml, triggerKey, triggerKeydown, triggerKeyup} from '../../../test/helpers';

import {Key} from '../Key';
import {Autocomplete} from './autocomplete';

function input(element: any, key: string) {
  triggerKeydown(element, key);
  const elementVal = element.val();
  if (elementVal) {
    element.val(`${elementVal}${key}`);
  } else {
    element.val(key);
  }
  triggerKeyup(element, key);
}

test.beforeEach(() => {
  loadHtml('src/ts/autocomplete/autocomplete.fixture.html');
});

test('autocomplete can be manually created and destroyed', (t) => {
  const $element = $('#autocomplete');
  const first: Autocomplete = new Autocomplete($element, {data: {}});
  t.not($element.get(0).autocompleteInstance, undefined);

  const second: Autocomplete = new Autocomplete($element, {data: {}});
  t.not($element.get(0).autocompleteInstance, undefined);
  t.not(first, second);

  second.destroy();
  t.is($element.get(0).autocompleteInstance, undefined);
});

test('calling with options always creates a new instance ', (t) => {
  const $element = $('#autocomplete');
  const first = $element.autocomplete({data: {}});
  const second = $element.autocomplete({data: {}});

  t.not(first, second, 'new instance is created');
});

test('multiple elements can be initialized at once', (t) => {
  const $element = $('.autocomplete');
  const all = $element.autocomplete({data: {}});

  t.is(all.length, 2);
});


test('calling without options return the existing instance ', (t) => {
  const $element = $('#autocomplete');
  let first = $element.autocomplete();
  t.is(first, undefined);

  first = $element.autocomplete({data: []});
  const second = $element.autocomplete();

  t.is(first, second);
});

test('single initializations creates autocomplete dom', (t) => {
  const $normal = $('#autocomplete');
  const $parent = $normal.parent();

  $normal.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    }
  });

  const $autocompleteEl = $parent.find('.autocomplete-content');
  t.is($autocompleteEl.length, 1);
});

test('multiple initializations only creates single autocomplete dom', (t) => {
  const $normal = $('#autocomplete');
  const $parent = $normal.parent();

  $normal.autocomplete({data: {hi: null}});
  $normal.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    }
  });

  const $autocompleteEl = $parent.find('.autocomplete-content');
  t.is($autocompleteEl.length, 1);
});

test('autocomplete works', (t) => {
  const $element = $('#autocomplete');
  const $parent = $element.parent();

  $element.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    }
  });

  input($element, 'g');
  const $autocomplete = $parent.find('.autocomplete-content li > span');
  t.is($autocomplete.length, 1);
  t.is($autocomplete.text(), 'Google');
});

test('the data can be updated', (t) => {
  const $element = $('#autocomplete');
  const $parent = $element.parent();

  $element.autocomplete({data: {Alphabet: null}});
  input($element, 'a');

  let $autocomplete = $parent.find('.autocomplete-content li > span');
  t.is($autocomplete.text(), 'Alphabet');

  $element.autocomplete().updateData({
    Apple: null,
    Google: 'http://placehold.it/250x250',
    Microsoft: null
  });

  $autocomplete = $parent.find('.autocomplete-content li > span');
  t.is($autocomplete.text(), 'Apple');
});

test('should show matching options', (t) => {
  const $element = $('#autocomplete');
  const $parent = $element.parent();
  $element.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    }
  });

  input($element, 'a');
  const $rest = $parent.find('.autocomplete-content li > span');
  t.is($rest.text(), 'Apple');
  const $highlight = $parent.find('.autocomplete-content .highlight');
  t.is($highlight.text(), 'A');
});

test('matching options with earlier match are sorted first', (t) => {
  const $element = $('#autocomplete');
  const $parent = $element.parent();
  $element.autocomplete({
    data: {
      ab: null,
      ba: null
    }
  });

  input($element, 'b');
  const $firstItem = $('.autocomplete-content li:nth-child(1)');
  t.is($firstItem.text(), 'ba');
  const $secondItem = $('.autocomplete-content li:nth-child(2)');
  t.is($secondItem.text(), 'ab');
});

test('should limit results if option is set', (t) => {
  const $element = $('#autocomplete');
  const data = {};
  for (let i = 0; i <= 100; i++) {
    data[`a${i}`] = null;
  }
  $element.autocomplete({
    data: data,
    limit: 20
  });

  const $autocompleteEl = $element.parent().find('.autocomplete-content');

  input($element, 'a');
  t.is($autocompleteEl.children().length, 20);
});

test('mouseclick selects the correct option', (t) => {
  const $element = $('#autocomplete');
  const data = {};
  for (let i = 0; i < 10; i++) {
    data[`a${i}`] = null;
  }
  $element.autocomplete({
    data: data
  });

  input($element, 'a');
  const $listElement = $('.autocomplete-content li:nth-child(2)');
  $listElement.trigger('mouseclick');
  t.is($element.val(), 'a1');
  t.false($element.autocomplete().isOpen());
});

test('input blur closes the autocompletion', (t) => {
  const $element = $('#autocomplete');
  $element.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    }
  });

  input($element, 'a');
  t.true($element.autocomplete().isOpen());

  $element.trigger('blur');
  t.false($element.autocomplete().isOpen());
});

test('minimum input length is taken into account', (t) => {
  const $element = $('#autocomplete');
  $element.autocomplete({
    data: {
      Apple: null,
      Google: 'http://placehold.it/250x250',
      Microsoft: null
    },
    minLength: 2
  });

  input($element, 'a');
  t.false($element.autocomplete().isOpen());

  input($element, 'p');
  t.true($element.autocomplete().isOpen());
});

test('keyboard selection of items works', (t) => {
  const $element = $('#autocomplete');
  const data = {};
  for (let i = 0; i < 10; i++) {
    data[`a${i}`] = null;
  }
  $element.autocomplete({
    data: data
  });

  input($element, 'a');
  t.true($element.autocomplete().isOpen());

  triggerKey($element, Key.ARROW_DOWN);
  const activeItemSelector = '.autocomplete-content li.active';
  let $activeItem = $(activeItemSelector);
  t.is($activeItem.length, 1);
  t.is($activeItem.text(), 'a0');
  t.true($element.autocomplete().isOpen());

  triggerKey($element, Key.ARROW_DOWN);
  $activeItem = $(activeItemSelector);
  t.is($activeItem.length, 1);
  t.is($activeItem.text(), 'a1');
  t.true($element.autocomplete().isOpen());

  triggerKey($element, Key.ARROW_UP);
  $activeItem = $(activeItemSelector);
  t.is($activeItem.length, 1);
  t.is($activeItem.text(), 'a0');
  t.true($element.autocomplete().isOpen());

  triggerKey($element, Key.ENTER);
  t.is($element.val(), 'a0');
  t.false($element.autocomplete().isOpen());
});

test('on autocomplete is called', (t) => {
  let value: string = '';

  const $element = $('#autocomplete');
  const data = {};
  for (let i = 0; i < 10; i++) {
    data[`a${i}`] = null;
  }
  $element.autocomplete({
    data: data,
    onAutocomplete: (v) => {
      value = v;
    }
  });

  input($element, 'a');
  triggerKey($element, Key.ARROW_DOWN);
  triggerKey($element, Key.ENTER);
  t.is(value, 'a0');
});
