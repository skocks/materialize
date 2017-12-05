import * as $ from 'cash-dom';

import {AutocompleteOptions} from '../autocomplete/autocomplete';
import CashObject from '../CashObject';

interface ChipsElement extends Element {
  chipsInstance: Chips;
}

interface ChipsOptions {
  autocompleteOptions?: AutocompleteOptions;
  data?: any[];
  limit?: number;
  onChipAdd: () => void;
  onChipDelete: () => void;
  onChipSelect: () => void;
  placeholder?: string;
  secondaryPlaceholder?: string;
}

export class Chips extends CashObject<ChipsElement, Chips> {
  public static init($elements, options) {
    const result = [];
    if (options) {
      for (const element of $elements) {
        result.push(new Chips(element, options));
      }
    } else {
      for (const element of $elements) {
        result.push(element.chipsInstance);
      }
    }
    return result;
  }
  private static keyDown = false;

  private static defaultOptions: ChipsOptions = {
    autocompleteOptions: null,
    data: [],
    limit: Infinity,
    onChipAdd: null,
    onChipDelete: null,
    onChipSelect: null,
    placeholder: '',
    secondaryPlaceholder: ''
  };

  private static _handleChipsKeyup(e) {
    Chips.keyDown = false;
  }

  private static _handleChipsBlur(e) {
    if (!Chips.keyDown) {
      const $chips = $(e.target).closest('.chips');
      const currChips = $chips.get(0).chipsInstance;
      currChips._selectedChip = null;
    }
  }

  private static _handleChipsKeydown(e) {
    Chips.keyDown = true;

    const $chips = $(e.target).closest('.chips');
    const chipsKeydown = e.target && $chips.length;

    if ($(e.target).is('input, textarea') || !chipsKeydown) {
      return;
    }

    const currChips = $chips.get(0).chipsInstance;
    if (e.keyCode === 8 || e.keyCode === 46) {
      e.preventDefault();

      let selectIndex = currChips.chipsData.length;
      if (currChips._selectedChip) {
        const index = currChips._selectedChip.index();
        currChips.deleteChip(index);
        currChips._selectedChip = null;
        selectIndex = index - 1;
      }

      if (currChips.chipsData.length) {
        currChips.selectChip(selectIndex);
      }

      // left arrow key
    } else if (e.keyCode === 37) {
      if (currChips._selectedChip) {
        const selectIndex = currChips._selectedChip.index() - 1;
        if (selectIndex < 0) {
          return;
        }
        currChips.selectChip(selectIndex);
      }

      // right arrow key
    } else if (e.keyCode === 39) {
      if (currChips._selectedChip) {
        const selectIndex = currChips._selectedChip.index() + 1;

        if (selectIndex >= currChips.chipsData.length) {
          currChips.$input[0].focus();
        } else {
          currChips.selectChip(selectIndex);
        }
      }
    }
  }

  private chipsData: any;
  private options: ChipsOptions;
  private hasAutocomplete: boolean;
  private selectedChip: any;
  private $input: any;
  private $chips: any[];

  // $(document).ready(function () {
  //   // Handle removal of static chips.
  //   $(document.body).on('click', '.chip .close', function () {
  //     let $chips = $(this).closest('.chips');
  //     if ($chips.length && $chips[0].M_Chips) {
  //       return;
  //     }
  //     $(this).closest('.chip').remove();
  //   });
  // });

  constructor(element: any, options: ChipsOptions) {
    super(element);
    this.options = $.extend({}, Chips.defaultOptions, options);

    this.$element.addClass('chips input-field');
    this.chipsData = [];
    this._setupInput();
    this.hasAutocomplete = Object.keys(this.options.autocompleteOptions).length > 0;

    if (!this.$input.attr('id')) {
      this.$input.attr('id', M.guid());
    }

    if (this.options.data.length) {
      this.chipsData = this.options.data;
      this._renderChips(this.chipsData);
    }

    if (this.hasAutocomplete) {
      this._setupAutocomplete();
    }

    this._setPlaceholder();
    this._setupLabel();
    this._setupEventHandlers();
  }

  public getData() {
    return this.chipsData;
  }

  public addChip(chip) {
    if (!this._isValid(chip) ||
      this.chipsData.length >= this.options.limit) {
      return;
    }

    const renderedChip = this._renderChip(chip);
    this.$chips.add(renderedChip);
    this.chipsData.push(chip);
    $(this.$input).before(renderedChip);
    this._setPlaceholder();

    if (typeof(this.options.onChipAdd) === 'function') {
      this.options.onChipAdd.call(this, this.$el, renderedChip);
    }
  }

  public deleteChip(chipIndex) {
    const $chip = this.$chips.eq(chipIndex);
    this.$chips.eq(chipIndex).remove();
    this.$chips = this.$chips.filter((el) => $(el).index() >= 0);
    this.chipsData.splice(chipIndex, 1);
    this._setPlaceholder();

    if (typeof(this.options.onChipDelete) === 'function') {
      this.options.onChipDelete.call(this, this.$el, $chip[0]);
    }
  }

