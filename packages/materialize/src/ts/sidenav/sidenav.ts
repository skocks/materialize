import * as anime from 'animejs';

import MaterialObject from '../MaterialObject';

interface SidenavElement extends HTMLElement {
  sidenav: Sidenav;
}

export class Sidenav extends MaterialObject<SidenavElement> {
  public static initialize() {
    const sidenavs: HTMLCollectionOf<Element>
      = document.getElementsByClassName('sidenav');
    for (let i = 0; i < sidenavs.length; i++) {
      const collapsible = sidenavs.item(i) as SidenavElement;
      if (-1 === Sidenav.elements.indexOf(collapsible)) {
        Sidenav.elements.push(new Sidenav(collapsible).getElement());
      }
    }

    const triggers: HTMLCollectionOf<Element>
      = document.getElementsByClassName('sidenav-trigger');
    for (let i = 0; i < triggers.length; i++) {
      const trigger: SidenavElement = triggers.item(i) as SidenavElement;
      const sidenavId: string = Sidenav.getIdFromTrigger(trigger);
      const sidenavElement: SidenavElement = document.getElementById(sidenavId) as SidenavElement;
      if (!sidenavElement) {
        throw new Error(`no sidenav found for id: '${sidenavId}'`);
      }
      sidenavElement.sidenav.addTrigger(trigger);
    }
  }

  public static destroy() {
    for (const element of Sidenav.elements) {
      element.sidenav.destroy();
    }
    Sidenav.elements = [];
  }

  private static elements: SidenavElement[] = [];
  private id: string;

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
  private draggable: boolean;

  private edge: 'left' | 'right';

  private triggerElements: SidenavElement[] = [];

  public constructor(element: SidenavElement) {
    super(element);

    this.draggable = element.classList.contains('draggable');
    this.edge = this.element.classList.contains('right-aligned') ? 'right' : 'left';

    this.id = this.element.getAttribute('id');
    this.isOpen = false;
    this.isFixed = this.element.classList.contains('sidenav-fixed');
    this.isDragged = false;

    this.createOverlay();
    this.createDragTarget();
    this.setupEventHandlers();
    this.setupClasses();
    this.setupFixed();
  }

  public getElement() {
    return this.element;
  }

  public destroy() {
    this.removeEventHandlers();
    this.removeOverlay();
    this.removeClasses();
    this.dragTarget.parentNode.removeChild(this.dragTarget);
  }

  public addTrigger(trigger: SidenavElement) {
    trigger.sidenav = this;
    this.boundElements.bind(trigger, 'click', this.handleTriggerClick.bind(this));
    this.triggerElements.push(trigger);
  }

