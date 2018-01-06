"use strict";
exports.__esModule = true;
var $ = require("cash-dom");
var Key_1 = require("../Key");
var Autocomplete = /** @class */ (function () {
    function Autocomplete(element, options) {
        if (options === void 0) { options = null; }
        if (element.autocompleteInstance) {
            element.autocompleteInstance.destroy();
        }
        this.el = element;
        this.$el = $(element);
        this.el.autocompleteInstance = this;
        this.options = $.extend({}, Autocomplete.defaults, options);
        this.isOpen = false;
        this.activeIndex = -1;
        this.$inputField = this.$el.closest('.input-field');
        this.setupDropdown();
        this.setupEventHandlers();
    }
    Autocomplete.init = function ($elements, options) {
        var result = [];
        if (options) {
            for (var _i = 0, $elements_1 = $elements; _i < $elements_1.length; _i++) {
                var element = $elements_1[_i];
                result.push(new Autocomplete(element, options));
            }
        }
        else {
            for (var _a = 0, $elements_2 = $elements; _a < $elements_2.length; _a++) {
                var element = $elements_2[_a];
                result.push(element.autocompleteInstance);
            }
        }
        return result;
    };
    Autocomplete.getInstance = function (element) {
        var domElem = element.crash ? element[0] : element;
        return domElem.autocompleteInstance;
    };
    Autocomplete.prototype.destroy = function () {
        this.removeEventHandlers();
        this.removeDropdown();
        this.el.autocompleteInstance = undefined;
    };
    Autocomplete.prototype.updateData = function (data) {
        var val = this.el.value.toLowerCase();
        this.options.data = data;
        if (this.isOpen) {
            this.renderDropdown(val);
        }
    };
    Autocomplete.prototype.setupEventHandlers = function () {
        this.el.addEventListener('blur', this.handleInputBlur.bind(this));
        this.el.addEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
        this.el.addEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
        this.el.addEventListener('keydown', this.handleInputKeydown.bind(this));
        this.container.addEventListener('mousedown', this.handleContainerMousedownAndTouchstart.bind(this));
        if (typeof window.ontouchstart !== 'undefined') {
            this.container.addEventListener('touchstart', this.handleContainerMousedownAndTouchstart.bind(this));
        }
    };
    Autocomplete.prototype.removeEventHandlers = function () {
        this.el.removeEventListener('blur', this.handleInputBlur.bind(this));
        this.el.removeEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
        this.el.removeEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
        this.el.removeEventListener('keydown', this.handleInputKeydown.bind(this));
        this.container.removeEventListener('mousedown', this.handleContainerMousedownAndTouchstart.bind(this));
        if (typeof window.ontouchstart !== 'undefined') {
            this.container.removeEventListener('touchstart', this.handleContainerMousedownAndTouchstart.bind(this));
        }
    };
    Autocomplete.prototype.setupDropdown = function () {
        this.container = document.createElement('ul');
        $(this.container).addClass('autocomplete-content dropdown-content');
        this.$inputField.append(this.container);
    };
    Autocomplete.prototype.removeDropdown = function () {
        this.container.parentNode.removeChild(this.container);
    };
    Autocomplete.prototype.handleInputBlur = function () {
        this.removeAutocomplete();
    };
    Autocomplete.prototype.handleInputKeyupAndFocus = function (e) {
        var val = this.el.value.toLowerCase();
        if (e.keyCode === Key_1.Key.ENTER || e.keyCode === Key_1.Key.ARROW_UP || e.keyCode === Key_1.Key.ARROW_DOWN) {
            return;
        }
        if (this.oldVal !== val) {
            this.removeAutocomplete();
            if (val.length >= this.options.minLength) {
                this.isOpen = true;
                console.log('isOpen', this.isOpen);
                this.renderDropdown(val);
            }
        }
        this.oldVal = val;
    };
    Autocomplete.prototype.handleInputKeydown = function (e) {
        var keyCode = e.keyCode;
        var numItems = $(this.container).children('li').length;
        var liElement;
        if (keyCode === Key_1.Key.ENTER && this.activeIndex >= 0) {
            liElement = $(this.container).children('li').eq(this.activeIndex);
            if (liElement.length) {
                this.selectOption(liElement);
                e.preventDefault();
            }
            return;
        }
        if (keyCode === Key_1.Key.ARROW_UP || keyCode === Key_1.Key.ARROW_DOWN) {
            e.preventDefault();
            if (keyCode === Key_1.Key.ARROW_UP && this.activeIndex > 0) {
                this.activeIndex--;
            }
            if (keyCode === Key_1.Key.ARROW_DOWN && this.activeIndex < (numItems - 1)) {
                this.activeIndex++;
            }
            this.$active.removeClass('active');
            if (this.activeIndex >= 0) {
                this.$active = $(this.container).children('li').eq(this.activeIndex);
                this.$active.addClass('active');
            }
        }
    };
    Autocomplete.prototype.handleContainerMousedownAndTouchstart = function (e) {
        this.selectOption($(e.target).closest('li'));
    };
    Autocomplete.prototype.highlight = function (value, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf('' + value.toLowerCase() + '');
        var matchEnd = matchStart + value.length - 1;
        var beforeMatch = $el.text().slice(0, matchStart);
        var matchText = $el.text().slice(matchStart, matchEnd + 1);
        var afterMatch = $el.text().slice(matchEnd + 1);
        $el.html('<span>' + beforeMatch + '<span class=\'highlight\'>' + matchText + '</span>' + afterMatch + '</span>');
        if (img.length) {
            $el.prepend(img);
        }
    };
    Autocomplete.prototype.resetCurrentElement = function () {
        this.activeIndex = -1;
        if (this.$active) {
            this.$active.removeClass('active');
        }
    };
    Autocomplete.prototype.removeAutocomplete = function () {
        $(this.container).empty();
        this.resetCurrentElement();
        this.oldVal = null;
        this.isOpen = false;
        console.trace('isOpen', this.isOpen);
    };
    Autocomplete.prototype.selectOption = function (el) {
        var text = el.text().trim();
        this.el.value = text;
        this.$el.trigger('change');
        this.removeAutocomplete();
        if (typeof (this.options.onAutocomplete) === 'function') {
            this.options.onAutocomplete.call(this, text);
        }
    };
    Autocomplete.prototype.renderDropdown = function (value) {
        var _this = this;
        this.removeAutocomplete();
        var matchingData = this.collectMatches(value);
        matchingData.sort(function (a, b) {
            return _this.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), value.toLowerCase());
        });
        for (var _i = 0, matchingData_1 = matchingData; _i < matchingData_1.length; _i++) {
            var entry = matchingData_1[_i];
            var $option = $('<li></li>');
            if (entry.data) {
                $option.append("<img src=\"" + entry.data + "\" class=\"right circle\"><span>" + entry.key + "</span>");
            }
            else {
                $option.append("<span>" + entry.key + "</span>");
            }
            $(this.container).append($option);
            this.highlight(value, $option);
        }
    };
    Autocomplete.prototype.collectMatches = function (value) {
        var data = this.options.data;
        var result = [];
        var count = 0;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (count++ >= this.options.limit) {
                    break;
                }
                if (key.toLowerCase().indexOf(value) !== -1) {
                    result.push({ data: data[key], key: key });
                }
            }
        }
        return result;
    };
    Autocomplete.defaults = {
        data: {},
        limit: Infinity,
        minLength: 1,
        onAutocomplete: null,
        sortFunction: function (a, b, inputString) {
            return a.indexOf(inputString) - b.indexOf(inputString);
        }
    };
    return Autocomplete;
}());
$.fn.autocomplete = function (options) {
    var result = Autocomplete.init(this, options);
    return result.length === 1 ? result[0] : result;
};
