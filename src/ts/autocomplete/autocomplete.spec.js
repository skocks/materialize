"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var ava_1 = require("ava");
var helpers_1 = require("../../../test/helpers");
var Key_1 = require("../Key");
var autocomplete_1 = require("./autocomplete");
function input(element, key) {
    helpers_1.triggerKeydown(element, key);
    var elementVal = element.val();
    if (elementVal) {
        element.val("" + elementVal + key);
    }
    else {
        element.val(key);
    }
    helpers_1.triggerKeyup(element, key);
}
ava_1.test.beforeEach(function () {
    helpers_1.loadHtml('src/ts/autocomplete/autocomplete.fixture.html');
});
ava_1.test('autocomplete can be manually created and destroyed', function (t) {
    var $element = $('#autocomplete');
    var first = new autocomplete_1.Autocomplete($element, { data: {} });
    t.not($element.get(0).autocompleteInstance, undefined);
    var second = new autocomplete_1.Autocomplete($element, { data: {} });
    t.not($element.get(0).autocompleteInstance, undefined);
    t.not(first, second);
    second.destroy();
    t.is($element.get(0).autocompleteInstance, undefined);
});
ava_1.test('calling with options always creates a new instance ', function (t) {
    var $element = $('#autocomplete');
    var first = $element.autocomplete({ data: {} });
    var second = $element.autocomplete({ data: {} });
    t.not(first, second, 'new instance is created');
});
ava_1.test('multiple elements can be initialized at once', function (t) {
    var $element = $('.autocomplete');
    var all = $element.autocomplete({ data: {} });
    t.is(all.length, 2);
});
ava_1.test('calling without options return the existing instance ', function (t) {
    var $element = $('#autocomplete');
    var first = $element.autocomplete();
    t.is(first, undefined);
    first = $element.autocomplete({ data: [] });
    var second = $element.autocomplete();
    t.is(first, second);
});
ava_1.test('single initializations creates autocomplete dom', function (t) {
    var $normal = $('#autocomplete');
    var $parent = $normal.parent();
    $normal.autocomplete({
        data: {
            Apple: null,
            Google: 'http://placehold.it/250x250',
            Microsoft: null
        }
    });
    var $autocompleteEl = $parent.find('.autocomplete-content');
    t.is($autocompleteEl.length, 1);
});
ava_1.test('multiple initializations only creates single autocomplete dom', function (t) {
    var $normal = $('#autocomplete');
    var $parent = $normal.parent();
    $normal.autocomplete({ data: { hi: null } });
    $normal.autocomplete({
        data: {
            Apple: null,
            Google: 'http://placehold.it/250x250',
            Microsoft: null
        }
    });
    var $autocompleteEl = $parent.find('.autocomplete-content');
    t.is($autocompleteEl.length, 1);
});
ava_1.test('autocomplete works', function (t) {
    var $element = $('#autocomplete');
    var $parent = $element.parent();
    $element.autocomplete({
        data: {
            Apple: null,
            Google: 'http://placehold.it/250x250',
            Microsoft: null
        }
    });
    input($element, 'g');
    var $autocomplete = $parent.find('.autocomplete-content li > span');
    t.is($autocomplete.length, 1);
    t.is($autocomplete.text(), 'Google');
});
ava_1.test('the data can be updated', function (t) {
    var $element = $('#autocomplete');
    var $parent = $element.parent();
    $element.autocomplete({ data: { Alphabet: null } });
    input($element, 'a');
    var $autocomplete = $parent.find('.autocomplete-content li > span');
    t.is($autocomplete.text(), 'Alphabet');
    $element.autocomplete().updateData({
        Apple: null,
        Google: 'http://placehold.it/250x250',
        Microsoft: null
    });
    $autocomplete = $parent.find('.autocomplete-content li > span');
    t.is($autocomplete.text(), 'Apple');
});
ava_1.test('should show matching options', function (t) {
    var $element = $('#autocomplete');
    var $parent = $element.parent();
    $element.autocomplete({
        data: {
            Apple: null,
            Google: 'http://placehold.it/250x250',
            Microsoft: null
        }
    });
    input($element, 'a');
    var $rest = $parent.find('.autocomplete-content li > span');
    t.is($rest.text(), 'Apple');
    var $highlight = $parent.find('.autocomplete-content .highlight');
    t.is($highlight.text(), 'A');
});
ava_1.test('matching options with earlier match are sorted first', function (t) {
    var $element = $('#autocomplete');
    var $parent = $element.parent();
    $element.autocomplete({
        data: {
            ab: null,
            ba: null
        }
    });
    input($element, 'b');
    var $firstItem = $('.autocomplete-content li:nth-child(1)');
    t.is($firstItem.text(), 'ba');
    var $secondItem = $('.autocomplete-content li:nth-child(2)');
    t.is($secondItem.text(), 'ab');
});
ava_1.test('should limit results if option is set', function (t) {
    var $element = $('#autocomplete');
    var data = {};
    for (var i = 0; i <= 100; i++) {
        data["a" + i] = null;
    }
    $element.autocomplete({
        data: data,
        limit: 20
    });
    var $autocompleteEl = $element.parent().find('.autocomplete-content');
    input($element, 'a');
    t.is($autocompleteEl.children().length, 20);
});
ava_1.test('mouseclick selects the correct option', function (t) {
    var $element = $('#autocomplete');
    var data = {};
    for (var i = 0; i < 10; i++) {
        data["a" + i] = null;
    }
    $element.autocomplete({
        data: data
    });
    input($element, 'a');
    var $listElement = $('.autocomplete-content li:nth-child(2)');
    $listElement.trigger('mouseclick');
    t.is($element.val(), 'a1');
    t.false($element.autocomplete().isOpen());
});
ava_1.test('input blur closes the autocompletion', function (t) {
    var $element = $('#autocomplete');
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
ava_1.test('minimum input length is taken into account', function (t) {
    var $element = $('#autocomplete');
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
ava_1.test('keyboard selection of items works', function (t) {
    var $element = $('#autocomplete');
    var data = {};
    for (var i = 0; i < 10; i++) {
        data["a" + i] = null;
    }
    $element.autocomplete({
        data: data
    });
    input($element, 'a');
    t.true($element.autocomplete().isOpen());
    helpers_1.triggerKey($element, Key_1.Key.ARROW_DOWN);
    var activeItemSelector = '.autocomplete-content li.active';
    var $activeItem = $(activeItemSelector);
    t.is($activeItem.length, 1);
    t.is($activeItem.text(), 'a0');
    t.true($element.autocomplete().isOpen());
    helpers_1.triggerKey($element, Key_1.Key.ARROW_DOWN);
    $activeItem = $(activeItemSelector);
    t.is($activeItem.length, 1);
    t.is($activeItem.text(), 'a1');
    t.true($element.autocomplete().isOpen());
    helpers_1.triggerKey($element, Key_1.Key.ARROW_UP);
    $activeItem = $(activeItemSelector);
    t.is($activeItem.length, 1);
    t.is($activeItem.text(), 'a0');
    t.true($element.autocomplete().isOpen());
    helpers_1.triggerKey($element, Key_1.Key.ENTER);
    t.is($element.val(), 'a0');
    t.false($element.autocomplete().isOpen());
});
ava_1.test('on autocomplete is called', function (t) {
    var value = '';
    var $element = $('#autocomplete');
    var data = {};
    for (var i = 0; i < 10; i++) {
        data["a" + i] = null;
    }
    $element.autocomplete({
        data: data,
        onAutocomplete: function (v) {
            value = v;
        }
    });
    input($element, 'a');
    helpers_1.triggerKey($element, Key_1.Key.ARROW_DOWN);
    helpers_1.triggerKey($element, Key_1.Key.ENTER);
    t.is(value, 'a0');
});
//# sourceMappingURL=autocomplete.spec.js.map