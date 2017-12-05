import * as anime from 'animejs';
import * as $ from 'cash-dom';

import CashObject from '../CashObject';

interface SidenavElement extends HTMLElement {
  sidenavInstance: Sidenav;
}

/**
 * Options for the Sidenav
 * @member Sidenav#options
 * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
 * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
 * @prop {Number} [inDuration=250] - Length in ms of enter transition
 * @prop {Number} [outDuration=200] - Length in ms of exit transition
 * @prop {Function} onOpenStart - Function called when sidenav starts entering
 * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
 * @prop {Function} onCloseStart - Function called when sidenav starts exiting
 * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
 */
interface SidenavOptions {
  draggable?: boolean;
  edge?: 'left' | 'right';
  inDuration?: number;
  outDuration?: number;
  onOpenStart?: () => void;
  onOpenEnd?: () => void;
  onCloseStart?: () => void;
  onCloseEnd?: () => void;
}

export class Sidenav extends CashObject<SidenavElement> {
  public static init($elements: SidenavElement[], options: SidenavOptions = null): Sidenav[] {
    const result: Sidenav[] = [];
    if (options) {
      for (const element of $elements) {
        result.push(new Sidenav(element, options));
      }
    } else {
      for (const element of $elements) {
        if (!element.sidenavInstance) {
          result.push(new Sidenav(element, options));
        } else {
          result.push(element.sidenavInstance);
        }
      }
    }
    return result;
  }

  private static sidenavInstances: Sidenav[] = [];

  private static defaults: SidenavOptions = {
    draggable: true,
    edge: 'left',
    inDuration: 250,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
  };

  private id: string;
  private options: SidenavOptions;
  private isOpen: boolean;
  private isFixed: boolean;
  private isDragged: boolean;

  private overlay: any;
  private dragTarget: any;

  private startingXpos: number;
  private xPos: number;
  private time: number;
  private width: number;
  private deltaX: number;
  private velocityX: number;
  private percentOpen: number;

  constructor(element: any, options: SidenavOptions = null) {
    super(element);

    this.id = this.$element.attr('id');
    this.options = $.extend({}, Sidenav.defaults, options);
    this.isOpen = false;
    this.isFixed = this.element.classList.contains('sidenav-fixed');
    this.isDragged = false;

    this.createOverlay();
    this.createDragTarget();
    this.setupEventHandlers();
    this.setupClasses();
    this.setupFixed();

    Sidenav.sidenavInstances.push(this);
  }

  public destroy() {
    this.removeEventHandlers();
    this.removeOverlay();
    this.removeClasses();
    this.dragTarget.parentNode.removeChild(this.dragTarget);

    const index = Sidenav.sidenavInstances.indexOf(this);
    if (index >= 0) {
      Sidenav.sidenavInstances.splice(index, 1);
    }
  }

  public open() {
    if (this.isOpen === true) {
      return;
    }
    this.isOpen = true;

    if (typeof(this.options.onOpenStart) === 'function') {
      this.options.onOpenStart.call(this, this.element);
    }

    if (this.isFixed && window.innerWidth > 992) {
      anime.remove(this.element);
      anime({
        targets: this.element,
        translateX: 0,
        duration: 0,
        easing: 'easeOutQuad'
      });
      this.enableBodyScrolling();
      this.overlay.style.display = 'none';
    } else {
      this.preventBodyScrolling();

      if (!this.isDragged || this.percentOpen !== 1) {
        this.animateIn();
      }
    }
  }

  public close() {
    if (this.isOpen === false) {
      return;
    }

    this.isOpen = false;

    if (typeof(this.options.onCloseStart) === 'function') {
      this.options.onCloseStart.call(this, this.element);
    }

    if (this.isFixed && window.innerWidth > 992) {
      const transformX = this.options.edge === 'left' ? '-105%' : '105%';
      this.element.style.transform = `translateX(${transformX})`;
    } else {
      this.enableBodyScrolling();

      if (!this.isDragged || this.percentOpen !== 0) {
        this.animateOut();
      } else {
        this.overlay.style.display = 'none';
      }
    }
  }

  protected setInstance(instance: Sidenav) {
    this.element.sidenavInstance = instance;
  }

  private createOverlay() {
    const overlay = document.createElement('div');
    overlay.classList.add('sidenav-overlay');
    document.body.appendChild(overlay);

    const closeBound = this.close.bind(this);
    this.boundElements.bind(overlay, 'click', closeBound);

    this.overlay = overlay;
  }

