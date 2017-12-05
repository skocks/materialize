"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var BoundElements_1 = require("../BoundElements");
var FixedActionButton = /** @class */ (function () {
    function FixedActionButton(el) {
        if (el.cash) {
            this.el = el.get(0);
        }
        else {
            this.el = el;
        }
        if (this.el.buttonInstance) {
            this.el.buttonInstance.destroy();
        }
        this.$el = $(this.el);
        this.el.buttonInstance = this;
        this.boundElements = new BoundElements_1.BoundElements();
        this.setupEventHandlers();
    }
    FixedActionButton.init = function (elements) {
        var result = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (!element.buttonInstance) {
                result.push(new FixedActionButton(element));
            }
            else {
                result.push(element.buttonInstance);
            }
        }
        return result;
    };
    FixedActionButton.prototype.destroy = function () {
        this.removeEventHandlers();
        this.el.buttonInstance = undefined;
    };
    FixedActionButton.prototype.open = function () {
        if (this.$el.hasClass('toolbar')) {
            this.boundElements.bind(window, 'scroll', this.close.bind(this));
            this.boundElements.bind(document.body, 'click', this.close.bind(this), true);
        }
        this.$el.addClass('open');
        this.isOpen = true;
    };
    FixedActionButton.prototype.close = function () {
        if (this.$el.hasClass('toolbar')) {
            this.boundElements.clear(window);
            this.boundElements.clear(document.body);
        }
        this.$el.removeClass('open');
        this.isOpen = false;
    };
    FixedActionButton.prototype.setupEventHandlers = function () {
        if (this.$el.hasClass('click-open')) {
            this.boundElements.bind(this.el, 'click', this.onClick.bind(this));
        }
    };
    FixedActionButton.prototype.removeEventHandlers = function () {
        this.boundElements.clear(this.el);
    };
    FixedActionButton.prototype.onClick = function () {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    };
    return FixedActionButton;
}());
exports.FixedActionButton = FixedActionButton;
$.fn.fab = function () {
    var result = FixedActionButton.init(this);
    return result.length === 1 ? result[0] : result;
};
