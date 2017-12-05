import * as $ from 'cash-dom';
import CashObject from '../CashObject';

interface CharacterCounterElement extends Element {
  characterCounterInstance: CharacterCounter;
}

export class CharacterCounter extends CashObject<CharacterCounterElement, CharacterCounter> {
  public static init($elements) {
    const result = [];
    for (const element of $elements) {
      if (!element.characterCounterInstance) {
        result.push(new CharacterCounter(element));
      } else {
        result.push(element.characterCounterInstance);
      }
    }
    return result;
  }

  private counterElement: Element;
  private invalid: boolean;
  private lengthValid: boolean;

  constructor(element: any) {
    super(element);

    this.invalid = false;
    this.lengthValid = false;
    this.setupCounter();
    this.setupEventHandlers();
  }

  protected setInstance(instance: CharacterCounter) {
    this.element.characterCounterInstance = instance;
  }

  public destroy() {
    this.element.characterCounterInstance = undefined;
    this.removeCounter();
    this.removeEventHandlers();
  }

  private setupEventHandlers() {
    const handleUpdateCounterBound = this.updateCounter.bind(this);
    this.boundElements.bind(this.element, 'focus', handleUpdateCounterBound);
    this.boundElements.bind(this.element, 'input', handleUpdateCounterBound, true);
  }

  private removeEventHandlers() {
    this.boundElements.clear(this.element);
  }

  private setupCounter() {
    this.counterElement = document.createElement('span');
    $(this.counterElement).addClass('character-counter')
      .css({
        float: 'right',
        'font-size': '12px',
        height: 1
      });

    this.$element.parent().append(this.counterElement);
  }

  private removeCounter() {
    $(this.counterElement).remove();
  }

  private updateCounter() {
    const maxLength = +this.$element.attr('data-length');
    const currentLength = this.$element.val().length;

    this.lengthValid = currentLength <= maxLength;
    let counterString = currentLength;

    if (maxLength) {
      counterString += '/' + maxLength;
      this.validateInput();
    }

    $(this.counterElement).html(counterString);
  }

  private validateInput() {
    if (this.lengthValid && this.invalid) {
      this.invalid = false;
      this.$element.removeClass('invalid');
    } else if (!this.lengthValid && !this.invalid) {
      this.invalid = true;
      this.$element.removeClass('valid');
      this.$element.addClass('invalid');
    }
  }
}

$.fn.characterCounter = function (): CharacterCounter[] | CharacterCounter {
  const result = CharacterCounter.init(this);
  return result.length === 1 ? result[0] : result;
};