  private setupEventHandlers() {
    if (Sidenav.sidenavInstances.length === 0) {
      this.boundElements.bind(document.body, 'click', this.handleTriggerClick.bind(this));
    }

    const handleCloseDragBound = this._handleCloseDrag.bind(this);
    const handleCloseReleaseBound = this._handleCloseRelease.bind(this);

    this.boundElements.bind(this.dragTarget, 'touchmove', this._handleDragTargetDrag.bind(this));
    this.boundElements.bind(this.dragTarget, 'touchend', this._handleDragTargetRelease.bind(this));
    this.boundElements.bind(this.overlay, 'touchmove', handleCloseDragBound);
    this.boundElements.bind(this.overlay, 'touchend', handleCloseReleaseBound);
    this.boundElements.bind(this.element, 'touchmove', handleCloseDragBound);
    this.boundElements.bind(this.element, 'touchend', handleCloseReleaseBound);
    this.boundElements.bind(this.element, 'click', this._handleCloseTriggerClick.bind(this));

    if (this.isFixed) {
      window.addEventListener('resize', this._handleWindowResize.bind(this));
    }
  }

  private removeEventHandlers() {
    this.boundElements.clear(window);
    this.boundElements.clear(document.body);
    this.boundElements.clear(this.dragTarget);
    this.boundElements.clear(this.overlay);
    this.boundElements.clear(this.element);
  }

  private handleTriggerClick(e: Event) {
    const $trigger = $(e.target).closest('.sidenav-trigger');
    if (e.target && $trigger.length) {
      const sidenavId = this.getIdFromTrigger($trigger[0]);
      const sidenav: SidenavElement = document.getElementById(sidenavId) as SidenavElement;
      if (!sidenav) {
        throw new Error(`no sidenav found for id: '${sidenav}'`);
      }
      const sidenavInstance: Sidenav = sidenav.sidenavInstance;
      if (sidenavInstance) {
        sidenavInstance.open();
      } else {
        throw new Error(`element with id '${sidenav}' has no sidennav instance`);
      }
      e.preventDefault();
    }
  }

  private startDrag(e: TouchEvent) {
    const clientX = e.targetTouches[0].clientX;
    this.isDragged = true;
    this.startingXpos = clientX;
    this.xPos = this.startingXpos;
    this.time = Date.now();
    this.width = this.element.getBoundingClientRect().width;
    this.overlay.style.display = 'block';
    anime.remove(this.element);
    anime.remove(this.overlay);
  }

  private _dragMoveUpdate(e) {
    const clientX = e.targetTouches[0].clientX;
    this.deltaX = Math.abs(this.xPos - clientX);
    this.xPos = clientX;
    this.velocityX = this.deltaX / (Date.now() - this.time);
    this.time = Date.now();
  }

  private _handleDragTargetDrag(e: TouchEvent) {
    if (!this.isDragged) {
      this.startDrag(e);
    }
    this._dragMoveUpdate(e);
    let totalDeltaX = this.xPos - this.startingXpos;
    const dragDirection = totalDeltaX > 0 ? 'right' : 'left';
    totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
    if (this.options.edge === dragDirection) {
      totalDeltaX = 0;
    }

    let transformX = totalDeltaX;
    let transformPrefix = 'translateX(-100%)';
    if (this.options.edge === 'right') {
      transformPrefix = 'translateX(100%)';
      transformX = -transformX;
    }

    this.percentOpen = Math.min(1, totalDeltaX / this.width);

    this.element.style.transform = `${transformPrefix} translateX(${transformX}px)`;
    this.overlay.style.opacity = this.percentOpen;
  }

  private _handleDragTargetRelease() {
    if (this.isDragged) {
      if (this.percentOpen > .5) {
        this.open();
      } else {
        this.animateOut();
      }

      this.isDragged = false;
    }
  }

