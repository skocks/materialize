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
var Parallax = /** @class */ (function (_super) {
    __extends(Parallax, _super);
    function Parallax(element) {
        var _this = _super.call(this, element) || this;
        _this.$img = _this.$element.find('img').first();
        _this.update();
        _this.setupEventHandlers();
        _this.setupStyles();
        Parallax.parallaxes.push(_this);
        return _this;
    }
    Parallax.init = function ($elements) {
        var result = [];
        for (var _i = 0, $elements_1 = $elements; _i < $elements_1.length; _i++) {
            var element = $elements_1[_i];
            if (!element.parallaxInstance) {
                result.push(new Parallax(element));
            }
            else {
                result.push(element.parallaxInstance);
            }
        }
        return result;
    };
    Parallax.handleScroll = function () {
        for (var _i = 0, _a = Parallax.parallaxes; _i < _a.length; _i++) {
            var parallax = _a[_i];
            parallax.update();
        }
    };
    Parallax.prototype.destroy = function () {
        this.boundElements.clear(this.$img.get(0));
        var index = Parallax.parallaxes.indexOf(this);
        if (index > -1) {
            Parallax.parallaxes.splice(index, 1);
            if (0 === Parallax.parallaxes.length) {
                this.boundElements.clear(window);
            }
        }
        this.setInstance(undefined);
    };
    Parallax.prototype.setInstance = function (instance) {
        this.element.parallaxInstance = instance;
    };
    Parallax.prototype.setupEventHandlers = function () {
        this.boundElements.bind(this.$img.get(0), 'load', this.handleImageLoad.bind(this));
        if (Parallax.parallaxes.length === 0) {
            this.boundElements.bind(window, 'scroll', function () { return Parallax.handleScroll(); });
        }
    };
    Parallax.prototype.setupStyles = function () {
        this.$img.get(0).style.opacity = 1;
    };
    Parallax.prototype.handleImageLoad = function () {
        this.update();
        for (var _i = 0, _a = this.$img; _i < _a.length; _i++) {
            var img = _a[_i];
            if (img.complete) {
                $(img).trigger('load');
            }
        }
    };
    Parallax.prototype.update = function () {
        var containerHeight = this.$element.height() > 0 ? this.element.parentElement.offsetHeight : 500;
        var imgHeight = this.$img.get(0).offsetHeight;
        var parallaxDist = imgHeight - containerHeight;
        var bottom = this.$element.offset().top + containerHeight;
        var top = this.$element.offset().top;
        var scrollTop = this.getDocumentScrollTop();
        var windowHeight = window.innerHeight;
        var windowBottom = scrollTop + windowHeight;
        var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
        var parallax = parallaxDist * percentScrolled;
        if (bottom > scrollTop && top < scrollTop + windowHeight) {
            this.$img.get(0).style.transform = "translate3D(-50%, " + parallax + "px, 0)";
        }
    };
    Parallax.parallaxes = [];
    return Parallax;
}(CashObject_1.default));
$.fn.parallax = function () {
    var result = Parallax.init(this);
    return result.length === 1 ? result[0] : result;
};
