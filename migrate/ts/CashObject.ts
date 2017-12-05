import * as $ from 'cash-dom';
import {BoundElements} from './BoundElements';

export default abstract class CashObject<E, T> {
  protected element: E;
  protected $element: any;
  protected boundElements: BoundElements;

  constructor(element: any) {
    if (element.cash) {
      this.element = element.get(0);
    } else {
      this.element = element;
    }

    this.$element = $(this.element);
    this.boundElements = new BoundElements();
  }

  protected abstract setInstance(instance: T);
}
