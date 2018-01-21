import * as anim from 'animejs';
import * as $ from 'cash-dom';

import CashObject from '../CashObject';

interface SliderOptions {
  indicators?: boolean;
  height?: number|string;
  duration?: number;
  interval?: number;
}

interface AnimOptions {
  targets: any;
  opacity: number;
  duration: number;
  easing: string;
  translateX?: number;
  translateY?: number;
}

interface SliderElement extends Element {
  sliderInstance: Slider;
}

class Slider extends CashObject<SliderElement> {
  public static init($elements: SliderElement[], options: SliderOptions = null): Slider[] {
    const result: Slider[] = [];
    if (options) {
      for (const element of $elements) {
        result.push(new Slider(element, options));
      }
    } else {
      for (const element of $elements) {
        if (!element.sliderInstance) {
          result.push(new Slider(element, options));
        } else {
          result.push(element.sliderInstance);
        }
      }
    }
    return result;
  }

  private static defaults: SliderOptions = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  private options: SliderOptions;
  private $slider: any;
  private $slides: any;
  private $indicators: any;

  private activeIndex: number;
  private $active: any;
  private interval: number;

  constructor(el, options = null) {
    super(el);

    this.options = $.extend({}, Slider.defaults, options);

    this.$slider = this.$element.find('.slides');
    this.$slides = this.$slider.children('li');
    this.activeIndex = this.$slider.find('.active').index();
    if (this.activeIndex !== -1) {
      this.$active = this.$slides.eq(this.activeIndex);
    }

    this.setSliderHeight();

    for (const element of this.$slides.find('.caption')) {
      this.animateCaptionIn(element, 0);
    }

    for (const element of this.$slides.find('img')) {
      const placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      const $element = $(element);
      if ($element.attr('src') !== placeholderBase64) {
        $element.css('background-image', `url("${$element.attr('src')}")`);
        $element.attr('src', placeholderBase64);
      }
    }

    this.setupIndicators();

    if (this.$active) {
      this.$active.css('display', 'block');
    } else {
      this.$slides.first().addClass('active');
      anim({
        targets: this.$slides.first()[0],
        opacity: 1,
        duration: this.options.duration,
        easing: 'easeOutQuad'
      });

      this.activeIndex = 0;
      this.$active = this.$slides.eq(this.activeIndex);

      if (this.options.indicators) {
        this.$indicators.eq(this.activeIndex).addClass('active');
      }
    }

    if (this.$active.has('img')) {
      anim({
        targets: this.$active.find('.caption')[0],
        opacity: 1,
        translateX: 0,
        translateY: 0,
        duration: this.options.duration,
        easing: 'easeOutQuad'
      });
    }

    this.setupEventHandlers();
    this.start();
  }

  public destroy() {
    this.pause();
    this.removeIndicators();
    this.removeEventHandlers();
    this.setInstance(undefined);
  }

  public set(index: number) {
    if (index >= this.$slides.length) {
      index = 0;
    } else if (index < 0) {
      index = this.$slides.length - 1;
    }

    if (this.activeIndex !== index) {
      this.$active = this.$slides.eq(this.activeIndex);
      const $caption = this.$active.find('.caption');
      this.$active.removeClass('active');

      anim({
        targets: this.$active[0],
        opacity: 0,
        duration: this.options.duration,
        easing: 'easeOutQuad',
        complete: () => {
          for (const slide of this.$slides.not('.active')) {
            anim({
              targets: slide,
              opacity: 0,
              translateX: 0,
              translateY: 0,
              duration: 0,
              easing: 'easeOutQuad'
            });
          }
        }
      });

      this.animateCaptionIn($caption[0], this.options.duration);

      if (this.options.indicators) {
        this.$indicators.eq(this.activeIndex).removeClass('active');
        this.$indicators.eq(index).addClass('active');
      }

      anim({
        targets: this.$slides.eq(index)[0],
        opacity: 1,
        duration: this.options.duration,
        easing: 'easeOutQuad'
      });

      anim({
        targets: this.$slides.eq(index).find('.caption')[0],
        opacity: 1,
        translateX: 0,
        translateY: 0,
        duration: this.options.duration,
        delay: this.options.duration,
        easing: 'easeOutQuad'
      });

      this.$slides.eq(index).addClass('active');
      this.activeIndex = index;

      this.start();
    }
  }

  public pause() {
    clearInterval(this.interval);
  }

  public start() {
    clearInterval(this.interval);
    this.interval = setInterval(this.handleInterval.bind(this), this.options.duration + this.options.interval);
  }

  public next() {
    let newIndex = this.activeIndex + 1;

    if (newIndex >= this.$slides.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = this.$slides.length - 1;
    }

    this.set(newIndex);
  }

  public prev() {
    let newIndex = this.activeIndex - 1;

    if (newIndex >= this.$slides.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = this.$slides.length - 1;
    }

    this.set(newIndex);
  }

  protected setInstance(instance: Slider) {
    this.element.sliderInstance = instance;
  }

  private setupEventHandlers() {
    const handleIndicatorClickBound = this.handleIndicatorClick.bind(this);

    if (this.options.indicators) {
      for (const indicator of this.$indicators) {
        this.boundElements.bind(indicator, 'click', handleIndicatorClickBound);
      }
    }
  }

  private removeEventHandlers() {
    if (this.options.indicators) {
      for (const indicator of this.$indicators) {
        this.boundElements.clear(indicator);
      }
    }
  }

  private handleIndicatorClick(e: MouseEvent) {
    this.set($(e.target).index());
  }

  private handleInterval() {
    let newActiveIndex = this.$slider.find('.active').index();
    if (this.$slides.length === newActiveIndex + 1) {
      newActiveIndex = 0;
    } else {
      newActiveIndex += 1;
    }
    this.set(newActiveIndex);
  }

  private animateCaptionIn(caption, duration) {
    const animOptions: AnimOptions = {
      targets: caption,
      opacity: 0,
      duration: duration,
      easing: 'easeOutQuad'
    };

    if ($(caption).hasClass('center-align')) {
      animOptions.translateY = -100;
    } else if ($(caption).hasClass('right-align')) {
      animOptions.translateX = 100;
    } else if ($(caption).hasClass('left-align')) {
      animOptions.translateX = -100;
    }

    anim(animOptions);
  }

  private setSliderHeight() {
    if (!this.$element.hasClass('fullscreen')) {
      if (this.options.indicators) {
        if  ('string' === typeof this.options.height) {
          this.$element.css('height', this.options.height);
        } else {
          this.$element.css('height', (this.options.height + 40) + 'px');
        }
      } else {
        this.$element.css('height', this.options.height + 'px');
      }
      this.$slider.css('height', this.options.height + 'px');
    }
  }

  private setupIndicators() {
    if (this.options.indicators) {
      const indicatorContainer = $('<ul class="indicators"></ul>');
      for (const unused of  this.$slides) {
        const $indicator = $('<li class="indicator-item"></li>');
        indicatorContainer.append($indicator);
      }
      this.$element.append(indicatorContainer);
      this.$indicators = indicatorContainer.children('li.indicator-item');
    }
  }

  private removeIndicators() {
    this.$element.find('ul.indicators').remove();
  }
}

$.fn.slider = function (options: SliderOptions = null): Slider[] | Slider {
  const result = Slider.init(this, options);
  return result.length === 1 ? result[0] : result;
};