  public open() {
    if (this.isOpen === true) {
      return;
    }
    this.isOpen = true;

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

    if (this.isFixed && window.innerWidth > 992) {
      const transformX = this.edge === 'left' ? '-105%' : '105%';
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

  protected setInstance(element: SidenavElement) {
    element.sidenav = this;
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
    const handleCloseDragBound = this.handleCloseDrag.bind(this);
    const handleCloseReleaseBound = this.handleCloseRelease.bind(this);

    this.boundElements.bind(this.dragTarget, 'touchmove', this.handleDragTargetDrag.bind(this));
    this.boundElements.bind(this.dragTarget, 'touchend', this.handleDragTargetRelease.bind(this));
    this.boundElements.bind(this.overlay, 'touchmove', handleCloseDragBound);
    this.boundElements.bind(this.overlay, 'touchend', handleCloseReleaseBound);
    this.boundElements.bind(this.element, 'touchmove', handleCloseDragBound);
    this.boundElements.bind(this.element, 'touchend', handleCloseReleaseBound);
    this.boundElements.bind(this.element, 'click', this.handleCloseTriggerClick.bind(this));

    if (this.isFixed) {
      this.boundElements.bind(window, 'resize', this.handleWindowResize.bind(this));
    }
  }

  private removeEventHandlers() {
    this.boundElements.clear(window);
    this.boundElements.clear(this.dragTarget);
    this.boundElements.clear(this.overlay);
    this.boundElements.clear(this.element);
    for (const trigger of this.triggerElements) {
      this.boundElements.clear(trigger);
    }
  }

  private handleTriggerClick(e: Event) {
    e.preventDefault();
    const trigger: SidenavElement = e.currentTarget as SidenavElement;
    const sidenav: Sidenav = trigger.sidenav;
    if (sidenav) {
      sidenav.open();
    }
    return false;
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

  private dragMoveUpdate(e) {
    const clientX = e.targetTouches[0].clientX;
    this.deltaX = Math.abs(this.xPos - clientX);
    this.xPos = clientX;
    this.velocityX = this.deltaX / (Date.now() - this.time);
    this.time = Date.now();
  }

  private handleDragTargetDrag(e: TouchEvent) {
    if (!this.isDragged) {
      this.startDrag(e);
    }
    this.dragMoveUpdate(e);
    let totalDeltaX = this.xPos - this.startingXpos;
    const dragDirection = totalDeltaX > 0 ? 'right' : 'left';
    totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
    if (this.edge === dragDirection) {
      totalDeltaX = 0;
    }

    let transformX = totalDeltaX;
    let transformPrefix = 'translateX(-100%)';
    if (this.edge === 'right') {
      transformPrefix = 'translateX(100%)';
      transformX = -transformX;
    }

    this.percentOpen = Math.min(1, totalDeltaX / this.width);

    this.element.style.transform = `${transformPrefix} translateX(${transformX}px)`;
    this.overlay.style.opacity = this.percentOpen;
  }

  private handleDragTargetRelease() {
    if (this.isDragged) {
      if (this.percentOpen > .5) {
        this.open();
      } else {
        this.animateOut();
      }

      this.isDragged = false;
    }
  }

  private handleCloseDrag(e) {
    if (this.isOpen) {
      if (!this.isDragged) {
        this.startDrag(e);
      }
      this.dragMoveUpdate(e);

      let totalDeltaX = this.xPos - this.startingXpos;
      const dragDirection = totalDeltaX > 0 ? 'right' : 'left';

      totalDeltaX = Math.min(this.width, Math.abs(totalDeltaX));
      if (this.edge !== dragDirection) {
        totalDeltaX = 0;
      }

      let transformX = -totalDeltaX;
      if (this.edge === 'right') {
        transformX = -transformX;
      }

      this.percentOpen = Math.min(1, 1 - totalDeltaX / this.width);

      this.element.style.transform = `translateX(${transformX}px)`;
      this.overlay.style.opacity = this.percentOpen;
    }
  }

  private handleCloseRelease() {
    if (this.isOpen && this.isDragged) {
      if (this.percentOpen > .5) {
        this.animateIn();
      } else {
        this.close();
      }

      this.isDragged = false;
    }
  }

  private handleCloseTriggerClick(e) {
    // const $closeTrigger = $(e.target).closest('.sidenav-close');
    // if ($closeTrigger.length) {
    //   this.close();
    // }
  }

  private handleWindowResize() {
    if (window.innerWidth > 992) {
      this.open();
    } else {
      this.close();
    }
  }

  private setupClasses() {
    if (this.edge === 'right') {
      this.dragTarget.classList.add('right-aligned');
    }
  }

  private removeClasses() {
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
    const isLeftEdge = this.edge === 'left';
    let slideOutPercent = isLeftEdge ? -1 : 1;
    if (this.isDragged) {
      if (isLeftEdge) {
        slideOutPercent = slideOutPercent + this.percentOpen;
      } else {
        slideOutPercent = slideOutPercent - this.percentOpen;
      }
    }

    anime.remove(this.element);
    anime({
      targets: this.element,
      translateX: [`${slideOutPercent * 100}%`, 0],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }

  private animateOverlayIn() {
    let start = 0;
    if (this.isDragged) {
      start = this.percentOpen;
    } else {
      this.overlay.style.display = 'block';
    }

    anime.remove(this.overlay);
    anime({
      targets: this.overlay,
      opacity: [start, 1],
      duration: 250,
      easing: 'easeOutQuad'
    });
  }

  private animateOut() {
    this.animateSidenavOut();
    this.animateOverlayOut();
  }

  private animateSidenavOut() {
    const endPercent = this.edge === 'left' ? -1 : 1;
    let slideOutPercent = 0;
    if (this.isDragged) {
      slideOutPercent = this.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
    }

    anime.remove(this.element);
    anime({
      targets: this.element,
      translateX: [`${slideOutPercent * 100}%`, `${endPercent * 105}%`],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }

  private animateOverlayOut() {
    anime.remove(this.overlay);
    anime({
      targets: this.overlay,
      opacity: 0,
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        this.overlay.style.display = 'none';
      }
    });
  }

  private removeOverlay() {
    this.overlay.parentNode.removeChild(this.overlay);
  }
}
