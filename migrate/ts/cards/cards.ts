import * as $ from 'cash-dom';
import {BoundElements} from '../BoundElements';

interface CardElement extends Element {
  cardInstance: Card;
}

export default class Card {
  public static init(elements: CardElement[]) {
    const result = [];
    for (const element of elements) {
      if (!element.cardInstance) {
        result.push(new Card(element));
      } else {
        result.push(element.cardInstance);
      }
    }
    return result;
  }

  private element: CardElement;
  private $element: any;
  private boundElements: BoundElements;

  constructor(element: any) {
    if (element.cash) {
      this.element = element.get(0);
    } else {
      this.element = element;
    }
    if (this.element.cardInstance) {
      this.element.cardInstance.destroy();
    }
    this.element.cardInstance = this;

    this.$element = $(this.element);

    this.boundElements = new BoundElements();
    this.addEventHandlers();
  }

  public destroy() {
    this.removeEventHandlers();
    this.element.cardInstance = undefined;
  }

  private addEventHandlers() {
    for (const currentElement of this.$element.find('.card-content .card-title')) {
      this.boundElements.bind(currentElement, 'click', this.onReveal.bind(this));
    }
    for (const currentElement of this.$element.find('.activator')) {
      this.boundElements.bind(currentElement, 'click', this.onReveal.bind(this));
    }
    for (const currentElement of this.$element.find('.card-reveal .card-title')) {
      this.boundElements.bind(currentElement, 'click', this.onUnreveal.bind(this));
    }
  }

  private removeEventHandlers() {
    for (const currentElement of this.$element.find('.card-content .card-title')) {
      this.boundElements.clear(currentElement);
    }
    for (const currentElement of this.$element.find('.activator')) {
      this.boundElements.clear(currentElement);
    }
    for (const currentElement of this.$element.find('.card-reveal .card-title')) {
      this.boundElements.clear(currentElement);
    }
  }

  private onReveal() {
    this.$element.addClass('reveal');
  }

  private onUnreveal() {
    this.$element.removeClass('reveal');
  }
}

$.fn.card = function (): Card[] | Card {
  const result = Card.init(this);
  return result.length === 1 ? result[0] : result;
};
