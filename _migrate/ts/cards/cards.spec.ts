import * as $ from 'cash-dom';

import {test} from 'ava';
import {loadHtml, triggerClick} from '../../../test/helpers';

import Card from './cards';

test.beforeEach(() => {
  loadHtml('src/ts/cards/cards.fixture.html');
});

test('multiple cards can be initialized at once', (t) => {
  const cards = $('.card').card();
  t.is(cards.length, 2);
});

test('simple cards can be created and destroyed manually', (t) => {
  const $element = $('#simple-card');
  const card1: Card = new Card($element);
  t.not($element.get(0).cardInstance, undefined);

  const card2: Card = new Card($element);
  t.not($element.get(0).cardInstance, undefined);
  t.not(card1, card2);

  card2.destroy();
  t.is($element.get(0).cardInstance, undefined);
});

test('reveal cards can be created and destroyed manually', (t) => {
  const $element = $('#reveal-card');
  const card1: Card = new Card($element);
  t.not($element.get(0).cardInstance, undefined);

  const card2: Card = new Card($element);
  t.not($element.get(0).cardInstance, undefined);
  t.not(card1, card2);

  card2.destroy();
  t.is($element.get(0).cardInstance, undefined);
});

test('cards obtain the same instance', (t) => {
  const $element = $('#simple-card');
  const card1: Card = $element.card();
  t.not($element.get(0).cardInstance, undefined);

  const card2: Card = $element.card();
  t.not($element.get(0).cardInstance, undefined);
  t.is(card1, card2);
});

test('cards with reveal react to title-clicks', (t) => {
  const $element = $('#reveal-card');
  const card: Card = $element.card();

  const titleElement = $element.find('.card-content .card-title');
  triggerClick(titleElement);
  t.true($element.hasClass('reveal'));
  t.not(card, undefined);
});

test('cards with reveal react to activator clicks', (t) => {
  const $element = $('#reveal-card');
  $element.card();

  triggerClick($element.find('.activator'));
  t.true($element.hasClass('reveal'));
});

test('cards with reveal unreveal when revealed title is clicked', (t) => {
  const $element = $('#reveal-card');
  $element.card();

  triggerClick($element.find('.card-content .card-title'));
  t.true($element.hasClass('reveal'));

  triggerClick($element.find('.card-reveal .card-title'));
  t.false($element.hasClass('reveal'));
});
