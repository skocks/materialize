import * as fs from 'fs';
import * as path from 'path';

import {DOMWindow} from 'jsdom';

const domWindow: DOMWindow = window as DOMWindow;

export function triggerKey(element: any, key: string) {
  triggerKeydown(element, key);
  triggerKeyup(element, key);
}

export function triggerKeydown(element: any, key: string) {
  element.get(0).dispatchEvent(new domWindow.KeyboardEvent('keydown',
    {key: key}));
}

export function triggerKeyup(element: any, key: string) {
  element.get(0).dispatchEvent(new domWindow.KeyboardEvent('keyup',
    {key: key}));
}

export function triggerClick(element: any) {
  element.get(0).dispatchEvent(new domWindow.MouseEvent('click'));
}

export function loadHtml(fileName) {
  document.body.innerHTML = fs.readFileSync(path.resolve(process.cwd(), fileName), {encoding: 'utf-8'});
}
