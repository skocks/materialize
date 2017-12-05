import * as $ from 'cash-dom';

import CashObject from '../CashObject';
import EventPosition from '../EventPosition';
import Timer = NodeJS.Timer;

interface CarouselOptions {
  /**
   * zoom scale
   */
  dist?: number;
  /**
   * duration in milliseconds
   */
  duration?: number;
  /**
   * use fullwidth styles
   */
  fullWidth: boolean;
  /**
   * show indicators
   */
  indicators: boolean;
  /**
   * don't wrap cycle through items
   */
  noWrap: boolean;
  /**
   * callback when cycled to item
   */
  onCycleTo: () => void;
  /**
   * padding between non center items
   */
  padding: number;
  /**
   * space for center image
   */
  shift: number;
}

interface CarouselElement extends Element {
  carouselInstance: Carousel;
}

export class Carousel extends CashObject<CarouselElement, Carousel> {
  public static init($elements, options) {
    const result = [];
    if (options) {
      for (const element of $elements) {
        result.push(new Carousel(element, options));
      }
    } else {
      for (const element of $elements) {
        result.push(element.carouselInstance);
      }
    }
    return result;
  }

  private static defaultOptions: CarouselOptions = {
    dist: -100,
    duration: 200,
    fullWidth: false,
    indicators: false,
    noWrap: false,
    onCycleTo: null,
    padding: 0,
    shift: 0
  };

  private options: CarouselOptions;

  private $indicators: any;
  private hasMultipleSlides: boolean;
  private ticker: Timer;
  private showIndicators: boolean;
  private noWrap: boolean;
  private pressed: boolean;
  private dragged: boolean;
  private offset: number;
  private target: number;
  private images: any[];
  private itemWidth: number;
  private itemHeight: number;
  private dim: number;
  private verticalDragged: boolean;
  private referenceX: number;
  private referenceY: number;
  private velocity: number;
  private amplitude: number;
  private frame: number;
  private timestamp: number;
  private count: number;
  private center: number;
  private imageHeight: number;
  private reference: number;
  private oneTimeCallback: () => void;
  private xform: string;
  private scrollingTimeout: number;

  constructor(element: any, options: CarouselOptions) {
    super(element);
    if (this.element.carouselInstance) {
      this.element.carouselInstance.destroy();
    }
    this.element.carouselInstance = this;

    this.options = $.extend({}, Carousel.defaultOptions, options);

    this.hasMultipleSlides = this.$element.find('.carousel-item').length > 1;
    this.showIndicators = this.options.indicators && this.hasMultipleSlides;
    this.noWrap = this.options.noWrap || !this.hasMultipleSlides;
    this.pressed = false;
    this.dragged = false;
    this.offset = 0;
    this.target = 0;
    this.images = [];
    this.itemWidth = this.$element.find('.carousel-item').first().innerWidth();
    this.itemHeight = this.$element.find('.carousel-item').first().innerHeight();
    this.dim = this.itemWidth * 2 + this.options.padding || 1;

    // Full Width carousel setup
    if (this.options.fullWidth) {
      this.options.dist = 0;
      this.setCarouselHeight();

      // Offset fixed items when indicators.
      if (this.showIndicators) {
        this.$element.find('.carousel-fixed-item').addClass('with-indicators');
      }
    }

    // Iterate through slides
    this.$indicators = $('<ul class="indicators"></ul>');
    this.$element.find('.carousel-item').each((el, i) => {
      this.images.push(el);
      if (this.showIndicators) {
        const $indicator = $('<li class="indicator-item"></li>');

        // Add active to first by default.
        if (i === 0) {
          $indicator[0].classList.add('active');
        }

        this.$indicators.append($indicator);
      }
    });
    if (this.showIndicators) {
      this.$element.append(this.$indicators);
    }
    this.count = this.images.length;

    // Setup cross browser string
    this.xform = 'transform';
    ['webkit', 'Moz', 'O', 'ms'].every((prefix) => {
      const e = prefix + 'Transform';
      if (typeof document.body.style[e] !== 'undefined') {
        this.xform = e;
        return false;
      }
      return true;
    });

    this.setupEventHandlers();
    this.scrollTo(this.offset);
  }

  public destroy() {
    this.removeEventHandlers();
    this.setInstance(undefined);
  }

