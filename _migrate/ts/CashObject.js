"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var BoundElements_1 = require("./BoundElements");
var CashObject = /** @class */ (function () {
    function CashObject(element) {
        if (element.cash) {
            this.element = element.get(0);
        }
        else {
            this.element = element;
        }
        this.$element = $(this.element);
        this.boundElements = new BoundElements_1.BoundElements();
    }
    return CashObject;
}());
exports.default = CashObject;
