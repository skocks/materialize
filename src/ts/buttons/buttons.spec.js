"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var ava_1 = require("ava");
var helpers_1 = require("../../../test/helpers");
var buttons_1 = require("./buttons");
ava_1.test.beforeEach(function () {
    helpers_1.loadHtml('src/ts/buttons/buttons.fixture.html');
});
ava_1.test('fabs return the same instance', function (t) {
    var $element = $('#fab');
    var fab1 = $element.fab();
    t.not($element.get(0).buttonInstance, undefined);
    var fab2 = $element.fab();
    t.not($element.get(0).buttonInstance, undefined);
    t.is(fab1, fab2);
});
ava_1.test('fabs can be manually created and destroyed', function (t) {
    var $element = $('#fab');
    var fab1 = new buttons_1.FixedActionButton($element);
    t.not($element.get(0).buttonInstance, undefined);
    var fab2 = new buttons_1.FixedActionButton($element);
    t.not($element.get(0).buttonInstance, undefined);
    t.not(fab1, fab2);
    fab2.destroy();
    t.is($element.get(0).buttonInstance, undefined);
});
ava_1.test('multiple elements can be instantiated at once', function (t) {
    var $element = $('.btn-fixed-action');
    var all = $element.fab();
    t.is(all.length, 4);
});
ava_1.test('regular fabs dont react on clicks', function (t) {
    var $element = $('#fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.false($element.hasClass('open'));
});
ava_1.test('click-open fabs react on clicks', function (t) {
    var $element = $('#click-open-fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.true($element.hasClass('open'));
    helpers_1.triggerClick($element);
    t.false($element.hasClass('open'));
});
ava_1.test('toolbar fabs dont react on clicks', function (t) {
    var $element = $('#toolbar-fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.false($element.hasClass('open'));
});
ava_1.test('toolbar click-open fabs react open on clicks on the body', function (t) {
    var $element = $('#toolbar-clickopen-fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.true($element.hasClass('open'));
    helpers_1.triggerClick($(document.body));
    t.false($element.hasClass('open'));
});
ava_1.test('toolbar click-open fabs react close on clicks on the body', function (t) {
    var $element = $('#toolbar-clickopen-fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.true($element.hasClass('open'));
    helpers_1.triggerClick($(document.body));
    t.false($element.hasClass('open'));
});
ava_1.test('toolbar click-open fabs react close on scrolling the window', function (t) {
    var $element = $('#toolbar-clickopen-fab');
    $element.fab();
    helpers_1.triggerClick($element);
    t.true($element.hasClass('open'));
    $(window).trigger('scroll');
    t.false($element.hasClass('open'));
});
//# sourceMappingURL=buttons.spec.js.map