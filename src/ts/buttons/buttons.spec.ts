import * as $ from 'cash-dom';

import {test} from 'ava';
import {loadHtml, triggerClick} from '../../../test/helpers';

import {FixedActionButton} from './buttons';

test.beforeEach(() => {
  loadHtml('src/ts/buttons/buttons.fixture.html');
});

test('fabs return the same instance', (t) => {
  const $element = $('#fab');
  const fab1: FixedActionButton = $element.fab();
  t.not($element.get(0).buttonInstance, undefined);

  const fab2: FixedActionButton = $element.fab();
  t.not($element.get(0).buttonInstance, undefined);
  t.is(fab1, fab2);
});

test('fabs can be manually created and destroyed', (t) => {
  const $element = $('#fab');
  const fab1: FixedActionButton = new FixedActionButton($element);
  t.not($element.get(0).buttonInstance, undefined);

  const fab2: FixedActionButton = new FixedActionButton($element);
  t.not($element.get(0).buttonInstance, undefined);
  t.not(fab1, fab2);

  fab2.destroy();
  t.is($element.get(0).buttonInstance, undefined);
});

test('multiple elements can be instantiated at once', (t) => {
  const $element = $('.btn-fixed-action');
  const all = $element.fab();
  t.is(all.length, 4);
});

test('regular fabs dont react on clicks', (t) => {
  const $element = $('#fab');
  $element.fab();

  triggerClick($element);
  t.false($element.hasClass('open'));
});

test('click-open fabs react on clicks', (t) => {
  const $element = $('#click-open-fab');
  $element.fab();

  triggerClick($element);
  t.true($element.hasClass('open'));
  triggerClick($element);
  t.false($element.hasClass('open'));
});

test('toolbar fabs dont react on clicks', (t) => {
  const $element = $('#toolbar-fab');
  $element.fab();

  triggerClick($element);
  t.false($element.hasClass('open'));
});

test('toolbar click-open fabs react open on clicks on the body', (t) => {
  const $element = $('#toolbar-clickopen-fab');
  $element.fab();

  triggerClick($element);
  t.true($element.hasClass('open'));
  triggerClick($(document.body));
  t.false($element.hasClass('open'));
});

test('toolbar click-open fabs react close on clicks on the body', (t) => {
  const $element = $('#toolbar-clickopen-fab');
  $element.fab();

  triggerClick($element);
  t.true($element.hasClass('open'));
  triggerClick($(document.body));
  t.false($element.hasClass('open'));
});

test('toolbar click-open fabs react close on scrolling the window', (t) => {
  const $element = $('#toolbar-clickopen-fab');
  $element.fab();

  triggerClick($element);
  t.true($element.hasClass('open'));
  $(window).trigger('scroll');
  t.false($element.hasClass('open'));
});
