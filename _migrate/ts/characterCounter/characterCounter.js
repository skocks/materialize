"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var CashObject_1 = require("../CashObject");
var CharacterCounter = /** @class */ (function (_super) {
    __extends(CharacterCounter, _super);
    function CharacterCounter(element) {
        var _this = _super.call(this, element) || this;
        _this.isInvalid = false;
        _this.isValidLength = false;
        _this._setupCounter();
        _this._setupEventHandlers();
        return _this;
    }
    CharacterCounter.init = function ($elements) {
        var result = [];
        for (var _i = 0, $elements_1 = $elements; _i < $elements_1.length; _i++) {
            var element = $elements_1[_i];
            if (!element.characterCounterInstance) {
                result.push(new CharacterCounter(element, options));
            }
            else {
                result.push(element.characterCounterInstance);
            }
        }
        return result;
    };
    CharacterCounter.prototype.destroy = function () {
        this.element.characterCounterInstance = undefined;
        this._removeEventHandlers();
        this._removeCounter();
    };
    CharacterCounter.prototype._setupEventHandlers = function () {
        var handleUpdateCounterBound = this.updateCounter.bind(this);
        this.boundElements.bind(this.element, 'focus', handleUpdateCounterBound);
        this.boundElements.bind(this.element, 'input', this._handleUpdateCounterBound, true);
    };
    CharacterCounter.prototype._removeEventHandlers = function () {
        this.boundElements.clear(this.element);
    };
    CharacterCounter.prototype._setupCounter = function () {
        this.counterEl = document.createElement('span');
        $(this.counterEl)
            .addClass('character-counter')
            .css({
            float: 'right',
            'font-size': '12px',
            height: 1
        });
        this.$el.parent().append(this.counterEl);
    };
    CharacterCounter.prototype._removeCounter = function () {
        $(this.counterEl).remove();
    };
    CharacterCounter.prototype.updateCounter = function () {
        var maxLength = +this.$el.attr('data-length');
        var actualLength = this.el.value.length;
        this.isValidLength = actualLength <= maxLength;
        var counterString = actualLength;
        if (maxLength) {
            counterString += '/' + maxLength;
            this._validateInput();
        }
        $(this.counterEl).html(counterString);
    };
    CharacterCounter.prototype._validateInput = function () {
        if (this.isValidLength && this.isInvalid) {
            this.isInvalid = false;
            this.$el.removeClass('invalid');
        }
        else if (!this.isValidLength && !this.isInvalid) {
            this.isInvalid = true;
            this.$el.removeClass('valid');
            this.$el.addClass('invalid');
        }
    };
    return CharacterCounter;
}(CashObject_1.default));
exports.CharacterCounter = CharacterCounter;
$.fn.characterCounter = function () {
    var result = CharacterCounter.init(this);
    return result.length === 1 ? result[0] : result;
};
