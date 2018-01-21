import * as $ from 'cash-dom';

import BoundElements from '../BoundElements';
import CashObject from '../CashObject';

interface ParallaxElement extends HTMLElement {
  parallaxInstance: Parallax;
}

class Parallax extends CashObject<ParallaxElement> {
  public static init($elements: any[]) {
    const result: Parallax[] = [];
    for (const element of $elements) {
      if (!element.parallaxInstance) {
        result.push(new Parallax(element));
      } else {
        result.push(element.parallaxInstance);
      }
    }
    return result;
  }

  private static globalBoundElements: BoundElements = new BoundElements();
  private static parallaxes: Parallax[] = [];

  private static handleScroll() {
    for (const parallax of Parallax.parallaxes) {
      parallax.update();
    }
  }

  private $img: any;

  constructor(element) {
    super(element);

    this.$img = this.$element.find('img').first();
    this.update();
    this.setupEventHandlers();
    this.setupStyles();

    Parallax.parallaxes.push(this);
  }

  public destroy() {
    this.boundElements.clear(this.$img.get(0));
    const index: number = Parallax.parallaxes.indexOf(this);
    if (index > -1) {
      Parallax.parallaxes.splice(index, 1);
      if (0 === Parallax.parallaxes.length) {
        this.boundElements.clear(window);
      }
    }
    this.setInstance(undefined);
  }

  protected setInstance(instance: Parallax) {
    this.element.parallaxInstance = instance;
  }

  private setupEventHandlers() {
    this.boundElements.bind(this.$img.get(0), 'load', this.handleImageLoad.bind(this));
    if (Parallax.parallaxes.length === 0) {
      this.boundElements.bind(window, 'scroll', () => Parallax.handleScroll());
    }
  }

  private setupStyles() {
    this.$img.get(0).style.opacity = 1;
  }

  private handleImageLoad() {
    this.update();
  }

  private update() {
    const containerHeight = this.$element.height() > 0 ? this.element.parentElement.offsetHeight : 500;
    const imgHeight = this.$img.get(0).offsetHeight;
    const parallaxDist = imgHeight - containerHeight;
    const bottom = this.$element.offset().top + containerHeight;
    const top = this.$element.offset().top;
    const scrollTop = this.getDocumentScrollTop();
    const windowHeight = window.innerHeight;
    const windowBottom = scrollTop + windowHeight;
    const percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
    const parallax = parallaxDist * percentScrolled;

    if (bottom > scrollTop && top < scrollTop + windowHeight) {
      this.$img.get(0).style.transform = `translate3D(-50%, ${parallax}px, 0)`;
    }
  }
}

$.fn.parallax = function (): Parallax[] | Parallax {
  const result = Parallax.init(this);
  return result.length === 1 ? result[0] : result;
};