  public selectChip(index: number) {
    const $chip = this.$chips.eq(index);
    this.selectedChip = $chip;
    $chip[0].focus();

    if (typeof(this.options.onChipSelect) === 'function') {
      this.options.onChipSelect.call(this, this.$el, $chip[0]);
    }
  }

  public destroy() {
    this._removeEventHandlers();
    this.$chips.remove();
    this.el.M_Chips = undefined;
  }

  protected setInstance(instance: Chips) {
    this.element.chipsInstance = instance;
  }

  private _setupEventHandlers() {
    this._handleChipClickBound = this._handleChipClick.bind(this);
    this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
    this._handleInputFocusBound = this._handleInputFocus.bind(this);
    this._handleInputBlurBound = this._handleInputBlur.bind(this);

    this.el.addEventListener('click', this._handleChipClickBound);
    document.addEventListener('keydown', Chips._handleChipsKeydown);
    document.addEventListener('keyup', Chips._handleChipsKeyup);
    this.el.addEventListener('blur', Chips._handleChipsBlur, true);
    this.$input[0].addEventListener('focus', this._handleInputFocusBound);
    this.$input[0].addEventListener('blur', this._handleInputBlurBound);
    this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
  }

  private _removeEventHandlers() {
    this.el.removeEventListener('click', this._handleChipClickBound);
    document.removeEventListener('keydown', Chips._handleChipsKeydown);
    document.removeEventListener('keyup', Chips._handleChipsKeyup);
    this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
    this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
    this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
    this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
  }

  private _handleChipClick(e) {
    const $chip = $(e.target).closest('.chip');
    const clickedClose = $(e.target).is('.close');
    if ($chip.length) {
      const index = $chip.index();
      if (clickedClose) {
        this.deleteChip(index);
        this.$input[0].focus();

      } else {
        this.selectChip(index);
      }
    } else {
      this.$input[0].focus();
    }
  }

  private _handleInputFocus() {
    this.$el.addClass('focus');
  }

  private _handleInputBlur() {
    this.$el.removeClass('focus');
  }

  private _handleInputKeydown(e) {
    Chips._keydown = true;
    if (e.keyCode === 13) {
      if (this.hasAutocomplete &&
        this.autocomplete &&
        this.autocomplete.isOpen) {
        return;
      }

      e.preventDefault();
      this.addChip({tag: this.$input[0].value});
      this.$input[0].value = '';

      // delete or left
    } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
      e.preventDefault();
      this.selectChip(this.chipsData.length - 1);
    }
  }

  private _renderChip(chip) {
    if (!chip.tag) {
      return;
    }

    const renderedChip = document.createElement('div');
    const closeIcon = document.createElement('i');
    renderedChip.classList.add('chip');
    renderedChip.textContent = chip.tag;
    renderedChip.setAttribute('tabindex', 0);
    $(closeIcon).addClass('material-icons close');
    closeIcon.textContent = 'close';

    // attach image if needed
    if (chip.image) {
      const img = document.createElement('img');
      img.setAttribute('src', chip.image);
      renderedChip.insertBefore(img, renderedChip.firstChild);
    }

    renderedChip.appendChild(closeIcon);
    return renderedChip;
  }

  private _renderChips() {
    this.$chips.remove();
    for (data of this.chipsData.length) {
      const chipEl = this._renderChip(this.chipsData[i]);
      this.$el.append(chipEl);
      this.$chips.add(chipEl);
    }

    this.$el.append(this.$input[0]);
  }

  private _setupAutocomplete() {
    this.options.autocompleteOptions.onAutocomplete = (val) => {
      this.addChip({tag: val});
      this.$input[0].value = '';
      this.$input[0].focus();
    };

    this.autocomplete = M.Autocomplete.init(this.$input, this.options.autocompleteOptions)[0];
  }

  private _setupInput() {
    this.$input = this.$el.find('input');
    if (!this.$input.length) {
      this.$input = $('<input></input>');
      this.$el.append(this.$input);
    }

    this.$input.addClass('input');
  }

  private _setupLabel() {
    this.$label = this.$el.find('label');
    if (this.$label.length) {
      this.$label.setAttribute('for', this.$input.attr('id'));
    }
  }

  private _setPlaceholder() {
    if ((this.chipsData !== undefined && !this.chipsData.length) && this.options.placeholder) {
      $(this.$input).prop('placeholder', this.options.placeholder);

    } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
      $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
    }
  }

  private _isValid(chip) {
    if (chip.hasOwnProperty('tag') && chip.tag !== '') {
      let exists = false;
      for (chipData of this.chipsData) {
        if (chipData.tag === chip.tag) {
          exists = true;
          break;
        }
      }
      return !exists;
    } else {
      return false;
    }
  }
}
