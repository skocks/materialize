import {test} from 'ava';
import {SinonSpy, spy} from 'sinon';
import {BoundElements} from './BoundElements';

test('binding and removing works', (t) => {
  const subject = new BoundElements();

  const addEventListenerSpy: SinonSpy = spy();
  const removeEventListenerSpy: SinonSpy = spy();

  const eventTarget: EventTarget = {
    addEventListener: addEventListenerSpy,
    dispatchEvent: null,
    removeEventListener: removeEventListenerSpy
  };
  const boundHandler: any = {};

  subject.bind(eventTarget, 'myevent1', boundHandler);
  subject.bind(eventTarget, 'myevent2', boundHandler, true);
  t.true(addEventListenerSpy.calledTwice);
  const addCall1 = addEventListenerSpy.getCall(0);
  t.is(addCall1.args[0], 'myevent1');
  t.is(addCall1.args[1], boundHandler);
  t.is(addCall1.args[2], false);

  const addCall2 = addEventListenerSpy.getCall(1);
  t.is(addCall2.args[0], 'myevent2');
  t.is(addCall2.args[1], boundHandler);
  t.is(addCall2.args[2], true);

  subject.clear(eventTarget);
  t.true(addEventListenerSpy.calledTwice);
  const removeCall1 = addEventListenerSpy.getCall(0);
  t.is(removeCall1.args[0], 'myevent1');
  t.is(removeCall1.args[1], boundHandler);
  t.is(removeCall1.args[2], false);

  const removeCall2 = addEventListenerSpy.getCall(1);
  t.is(removeCall2.args[0], 'myevent2');
  t.is(removeCall2.args[1], boundHandler);
  t.is(removeCall2.args[2], true);
});

test('clearing unrelated target does nothing', (t) => {
  const subject = new BoundElements();

  const addEventListenerSpy: SinonSpy = spy();
  const removeEventListenerSpy: SinonSpy = spy();

  const eventTarget: EventTarget = {
    addEventListener: addEventListenerSpy,
    dispatchEvent: null,
    removeEventListener: removeEventListenerSpy
  };

  subject.clear(eventTarget);
  t.true(addEventListenerSpy.notCalled);
  t.true(removeEventListenerSpy.notCalled);
});
