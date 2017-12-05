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
var anim = require("animejs");
var $ = require("cash-dom");
var CashObject_1 = require("../CashObject");
var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider(el, options) {
        if (options === void 0) { options = null; }
        var _this = _super.call(this, el) || this;
        _this.options = $.extend({}, Slider.defaults, options);
        _this.$slider = _this.$element.find('.slides');
        _this.$slides = _this.$slider.children('li');
        _this.activeIndex = _this.$slider.find('.active').index();
        if (_this.activeIndex !== -1) {
            _this.$active = _this.$slides.eq(_this.activeIndex);
        }
        _this.setSliderHeight();
        for (var _i = 0, _a = _this.$slides.find('.caption'); _i < _a.length; _i++) {
            var element = _a[_i];
            _this.animateCaptionIn(element, 0);
        }
        for (var _b = 0, _c = _this.$slides.find('img'); _b < _c.length; _b++) {
            var element = _c[_b];
            var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            var $element = $(element);
            if ($element.attr('src') !== placeholderBase64) {
                $element.css('background-image', "url(\"" + $element.attr('src') + "\")");
                $element.attr('src', placeholderBase64);
            }
        }
        _this.setupIndicators();
        if (_this.$active) {
            _this.$active.css('display', 'block');
        }
        else {
            _this.$slides.first().addClass('active');
            anim({
                targets: _this.$slides.first()[0],
                opacity: 1,
                duration: _this.options.duration,
                easing: 'easeOutQuad'
            });
            _this.activeIndex = 0;
            _this.$active = _this.$slides.eq(_this.activeIndex);
            if (_this.options.indicators) {
                _this.$indicators.eq(_this.activeIndex).addClass('active');
            }
        }
        if (_this.$active.has('img')) {
            anim({
                targets: _this.$active.find('.caption')[0],
                opacity: 1,
                translateX: 0,
                translateY: 0,
                duration: _this.options.duration,
                easing: 'easeOutQuad'
            });
        }
        _this.setupEventHandlers();
        _this.start();
        return _this;
    }
    Slider.init = function ($elements, options) {
        if (options === void 0) { options = null; }
        var result = [];
        if (options) {
            for (var _i = 0, $elements_1 = $elements; _i < $elements_1.length; _i++) {
                var element = $elements_1[_i];
                result.push(new Slider(element, options));
            }
        }
        else {
            for (var _a = 0, $elements_2 = $elements; _a < $elements_2.length; _a++) {
                var element = $elements_2[_a];
                if (!element.sliderInstance) {
                    result.push(new Slider(element, options));
                }
                else {
                    result.push(element.sliderInstance);
                }
            }
        }
        return result;
    };
    Slider.prototype.destroy = function () {
        this.pause();
        this.removeIndicators();
        this.removeEventHandlers();
        this.setInstance(undefined);
    };
    Slider.prototype.set = function (index) {
        var _this = this;
        if (index >= this.$slides.length) {
            index = 0;
        }
        else if (index < 0) {
            index = this.$slides.length - 1;
        }
        if (this.activeIndex !== index) {
            this.$active = this.$slides.eq(this.activeIndex);
            var $caption = this.$active.find('.caption');
            this.$active.removeClass('active');
            anim({
                targets: this.$active[0],
                opacity: 0,
                duration: this.options.duration,
                easing: 'easeOutQuad',
                complete: function () {
                    for (var _i = 0, _a = _this.$slides.not('.active'); _i < _a.length; _i++) {
                        var slide = _a[_i];
                        anim({
                            targets: slide,
                            opacity: 0,
                            translateX: 0,
                            translateY: 0,
                            duration: 0,
                            easing: 'easeOutQuad'
                        });
                    }
                }
            });
            this.animateCaptionIn($caption[0], this.options.duration);
            if (this.options.indicators) {
                this.$indicators.eq(this.activeIndex).removeClass('active');
                this.$indicators.eq(index).addClass('active');
            }
            anim({
                targets: this.$slides.eq(index)[0],
                opacity: 1,
                duration: this.options.duration,
                easing: 'easeOutQuad'
            });
            anim({
                targets: this.$slides.eq(index).find('.caption')[0],
                opacity: 1,
                translateX: 0,
                translateY: 0,
                duration: this.options.duration,
                delay: this.options.duration,
                easing: 'easeOutQuad'
            });
            this.$slides.eq(index).addClass('active');
            this.activeIndex = index;
            this.start();
        }
    };
    Slider.prototype.pause = function () {
        clearInterval(this.interval);
    };
    Slider.prototype.start = function () {
        clearInterval(this.interval);
        this.interval = setInterval(this.handleInterval.bind(this), this.options.duration + this.options.interval);
    };
    Slider.prototype.next = function () {
        var newIndex = this.activeIndex + 1;
        if (newIndex >= this.$slides.length) {
            newIndex = 0;
        }
        else if (newIndex < 0) {
            newIndex = this.$slides.length - 1;
        }
        this.set(newIndex);
    };
    Slider.prototype.prev = function () {
        var newIndex = this.activeIndex - 1;
        if (newIndex >= this.$slides.length) {
            newIndex = 0;
        }
        else if (newIndex < 0) {
            newIndex = this.$slides.length - 1;
        }
        this.set(newIndex);
    };
    Slider.prototype.setInstance = function (instance) {
        this.element.sliderInstance = instance;
    };
    Slider.prototype.setupEventHandlers = function () {
        var handleIndicatorClickBound = this.handleIndicatorClick.bind(this);
        if (this.options.indicators) {
            for (var _i = 0, _a = this.$indicators; _i < _a.length; _i++) {
                var indicator = _a[_i];
                this.boundElements.bind(indicator, 'click', handleIndicatorClickBound);
            }
        }
    };
    Slider.prototype.removeEventHandlers = function () {
        if (this.options.indicators) {
            for (var _i = 0, _a = this.$indicators; _i < _a.length; _i++) {
                var indicator = _a[_i];
                this.boundElements.clear(indicator);
            }
        }
    };
    Slider.prototype.handleIndicatorClick = function (e) {
        this.set($(e.target).index());
    };
    Slider.prototype.handleInterval = function () {
        var newActiveIndex = this.$slider.find('.active').index();
        if (this.$slides.length === newActiveIndex + 1) {
            newActiveIndex = 0;
        }
        else {
            newActiveIndex += 1;
        }
        this.set(newActiveIndex);
    };
    Slider.prototype.animateCaptionIn = function (caption, duration) {
        var animOptions = {
            targets: caption,
            opacity: 0,
            duration: duration,
            easing: 'easeOutQuad'
        };
        if ($(caption).hasClass('center-align')) {
            animOptions.translateY = -100;
        }
        else if ($(caption).hasClass('right-align')) {
            animOptions.translateX = 100;
        }
        else if ($(caption).hasClass('left-align')) {
            animOptions.translateX = -100;
        }
        anim(animOptions);
    };
    Slider.prototype.setSliderHeight = function () {
        if (!this.$element.hasClass('fullscreen')) {
            if (this.options.indicators) {
                if ('string' === typeof this.options.height) {
                    this.$element.css('height', this.options.height);
                }
                else {
                    this.$element.css('height', (this.options.height + 40) + 'px');
                }
            }
            else {
                this.$element.css('height', this.options.height + 'px');
            }
            this.$slider.css('height', this.options.height + 'px');
        }
    };
    Slider.prototype.setupIndicators = function () {
        if (this.options.indicators) {
            var indicatorContainer = $('<ul class="indicators"></ul>');
            for (var _i = 0, _a = this.$slides; _i < _a.length; _i++) {
                var unused = _a[_i];
                var $indicator = $('<li class="indicator-item"></li>');
                indicatorContainer.append($indicator);
            }
            this.$element.append(indicatorContainer);
            this.$indicators = indicatorContainer.children('li.indicator-item');
        }
    };
    Slider.prototype.removeIndicators = function () {
        this.$element.find('ul.indicators').remove();
    };
    Slider.defaults = {
        indicators: true,
        height: 400,
        duration: 500,
        interval: 6000
    };
    return Slider;
}(CashObject_1.default));
$.fn.slider = function (options) {
    if (options === void 0) { options = null; }
    var result = Slider.init(this, options);
    return result.length === 1 ? result[0] : result;
};