  public scrollTo(x: number = null) {
    // Track scrolling state
    if (!this.$element.hasClass('scrolling')) {
      this.element.classList.add('scrolling');
    }
    if (this.scrollingTimeout) {
      window.clearTimeout(this.scrollingTimeout);
    }
    this.scrollingTimeout = window.setTimeout(() => {
      this.$element.removeClass('scrolling');
    }, this.options.duration);

    // Start actual scroll
    let i = 1;
    let half;
    let delta;
    let dir;
    let tween;
    let el;
    let alignment;
    let zTranslation;
    let tweenedOpacity;
    const lastCenter = this.center;

    this.offset = (null != x) ? x : this.offset;
    this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
    delta = this.offset - this.center * this.dim;
    dir = (delta < 0) ? 1 : -1;
    tween = -dir * delta * 2 / this.dim;
    half = this.count * 2;

    if (!this.options.fullWidth) {
      alignment = 'translateX(' + (this.element.clientWidth - this.itemWidth) / 2 + 'px) ';
      alignment += 'translateY(' + (this.element.clientHeight - this.itemHeight) / 2 + 'px)';
    } else {
      alignment = 'translateX(0)';
    }

    // Set indicator active
    if (this.showIndicators) {
      const diff = (this.center % this.count);
      const activeIndicator = this.$indicators.find('.indicator-item.active');
      if (activeIndicator.index() !== diff) {
        activeIndicator.removeClass('active');
        this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
      }
    }

    // center
    // Don't show wrapped items.
    if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
      el = this.images[this.wrap(this.center)];

      // Add active class to center item.
      if (!$(el).hasClass('active')) {
        this.$element.find('.carousel-item').removeClass('active');
        el.classList.add('active');
      }
      el.style[this.xform] = alignment +
        ' translateX(' + (-delta / 2) + 'px)' +
        ' translateX(' + (dir * this.options.shift * tween * i) + 'px)' +
        ' translateZ(' + (this.options.dist * tween) + 'px)';
      el.style.zIndex = 0;
      if (this.options.fullWidth) {
        tweenedOpacity = 1;
      } else {
        tweenedOpacity = 1 - 0.2 * tween;
      }
      el.style.opacity = tweenedOpacity;
      el.style.visibility = 'visible';
    }

    for (i = 1; i <= half; ++i) {
      // right side
      if (this.options.fullWidth) {
        zTranslation = this.options.dist;
        tweenedOpacity = (i === half && delta < 0) ? 1 - tween : 1;
      } else {
        zTranslation = this.options.dist * (i * 2 + tween * dir);
        tweenedOpacity = 1 - 0.2 * (i * 2 + tween * dir);
      }
      // Don't show wrapped items.
      if (!this.noWrap || this.center + i < this.count) {
        el = this.images[this.wrap(this.center + i)];
        el.style[this.xform] = alignment +
          ' translateX(' + (this.options.shift + (this.dim * i - delta) / 2) + 'px)' +
          ' translateZ(' + zTranslation + 'px)';
        el.style.zIndex = -i;
        el.style.opacity = tweenedOpacity;
        el.style.visibility = 'visible';
      }

      // left side
      if (this.options.fullWidth) {
        zTranslation = this.options.dist;
        tweenedOpacity = (i === half && delta > 0) ? 1 - tween : 1;
      } else {
        zTranslation = this.options.dist * (i * 2 - tween * dir);
        tweenedOpacity = 1 - 0.2 * (i * 2 - tween * dir);
      }
      // Don't show wrapped items.
      if (!this.noWrap || this.center - i >= 0) {
        el = this.images[this.wrap(this.center - i)];
        el.style[this.xform] = alignment +
          ' translateX(' + (-this.options.shift + (-this.dim * i - delta) / 2) + 'px)' +
          ' translateZ(' + zTranslation + 'px)';
        el.style.zIndex = -i;
        el.style.opacity = tweenedOpacity;
        el.style.visibility = 'visible';
      }
    }

