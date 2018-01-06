"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var BoundElements_1 = require("./BoundElements");
ava_1.test('binding and removing works', function (t) {
    var subject = new BoundElements_1.BoundElements();
    subject.bind();
});
