import * as $ from 'cash-dom';
import {Key} from '../Key';

interface AutocompleteItem {
  data: string;
  key: string;
}

export interface Dictionary<T> {
  [key: string]: T;
}

interface AutocompleteElement extends Element {
  autocompleteInstance: Autocomplete;
}

export interface AutocompleteOptions {
  data: Dictionary<string>;
  limit?: number;
  minLength?: number;
  onAutocomplete?(instance: Autocomplete, text: string): void;
  sortFunction?(first: string, second: string, value: string): number;
}

export class Autocomplete {
  public static init($elements: AutocompleteElement[], options) {
    const result = [];
    if (options) {
      for (const element of $elements) {
        result.push(new Autocomplete(element, options));
      }
    } else {
      for (const element of $elements) {
        result.push(element.autocompleteInstance);
      }
    }
    return result;
  }

  private static defaults: AutocompleteOptions = {
    data: {},
    limit: Infinity,
    minLength: 1,
    onAutocomplete: null,
    sortFunction: (a, b, inputString) => {
      const distance = a.indexOf(inputString) - b.indexOf(inputString);
      if (distance === 0) {
        return a.localeCompare(b, 'en', {numeric: true});
      }
      return distance;
    }
  };

  private element: AutocompleteElement;
  private options: AutocompleteOptions;
  private oldVal: string;
  private open: boolean;
  private activeIndex: number;
  private container;

  private $active: any;
  private $element: any;
  private $inputField: any;

  public constructor(element: any, options: AutocompleteOptions) {
    if (element.cash) {
      this.element = element.get(0);
    } else {
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

  public isOpen(): boolean {
    return this.open;
  }

  public destroy() {
    this.removeEventHandlers();
    this.removeDropdown();
    this.element.autocompleteInstance = undefined;
  }

  public updateData(data: Dictionary<string>) {
    this.options.data = data;

    /* istanbul ignore else */
    if (this.open) {
      const val = this.$element.val().toLowerCase();
      this.renderDropdown(val);
    }
  }

  private setupEventHandlers() {
    this.element.addEventListener('blur', this.handleInputBlur.bind(this));
    this.element.addEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
    this.element.addEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
    this.element.addEventListener('keydown', this.handleInputKeydown.bind(this));
    this.container.addEventListener('mouseclick', this.handleContainerMouseClick.bind(this));
  }

  private removeEventHandlers() {
    this.element.removeEventListener('blur', this.handleInputBlur.bind(this));
    this.element.removeEventListener('keyup', this.handleInputKeyupAndFocus.bind(this));
    this.element.removeEventListener('focus', this.handleInputKeyupAndFocus.bind(this));
    this.element.removeEventListener('keydown', this.handleInputKeydown.bind(this));
    this.container.removeEventListener('mouseclick', this.handleContainerMouseClick.bind(this));
  }

  private setupDropdown() {
    this.container = document.createElement('ul');
    $(this.container).addClass('autocomplete-content dropdown-content');
    this.$inputField.append(this.container);
  }

  private removeDropdown() {
    this.container.parentNode.removeChild(this.container);
  }

  private handleInputBlur() {
    this.removeAutocomplete();
    this.open = false;
  }

  private handleInputKeyupAndFocus(e: KeyboardEvent) {
    const key: string = e.key;
    const val: string = this.$element.val().toLowerCase();

    if (key === Key.ENTER || key === Key.ARROW_UP || key === Key.ARROW_DOWN) {
      return;
    }

    /* istanbul ignore else */
    if (this.oldVal !== val) {
      this.removeAutocomplete();

      if (val.length >= this.options.minLength) {
        this.open = true;
        this.renderDropdown(val);
      } else {
        this.open = false;
      }
    }

    this.oldVal = val;
  }

  private handleInputKeydown(e: KeyboardEvent) {
    const key: string = e.key;
    const numItems: number = $(this.container).children('li').length;

    if (key === Key.ENTER && this.activeIndex >= 0) {
      const liElement = $(this.container).children('li').eq(this.activeIndex);
      /* istanbul ignore else */
      if (liElement.length) {
        this.selectOption(liElement);
        e.preventDefault();
      }
      return;
    }

    if (key === Key.ARROW_UP || key === Key.ARROW_DOWN) {
      e.preventDefault();

      if (key === Key.ARROW_UP && this.activeIndex > 0) {
        this.activeIndex--;
      }

      if (key === Key.ARROW_DOWN && this.activeIndex < (numItems - 1)) {
        this.activeIndex++;
      }

      if (this.$active != null) {
        this.$active.removeClass('active');
      }
      this.$active = $(this.container).children('li').eq(this.activeIndex);
      this.$active.addClass('active');
    }
  }

  private handleContainerMouseClick(e: Event) {
    this.selectOption($(e.target).closest('li'));
  }

  private highlight(value, $el) {
    const img = $el.find('img');
    const matchStart: number = $el.text().toLowerCase().indexOf('' + value.toLowerCase() + '');
    const matchEnd: number = matchStart + value.length - 1;
    const beforeMatch: string = $el.text().slice(0, matchStart);
    const matchText: string = $el.text().slice(matchStart, matchEnd + 1);
    const afterMatch: string = $el.text().slice(matchEnd + 1);

    $el.html('<span>' + beforeMatch + '<span class=\'highlight\'>' + matchText + '</span>' + afterMatch + '</span>');
    if (img.length) {
      $el.prepend(img);
    }
  }

  private resetCurrentElement() {
    this.activeIndex = -1;
    if (this.$active) {
      this.$active.removeClass('active');
    }
  }

  private removeAutocomplete() {
    $(this.container).empty();
    this.resetCurrentElement();
    this.oldVal = null;
  }

  private selectOption(el) {
    const text: string = el.text().trim();
    this.$element.val(text);
    this.$element.trigger('change');
    this.removeAutocomplete();
    this.open = false;

    if (typeof(this.options.onAutocomplete) === 'function') {
      this.options.onAutocomplete.call(this, text);
    }
  }

  private renderDropdown(value: string): void {
    this.removeAutocomplete();

    const matchingData: AutocompleteItem[] = this.collectMatches(value);
    matchingData.sort((a: AutocompleteItem, b: AutocompleteItem): number => {
      return this.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(),
        value.toLowerCase());
    });

    for (const entry of matchingData) {
      const $option = $('<li></li>');
      if (entry.data) {
        $option.append(`<img src="${entry.data}" class="right circle"><span>${entry.key}</span>`);
      } else {
        $option.append(`<span>${entry.key}</span>`);
      }

      $(this.container).append($option);
      this.highlight(value, $option);
    }
  }

  private collectMatches(value: string): AutocompleteItem[] {
    const data = this.options.data;
    const result: AutocompleteItem[] = [];
    let count = 0;
    for (const key in data) {
      /* istanbul ignore else */
      if (data.hasOwnProperty(key)) {
        if (count++ >= this.options.limit) {
          break;
        }
        if (key.toLowerCase().indexOf(value) !== -1) {
          result.push({data: data[key], key: key});
        }
      }
    }
    return result;
  }
}

$.fn.autocomplete = function (options): Autocomplete[] | Autocomplete {
  const result = Autocomplete.init(this, options);
  return result.length === 1 ? result[0] : result;
};
