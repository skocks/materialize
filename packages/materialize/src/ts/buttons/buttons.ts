import * as $ from 'cash-dom';

import BoundElements from '../BoundElements';

interface FABElement extends Element {
  buttonInstance: FixedActionButton;
}

export class FixedActionButton {
  public static init(elements: FABElement[]) {
    const result = [];
    for (const element of elements) {
      if (!element.buttonInstance) {
        result.push(new FixedActionButton(element));
      } else {
        result.push(element.buttonInstance);
      }
    }
    return result;
  }

  private el: FABElement;
  private $el: any;
  private boundElements: BoundElements;
  private isOpen: boolean;

  constructor(el: any) {
    if (el.cash) {
      this.el = el.get(0);
    } else {
      this.el = el;
    }
    if (this.el.buttonInstance) {
      this.el.buttonInstance.destroy();
    }

    this.$el = $(this.el);
    this.el.buttonInstance = this;
    this.boundElements = new BoundElements();
    this.setupEventHandlers();
  }

  public destroy() {
    this.removeEventHandlers();
    this.el.buttonInstance = undefined;
  }

  private open() {
    if (this.$el.hasClass('toolbar')) {
      this.boundElements.bind(window, 'scroll', this.close.bind(this));
      this.boundElements.bind(document.body, 'click', this.close.bind(this), true);
    }

    this.$el.addClass('open');
    this.isOpen = true;
  }

  private close() {
    if (this.$el.hasClass('toolbar')) {
      this.boundElements.clear(window);
      this.boundElements.clear(document.body);
    }
    this.$el.removeClass('open');
    this.isOpen = false;
  }

  private setupEventHandlers() {
    if (this.$el.hasClass('click-open')) {
      this.boundElements.bind(this.el, 'click', this.onClick.bind(this));
    }
  }

  private removeEventHandlers() {
    this.boundElements.clear(this.el);
  }

  private onClick() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

$.fn.fab = function (): FixedActionButton[] | FixedActionButton {
  const result = FixedActionButton.init(this);
  return result.length === 1 ? result[0] : result;
};