    // center
    // Don't show wrapped items.
    if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
      el = this.images[this.wrap(this.center)];
      el.style[this.xform] = alignment +
        ' translateX(' + (-delta / 2) + 'px)' +
        ' translateX(' + (dir * this.options.shift * tween) + 'px)' +
        ' translateZ(' + (this.options.dist * tween) + 'px)';
      el.style.zIndex = 0;
      if (this.options.fullWidth) {
        tweenedOpacity = 1;
      } else {
        tweenedOpacity = 1 - 0.2 * tween;
      }
      el.style.opacity = tweenedOpacity;
      el.style.visibility = 'visible';
    }

    // onCycleTo callback
    const $currItem = this.$element.find('.carousel-item').eq(this.wrap(this.center));
    if (lastCenter !== this.center && 'function' === typeof(this.options.onCycleTo)) {
      this.options.onCycleTo.call(this, $currItem[0], this.dragged);
    }

    // One time callback
    if ('function' === typeof(this.oneTimeCallback)) {
      this.oneTimeCallback.call(this, $currItem[0], this.dragged);
      this.oneTimeCallback = null;
    }
  }

  public cycleTo(n: number, callback: () => void = null) {
    let diff = (this.center % this.count) - n;

    // Account for wraparound.
    if (!this.noWrap) {
      if (diff < 0) {
        if (Math.abs(diff + this.count) < Math.abs(diff)) {
          diff += this.count;
        }

      } else if (diff > 0) {
        if (Math.abs(diff - this.count) < diff) {
          diff -= this.count;
        }
      }
    }

    this.target = (this.dim * Math.round(this.offset / this.dim));
    // Next
    if (diff < 0) {
      this.target += (this.dim * Math.abs(diff));

      // Prev
    } else if (diff > 0) {
      this.target -= (this.dim * diff);
    }

    // Set one time callback
    if ('function' === typeof(callback)) {
      this.oneTimeCallback = callback;
    }

    // Scroll
    if (this.offset !== this.target) {
      this.amplitude = this.target - this.offset;
      this.timestamp = Date.now();
      requestAnimationFrame(() => this.autoScroll());
    }
  }

  public next(n) {
    if (n === undefined || isNaN(n)) {
      n = 1;
    }

    let index = this.center + n;
    if (index > this.count || index < 0) {
      if (this.noWrap) {
        return;
      } else {
        index = this.wrap(index);
      }
    }
    this.cycleTo(index);
  }

  public prev(n) {
    if (n === undefined || isNaN(n)) {
      n = 1;
    }

    let index = this.center - n;
    if (index > this.count || index < 0) {
      if (this.noWrap) {
        return;
      } else {
        index = this.wrap(index);
      }
    }

    this.cycleTo(index);
  }

  public set(n, callback) {
    if (n === undefined || isNaN(n)) {
      n = 0;
    }

    if (n > this.count || n < 0) {
      if (this.noWrap) {
        return;
      } else {
        n = this.wrap(n);
      }
    }

    this.cycleTo(n, callback);
  }

  protected setInstance(instance: Carousel) {
    this.element.carouselInstance = instance;
  }

  private setupEventHandlers() {
    const handleCarouselTapBound = this.handleCarouselTap.bind(this);
    const handleCarouselDragBound = this.handleCarouselDrag.bind(this);
    const handleCarouselReleaseBound = this.handleCarouselRelease.bind(this);

    if (typeof window.ontouchstart !== 'undefined') {
      this.boundElements.bind(this.element, 'touchstart', handleCarouselTapBound);
      this.boundElements.bind(this.element, 'touchmove', handleCarouselDragBound);
      this.boundElements.bind(this.element, 'touchend', handleCarouselReleaseBound);
    }

    this.boundElements.bind(this.element, 'mousedown', handleCarouselTapBound);
    this.boundElements.bind(this.element, 'mousemove', handleCarouselDragBound);
    this.boundElements.bind(this.element, 'mouseup', handleCarouselReleaseBound);
    this.boundElements.bind(this.element, 'mouseleave', handleCarouselReleaseBound);
    this.boundElements.bind(this.element, 'click', this.handleCarouselClick.bind(this));

    if (this.showIndicators && this.$indicators) {
      const handleIndicatorClickBound = this.handleIndicatorClick.bind(this);
      for (const indicatorItem of this.$indicators.find('.indicator-item')) {
        this.boundElements.bind(indicatorItem, 'click', handleIndicatorClickBound);
      }
    }
    this.boundElements.bind(window, 'resize', this.handleResize.bind(this));
  }

  private removeEventHandlers() {
    this.boundElements.clear(this.element);
    if (this.showIndicators && this.$indicators) {
      for (const indicatorItem of this.$indicators.find('.indicator-item')) {
        this.boundElements.clear(indicatorItem);
      }
    }
    this.boundElements.clear(window);
  }

  private handleCarouselTap(e) {
    if (e.type === 'mousedown' && $(e.target).is('img')) {
      e.preventDefault();
    }
    const eventPosition: EventPosition = new EventPosition(e);
    this.pressed = true;
    this.dragged = false;
    this.verticalDragged = false;
    this.referenceX = eventPosition.getX();
    this.referenceY = eventPosition.getY();
    this.velocity = 0;
    this.amplitude = 0;
    this.frame = this.offset;
    this.timestamp = Date.now();
    clearInterval(this.ticker);
    this.ticker = setInterval(() => this.track(), 100);
  }

  private handleCarouselDrag(e: Event) {
    if (this.pressed) {
      const eventPosition: EventPosition = new EventPosition(e);
      const deltaX = this.reference - eventPosition.getX();
      const deltaY = Math.abs(this.referenceY - eventPosition.getY());
      if (deltaY < 30 && !this.verticalDragged) {
        // If vertical scrolling don't allow dragging.
        if (deltaX > 2 || deltaX < -2) {
          this.dragged = true;
          this.reference = eventPosition.getX();
          this.scrollTo(this.offset + deltaX);
        }

      } else if (this.dragged) {
        // If dragging don't allow vertical scroll.
        e.preventDefault();
        e.stopPropagation();
        return false;

      } else {
        // Vertical scrolling.
        this.verticalDragged = true;
      }
    }

    if (this.dragged) {
      // If dragging don't allow vertical scroll.
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  private handleCarouselRelease(e) {
    if (this.pressed) {
      this.pressed = false;
    } else {
      return;
    }

    clearInterval(this.ticker);
    this.target = this.offset;
    if (this.velocity > 10 || this.velocity < -10) {
      this.amplitude = 0.9 * this.velocity;
      this.target = this.offset + this.amplitude;
    }
    this.target = Math.round(this.target / this.dim) * this.dim;

    // No wrap of items.
    if (this.noWrap) {
      if (this.target >= this.dim * (this.count - 1)) {
        this.target = this.dim * (this.count - 1);
      } else if (this.target < 0) {
        this.target = 0;
      }
    }
    this.amplitude = this.target - this.offset;
    this.timestamp = Date.now();
    requestAnimationFrame(() => this.autoScroll());

    if (this.dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
    return false;
  }

  private handleCarouselClick(e) {
    if (this.dragged) {
      e.preventDefault();
      e.stopPropagation();
      return false;

    } else if (!this.options.fullWidth) {
      const clickedIndex = $(e.target).closest('.carousel-item').index();
      const diff = this.wrap(this.center) - clickedIndex;

      // Disable clicks if carousel was shifted by click
      if (diff !== 0) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.cycleTo(clickedIndex);
    }
  }

  private handleIndicatorClick(e) {
    e.stopPropagation();

    const indicator = $(e.target).closest('.indicator-item');
    if (indicator.length) {
      this.cycleTo(indicator.index());
    }
  }

  private handleResize() {
    // const throttledResize = M.throttle(this.handleResize, 200);
    // this._handleThrottledResizeBound = throttledResize.bind(this);

    if (this.options.fullWidth) {
      this.itemWidth = this.$element.find('.carousel-item').first().innerWidth();
      this.imageHeight = this.$element.find('.carousel-item.active').height();
      this.dim = this.itemWidth * 2 + this.options.padding;
      this.offset = this.center * 2 * this.itemWidth;
      this.target = this.offset;
      this.setCarouselHeight(true);
    } else {
      this.scrollTo();
    }
  }

  private setCarouselHeight(imageOnly = false) {
    const firstSlide = this.$element.has('.carousel-item.active')
      ? this.$element.find('.carousel-item.active').first()
      : this.$element.find('.carousel-item').first();
    const firstImage = firstSlide.find('img').first();
    if (firstImage.length) {
      if (firstImage[0].complete) {
        // If image won't trigger the load event
        const imageHeight = firstImage.height();
        if (imageHeight > 0) {
          this.$element.css('height', imageHeight + 'px');
        } else {
          // If image still has no height, use the natural dimensions to calculate
          const naturalWidth = firstImage[0].naturalWidth;
          const naturalHeight = firstImage[0].naturalHeight;
          const adjustedHeight = (this.$element.width() / naturalWidth) * naturalHeight;
          this.$element.css('height', adjustedHeight + 'px');
        }
      } else {
        // Get height when image is loaded normally
        firstImage.one('load', (el, i) => {
          this.$element.css('height', el.offsetHeight + 'px');
        });
      }
    } else if (!imageOnly) {
      const slideHeight = firstSlide.height();
      this.$element.css('height', slideHeight + 'px');
    }
  }

  private wrap(x: number) {
    return (x >= this.count) ? (x % this.count) : (x < 0) ? this.wrap(this.count + (x % this.count)) : x;
  }

  private track() {
    let now: number;
    let elapsed: number;
    let delta: number;
    let v: number;

    now = Date.now();
    elapsed = now - this.timestamp;
    this.timestamp = now;
    delta = this.offset - this.frame;
    this.frame = this.offset;

    v = 1000 * delta / (1 + elapsed);
    this.velocity = 0.8 * v + 0.2 * this.velocity;
  }

  private autoScroll() {
    let elapsed: number;
    let delta: number;

    if (this.amplitude) {
      elapsed = Date.now() - this.timestamp;
      delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
      if (delta > 2 || delta < -2) {
        this.scrollTo(this.target - delta);
        requestAnimationFrame(() => this.autoScroll());
      } else {
        this.scrollTo(this.target);
      }
    }
  }
}

$.fn.carousel = function (options: CarouselOptions = null): Carousel[] | Carousel {
  const result = Carousel.init(this, options);
  return result.length === 1 ? result[0] : result;
};
