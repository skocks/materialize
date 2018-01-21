import * as $ from 'cash-dom';
import BoundElements from './BoundElements';

export default abstract class CashObject<E> {
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
    this.setInstance(this);
  }

  protected abstract setInstance(instance: CashObject<E>);

  protected getDocumentScrollTop(): number {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
}
