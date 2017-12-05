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
var anime = require("animejs");
var $ = require("cash-dom");
var CashObject_1 = require("../CashObject");
var Sidenav = /** @class */ (function (_super) {
    __extends(Sidenav, _super);
    function Sidenav(element, options) {
        if (options === void 0) { options = null; }
        var _this = _super.call(this, element) || this;
        _this.id = _this.$element.attr('id');
        _this.options = $.extend({}, Sidenav.defaults, options);
        _this.isOpen = false;
        _this.isFixed = _this.element.classList.contains('sidenav-fixed');
        _this.isDragged = false;
        _this.createOverlay();
        _this.createDragTarget();
        _this.setupEventHandlers();
        _this.setupClasses();
        _this.setupFixed();
        Sidenav.sidenavInstances.push(_this);
        return _this;
    }
    Sidenav.init = function ($elements, options) {
        if (options === void 0) { options = null; }
        var result = [];
        if (options) {
            for (var _i = 0, $elements_1 = $elements; _i < $elements_1.length; _i++) {
                var element = $elements_1[_i];
                result.push(new Sidenav(element, options));
            }
        }
        else {
            for (var _a = 0, $elements_2 = $elements; _a < $elements_2.length; _a++) {
                var element = $elements_2[_a];
                if (!element.sidenavInstance) {
                    result.push(new Sidenav(element, options));
                }
                else {
                    result.push(element.sidenavInstance);
                }
            }
        }
        return result;
    };
    Sidenav.prototype.destroy = function () {
        this.removeEventHandlers();
        this.removeOverlay();
        this.removeClasses();
        this.dragTarget.parentNode.removeChild(this.dragTarget);
        var index = Sidenav.sidenavInstances.indexOf(this);
        if (index >= 0) {
            Sidenav.sidenavInstances.splice(index, 1);
        }
    };
    Sidenav.prototype.open = function () {
        if (this.isOpen === true) {
            return;
        }
        this.isOpen = true;
        if (typeof (this.options.onOpenStart) === 'function') {
            this.options.onOpenStart.call(this, this.element);
        }
        if (this.isFixed && window.innerWidth > 992) {
            anime.remove(this.element);
            anime({
                targets: this.element,
                translateX: 0,
                duration: 0,
                easing: 'easeOutQuad'
            });
            this.enableBodyScrolling();
            this.overlay.style.display = 'none';
        }
        else {
            this.preventBodyScrolling();
            if (!this.isDragged || this.percentOpen !== 1) {
                this.animateIn();
            }
        }
    };
    Sidenav.prototype.close = function () {
        if (this.isOpen === false) {
            return;
        }
        this.isOpen = false;
        if (typeof (this.options.onCloseStart) === 'function') {
            this.options.onCloseStart.call(this, this.element);
        }
        if (this.isFixed && window.innerWidth > 992) {
            var transformX = this.options.edge === 'left' ? '-105%' : '105%';
            this.element.style.transform = "translateX(" + transformX + ")";
        }
        else {
            this.enableBodyScrolling();
            if (!this.isDragged || this.percentOpen !== 0) {
                this.animateOut();
            }
            else {
                this.overlay.style.display = 'none';
            }
        }
    };
    Sidenav.prototype.setInstance = function (instance) {
        this.element.sidenavInstance = instance;
    };
    Sidenav.prototype.createOverlay = function () {
        var overlay = document.createElement('div');
        overlay.classList.add('sidenav-overlay');
        document.body.appendChild(overlay);
        var closeBound = this.close.bind(this);
        this.boundElements.bind(overlay, 'click', closeBound);
        this.overlay = overlay;
    };
    Sidenav.prototype.setupEventHandlers = function () {
        if (Sidenav.sidenavInstances.length === 0) {
            this.boundElements.bind(document.body, 'click', this.handleTriggerClick.bind(this));
        }
        var handleCloseDragBound = this._handleCloseDrag.bind(this);
        var handleCloseReleaseBound = this._handleCloseRelease.bind(this);
        this.boundElements.bind(this.dragTarget, 'touchmove', this._handleDragTargetDrag.bind(this));
        this.boundElements.bind(this.dragTarget, 'touchend', this._handleDragTargetRelease.bind(this));
        this.boundElements.bind(this.overlay, 'touchmove', handleCloseDragBound);
        this.boundElements.bind(this.overlay, 'touchend', handleCloseReleaseBound);
        this.boundElements.bind(this.element, 'touchmove', handleCloseDragBound);
        this.boundElements.bind(this.element, 'touchend', handleCloseReleaseBound);
        this.boundElements.bind(this.element, 'click', this._handleCloseTriggerClick.bind(this));
        if (this.isFixed) {
            window.addEventListener('resize', this._handleWindowResize.bind(this));
        }
    };
    Sidenav.prototype.removeEventHandlers = function () {
        this.boundElements.clear(window);
        this.boundElements.clear(document.body);
        this.boundElements.clear(this.dragTarget);
        this.boundElements.clear(this.overlay);
        this.boundElements.clear(this.element);
    };
    Sidenav.prototype.handleTriggerClick = function (e) {
        var $trigger = $(e.target).closest('.sidenav-trigger');
        if (e.target && $trigger.length) {
            var sidenavId = this.getIdFromTrigger($trigger[0]);
            var sidenav = document.getElementById(sidenavId);
            if (!sidenav) {
                throw new Error("no sidenav found for id: '" + sidenav + "'");
            }
            var sidenavInstance = sidenav.sidenavInstance;
            if (sidenavInstance) {
                sidenavInstance.open();
            }
            else {
                throw new Error("element with id '" + sidenav + "' has no sidennav instance");
            }
            e.preventDefault();
        }
    };
    Sidenav.prototype.startDrag = function (e) {
        var clientX = e.targetTouches[0].clientX;
        this.isDragged = true;
        this.startingXpos = clientX;
        this.xPos = this.startingXpos;
        this.time = Date.now();
        this.width = this.element.getBoundingClientRect().width;
        this.overlay.style.display = 'block';
        anime.remove(this.element);
        anime.remove(this.overlay);
    };
    Sidenav.prototype._dragMoveUpdate = function (e) {
        var clientX = e.targetTouches[0].clientX;
        this.deltaX = Math.abs(this.xPos - clientX);
        this.xPos = clientX;
        this.velocityX = this.deltaX / (Date.now() - this.time);
        this.time = Date.now();
    };
    Sidenav.prototype._handleDragTargetDrag = function (e) {
        if (!this.isDragged) {
            this.startDrag(e);
        }
        this._dragMoveUpdate(e);
        var totalDeltaX = this.xPos - this.startingXpos;
        var dragDirection = totalDeltaX > 0 ? 'right' : 'left';
        totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
        if (this.options.edge === dragDirection) {
            totalDeltaX = 0;
        }
        var transformX = totalDeltaX;
        var transformPrefix = 'translateX(-100%)';
        if (this.options.edge === 'right') {
            transformPrefix = 'translateX(100%)';
            transformX = -transformX;
        }
        this.percentOpen = Math.min(1, totalDeltaX / this.width);
        this.element.style.transform = transformPrefix + " translateX(" + transformX + "px)";
        this.overlay.style.opacity = this.percentOpen;
    };
    Sidenav.prototype._handleDragTargetRelease = function () {
        if (this.isDragged) {
            if (this.percentOpen > .5) {
                this.open();
            }
            else {
                this.animateOut();
            }
            this.isDragged = false;
        }
    };
    Sidenav.prototype._handleCloseDrag = function (e) {
        if (this.isOpen) {
            if (!this.isDragged) {
                this.startDrag(e);
            }
            this._dragMoveUpdate(e);
            var totalDeltaX = this.xPos - this.startingXpos;
            var dragDirection = totalDeltaX > 0 ? 'right' : 'left';
            totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
            if (this.options.edge !== dragDirection) {
                totalDeltaX = 0;
            }
            var transformX = -totalDeltaX;
            if (this.options.edge === 'right') {
                transformX = -transformX;
            }
            this.percentOpen = Math.min(1, 1 - totalDeltaX / this.width);
            this.element.style.transform = "translateX(" + transformX + "px)";
            this.overlay.style.opacity = this.percentOpen;
        }
    };
    Sidenav.prototype._handleCloseRelease = function () {
        if (this.isOpen && this.isDragged) {
            if (this.percentOpen > .5) {
                this.animateIn();
            }
            else {
                this.close();
            }
            this.isDragged = false;
        }
    };
    Sidenav.prototype._handleCloseTriggerClick = function (e) {
        var $closeTrigger = $(e.target).closest('.sidenav-close');
        if ($closeTrigger.length) {
            this.close();
        }
    };
    Sidenav.prototype._handleWindowResize = function () {
        if (window.innerWidth > 992) {
            this.open();
        }
        else {
            this.close();
        }
    };
    Sidenav.prototype.setupClasses = function () {
        if (this.options.edge === 'right') {
            this.element.classList.add('right-aligned');
            this.dragTarget.classList.add('right-aligned');
        }
    };
    Sidenav.prototype.removeClasses = function () {
        this.element.classList.remove('right-aligned');
        this.dragTarget.classList.remove('right-aligned');
    };
    Sidenav.prototype.setupFixed = function () {
        if (this.isFixed && window.innerWidth > 992) {
            this.open();
        }
    };
    Sidenav.prototype.createDragTarget = function () {
        var dragTarget = document.createElement('div');
        dragTarget.classList.add('drag-target');
        document.body.appendChild(dragTarget);
        this.dragTarget = dragTarget;
    };
    Sidenav.prototype.preventBodyScrolling = function () {
        var body = document.body;
        body.style.overflow = 'hidden';
    };
    Sidenav.prototype.enableBodyScrolling = function () {
        var body = document.body;
        body.style.overflow = '';
    };
    Sidenav.prototype.animateIn = function () {
        this.animateSidenavIn();
        this.animateOverlayIn();
    };
    Sidenav.prototype.animateSidenavIn = function () {
        var _this = this;
        var isLeftEdge = this.options.edge === 'left';
        var slideOutPercent = isLeftEdge ? -1 : 1;
        if (this.isDragged) {
            if (isLeftEdge) {
                slideOutPercent = slideOutPercent + this.percentOpen;
            }
            else {
                slideOutPercent = slideOutPercent - this.percentOpen;
            }
        }
        anime.remove(this.element);
        anime({
            targets: this.element,
            translateX: [slideOutPercent * 100 + "%", 0],
            duration: this.options.inDuration,
            easing: 'easeOutQuad',
            complete: function () {
                // Run onOpenEnd callback
                if (typeof (_this.options.onOpenEnd) === 'function') {
                    _this.options.onOpenEnd.call(_this, _this.element);
                }
            }
        });
    };
    Sidenav.prototype.animateOverlayIn = function () {
        var start = 0;
        if (this.isDragged) {
            start = this.percentOpen;
        }
        else {
            $(this.overlay).css({
                display: 'block'
            });
        }
        anime.remove(this.overlay);
        anime({
            targets: this.overlay,
            opacity: [start, 1],
            duration: this.options.inDuration,
            easing: 'easeOutQuad'
        });
    };
    Sidenav.prototype.animateOut = function () {
        this.animateSidenavOut();
        this.animateOverlayOut();
    };
    Sidenav.prototype.animateSidenavOut = function () {
        var _this = this;
        var endPercent = this.options.edge === 'left' ? -1 : 1;
        var slideOutPercent = 0;
        if (this.isDragged) {
            slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
        }
        anime.remove(this.element);
        anime({
            targets: this.element,
            translateX: [slideOutPercent * 100 + "%", endPercent * 105 + "%"],
            duration: this.options.outDuration,
            easing: 'easeOutQuad',
            complete: function () {
                // Run onOpenEnd callback
                if (typeof (_this.options.onCloseEnd) === 'function') {
                    _this.options.onCloseEnd.call(_this, _this.element);
                }
            }
        });
    };
    Sidenav.prototype.animateOverlayOut = function () {
        var _this = this;
        anime.remove(this.overlay);
        anime({
            targets: this.overlay,
            opacity: 0,
            duration: this.options.outDuration,
            easing: 'easeOutQuad',
            complete: function () {
                $(_this.overlay).css('display', 'none');
            }
        });
    };
    Sidenav.prototype.removeOverlay = function () {
        this.overlay.parentNode.removeChild(this.overlay);
    };
    Sidenav.sidenavInstances = [];
    Sidenav.defaults = {
        draggable: true,
        edge: 'left',
        inDuration: 250,
        outDuration: 200,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
    };
    return Sidenav;
}(CashObject_1.default));
exports.Sidenav = Sidenav;
$.fn.sidenav = function (options) {
    if (options === void 0) { options = null; }
    var result = Sidenav.init(this, options);
    return result.length === 1 ? result[0] : result;
};
