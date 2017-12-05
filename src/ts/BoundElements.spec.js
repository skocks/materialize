"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var sinon_1 = require("sinon");
var BoundElements_1 = require("./BoundElements");
ava_1.test('binding and removing works', function (t) {
    var subject = new BoundElements_1.BoundElements();
    var addEventListenerSpy = sinon_1.spy();
    var removeEventListenerSpy = sinon_1.spy();
    var eventTarget = {
        addEventListener: addEventListenerSpy,
        dispatchEvent: null,
        removeEventListener: removeEventListenerSpy
    };
    var boundHandler = {};
    subject.bind(eventTarget, 'myevent1', boundHandler);
    subject.bind(eventTarget, 'myevent2', boundHandler, true);
    t.true(addEventListenerSpy.calledTwice);
    var addCall1 = addEventListenerSpy.getCall(0);
    t.is(addCall1.args[0], 'myevent1');
    t.is(addCall1.args[1], boundHandler);
    t.is(addCall1.args[2], false);
    var addCall2 = addEventListenerSpy.getCall(1);
    t.is(addCall2.args[0], 'myevent2');
    t.is(addCall2.args[1], boundHandler);
    t.is(addCall2.args[2], true);
    subject.clear(eventTarget);
    t.true(addEventListenerSpy.calledTwice);
    var removeCall1 = addEventListenerSpy.getCall(0);
    t.is(removeCall1.args[0], 'myevent1');
    t.is(removeCall1.args[1], boundHandler);
    t.is(removeCall1.args[2], false);
    var removeCall2 = addEventListenerSpy.getCall(1);
    t.is(removeCall2.args[0], 'myevent2');
    t.is(removeCall2.args[1], boundHandler);
    t.is(removeCall2.args[2], true);
});
ava_1.test('clearing unrelated target does nothing', function (t) {
    var subject = new BoundElements_1.BoundElements();
    var addEventListenerSpy = sinon_1.spy();
    var removeEventListenerSpy = sinon_1.spy();
    var eventTarget = {
        addEventListener: addEventListenerSpy,
        dispatchEvent: null,
        removeEventListener: removeEventListenerSpy
    };
    subject.clear(eventTarget);
    t.true(addEventListenerSpy.notCalled);
    t.true(removeEventListenerSpy.notCalled);
});
//# sourceMappingURL=BoundElements.spec.js.map