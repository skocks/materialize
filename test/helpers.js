"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var domWindow = window;
function triggerKey(element, key) {
    triggerKeydown(element, key);
    triggerKeyup(element, key);
}
exports.triggerKey = triggerKey;
function triggerKeydown(element, key) {
    element.get(0).dispatchEvent(new domWindow.KeyboardEvent('keydown', { key: key }));
}
exports.triggerKeydown = triggerKeydown;
function triggerKeyup(element, key) {
    element.get(0).dispatchEvent(new domWindow.KeyboardEvent('keyup', { key: key }));
}
exports.triggerKeyup = triggerKeyup;
function triggerClick(element) {
    element.get(0).dispatchEvent(new domWindow.MouseEvent('click'));
}
exports.triggerClick = triggerClick;
function loadHtml(fileName) {
    document.body.innerHTML = fs.readFileSync(path.resolve(process.cwd(), fileName), { encoding: 'utf-8' });
}
exports.loadHtml = loadHtml;
//# sourceMappingURL=helpers.js.map