  private _handleCloseDrag(e) {
    if (this.isOpen) {
      if (!this.isDragged) {
        this.startDrag(e);
      }
      this._dragMoveUpdate(e);

      let totalDeltaX = this.xPos - this.startingXpos;
      const dragDirection = totalDeltaX > 0 ? 'right' : 'left';

      totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
      if (this.options.edge !== dragDirection) {
        totalDeltaX = 0;
      }

      let transformX = -totalDeltaX;
      if (this.options.edge === 'right') {
        transformX = -transformX;
      }

      this.percentOpen = Math.min(1, 1 - totalDeltaX / this.width);

      this.element.style.transform = `translateX(${transformX}px)`;
      this.overlay.style.opacity = this.percentOpen;
    }
  }

  private _handleCloseRelease() {
    if (this.isOpen && this.isDragged) {
      if (this.percentOpen > .5) {
        this.animateIn();
      } else {
        this.close();
      }

      this.isDragged = false;
    }
  }

  private _handleCloseTriggerClick(e) {
    const $closeTrigger = $(e.target).closest('.sidenav-close');
    if ($closeTrigger.length) {
      this.close();
    }
  }

  private _handleWindowResize() {
    if (window.innerWidth > 992) {
      this.open();
    } else {
      this.close();
    }
  }

  private setupClasses() {
    if (this.options.edge === 'right') {
      this.element.classList.add('right-aligned');
      this.dragTarget.classList.add('right-aligned');
    }
  }

  private removeClasses() {
    this.element.classList.remove('right-aligned');
    this.dragTarget.classList.remove('right-aligned');
  }

  private setupFixed() {
    if (this.isFixed && window.innerWidth > 992) {
      this.open();
    }
  }

  private createDragTarget() {
    const dragTarget = document.createElement('div');
    dragTarget.classList.add('drag-target');
    document.body.appendChild(dragTarget);
    this.dragTarget = dragTarget;
  }

  private preventBodyScrolling() {
    const body = document.body;
    body.style.overflow = 'hidden';
  }

  private enableBodyScrolling() {
    const body = document.body;
    body.style.overflow = '';
  }

  private animateIn() {
    this.animateSidenavIn();
    this.animateOverlayIn();
  }

  private animateSidenavIn() {
    const isLeftEdge = this.options.edge === 'left';
    let slideOutPercent = isLeftEdge ? -1 : 1;
    if (this.isDragged) {
      if (isLeftEdge) {
        slideOutPercent =  slideOutPercent + this.percentOpen;
      } else {
        slideOutPercent = slideOutPercent - this.percentOpen;
      }
    }

    anime.remove(this.element);
    anime({
      targets: this.element,
      translateX: [`${slideOutPercent * 100}%`, 0],
      duration: this.options.inDuration,
      easing: 'easeOutQuad',
      complete: () => {
        // Run onOpenEnd callback
        if (typeof(this.options.onOpenEnd) === 'function') {
          this.options.onOpenEnd.call(this, this.element);
        }
      }
    });
  }

  private animateOverlayIn() {
    let start = 0;
    if (this.isDragged) {
      start = this.percentOpen;
    } else {
      $(this.overlay).css({
        display: 'block'
      });
    }

    anime.remove(this.overlay);
    anime({
      targets: this.overlay,
      opacity: [start, 1],
      duration: this.options.inDuration,
      easing: 'easeOutQuad'
    });
  }

  private animateOut() {
    this.animateSidenavOut();
    this.animateOverlayOut();
  }

  private animateSidenavOut() {
    const endPercent = this.options.edge === 'left' ? -1 : 1;
    let slideOutPercent = 0;
    if (this.isDragged) {
      slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
    }

    anime.remove(this.element);
    anime({
      targets: this.element,
      translateX: [`${slideOutPercent * 100}%`, `${endPercent * 105}%`],
      duration: this.options.outDuration,
      easing: 'easeOutQuad',
      complete: () => {
        // Run onOpenEnd callback
        if (typeof(this.options.onCloseEnd) === 'function') {
          this.options.onCloseEnd.call(this, this.element);
        }
      }
    });
  }

  private animateOverlayOut() {
    anime.remove(this.overlay);
    anime({
      targets: this.overlay,
      opacity: 0,
      duration: this.options.outDuration,
      easing: 'easeOutQuad',
      complete: () => {
        $(this.overlay).css('display', 'none');
      }
    });
  }

  private removeOverlay() {
    this.overlay.parentNode.removeChild(this.overlay);
  }
}

$.fn.sidenav = function (options: SidenavOptions = null): Sidenav[] | Sidenav {
  const result = Sidenav.init(this, options);
  return result.length === 1 ? result[0] : result;
};
