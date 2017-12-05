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
        this.setInstance(this);
    }
    CashObject.prototype.getIdFromTrigger = function (trigger) {
        var id = trigger.getAttribute('data-target');
        if (!id) {
            id = trigger.getAttribute('href');
            if (id) {
                id = id.slice(1);
            }
            else {
                id = '';
            }
        }
        return id;
    };
    CashObject.prototype.getDocumentScrollTop = function () {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };
    return CashObject;
}());
exports.default = CashObject;
