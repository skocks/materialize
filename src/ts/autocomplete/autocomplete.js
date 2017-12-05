"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("cash-dom");
var Key_1 = require("../Key");
var Autocomplete = /** @class */ (function () {
    function Autocomplete(element, options) {
        if (element.cash) {
            this.element = element.get(0);
        }
        else {
            this.element = element;
        }
        if (this.element.autocompleteInstance) {
            this.element.autocompleteInstance.destroy();
        }
        this.$element = $(this.element);
        this.element.autocompleteInstance = this;
        this.options = $.extend({}, Autocomplete.defaults, options);
        this.open = false;
        this.activeIndex = -1;
        this.$inputField = this.$element.closest('.input-field');
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
    Autocomplete.prototype.isOpen = function () {
        return this.open;
    };
    Autocomplete.prototype.destroy = function () {
        this.removeEventHandlers();
        this.removeDropdown();
        this.element.autocompleteInstance = undefined;
    };
    Autocomplete.prototype.updateData = function (data) {
        this.options.data = data;
        /* istanbul ignore else */
        if (this.open) {
            var val = this.$element.val().toLowerCase();
            this.renderDropdown(val);
        }
    };
    Autocomplete.prototype.setupEventHandlers = function () {
        this.element.addEventListener('blur', this.handleInputBlur.bind(this));
        this.element.addEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
        this.element.addEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
        this.element.addEventListener('keydown', this.handleInputKeydown.bind(this));
        this.container.addEventListener('mouseclick', this.handleContainerMouseClick.bind(this));
    };
    Autocomplete.prototype.removeEventHandlers = function () {
        this.element.removeEventListener('blur', this.handleInputBlur.bind(this));
        this.element.removeEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
        this.element.removeEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
        this.element.removeEventListener('keydown', this.handleInputKeydown.bind(this));
        this.container.removeEventListener('mouseclick', this.handleContainerMouseClick.bind(this));
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
        this.open = false;
    };
    Autocomplete.prototype.handleInputKeyupAndFocus = function (e) {
        var key = e.key;
        var val = this.$element.val().toLowerCase();
        if (key === Key_1.Key.ENTER || key === Key_1.Key.ARROW_UP || key === Key_1.Key.ARROW_DOWN) {
            return;
        }
        /* istanbul ignore else */
        if (this.oldVal !== val) {
            this.removeAutocomplete();
            if (val.length >= this.options.minLength) {
                this.open = true;
                this.renderDropdown(val);
            }
            else {
                this.open = false;
            }
        }
        this.oldVal = val;
    };
    Autocomplete.prototype.handleInputKeydown = function (e) {
        var key = e.key;
        var numItems = $(this.container).children('li').length;
        if (key === Key_1.Key.ENTER && this.activeIndex >= 0) {
            var liElement = $(this.container).children('li').eq(this.activeIndex);
            /* istanbul ignore else */
            if (liElement.length) {
                this.selectOption(liElement);
                e.preventDefault();
            }
            return;
        }
        if (key === Key_1.Key.ARROW_UP || key === Key_1.Key.ARROW_DOWN) {
            e.preventDefault();
            if (key === Key_1.Key.ARROW_UP && this.activeIndex > 0) {
                this.activeIndex--;
            }
            if (key === Key_1.Key.ARROW_DOWN && this.activeIndex < (numItems - 1)) {
                this.activeIndex++;
            }
            if (this.$active != null) {
                this.$active.removeClass('active');
            }
            this.$active = $(this.container).children('li').eq(this.activeIndex);
            this.$active.addClass('active');
        }
    };
    Autocomplete.prototype.handleContainerMouseClick = function (e) {
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
    };
    Autocomplete.prototype.selectOption = function (el) {
        var text = el.text().trim();
        this.$element.val(text);
        this.$element.trigger('change');
        this.removeAutocomplete();
        this.open = false;
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
            /* istanbul ignore else */
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
            var distance = a.indexOf(inputString) - b.indexOf(inputString);
            if (distance === 0) {
                return a.localeCompare(b, 'en', { numeric: true });
            }
            return distance;
        }
    };
    return Autocomplete;
}());
exports.Autocomplete = Autocomplete;
$.fn.autocomplete = function (options) {
    var result = Autocomplete.init(this, options);
    return result.length === 1 ? result[0] : result;
};
