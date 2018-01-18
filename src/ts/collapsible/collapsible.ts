import MaterialObject from '../MaterialObject';

export interface CollapsibleElement extends HTMLElement {
  collapsible: Collapsible;
}

export class Collapsible extends MaterialObject<CollapsibleElement> {
  public static initialize() {
    const collapsibles: HTMLCollectionOf<Element> = document.getElementsByClassName('collapsible');
    for (let i = 0; i < collapsibles.length; i++) {
      const collapsible = collapsibles[i] as CollapsibleElement;
      if (-1 === Collapsible.elements.indexOf(collapsible)) {
        Collapsible.elements.push(new Collapsible(collapsible).getElement());
      }
    }
  }

  public static destroy() {
    for (const element of Collapsible.elements) {
      element.collapsible.destroy();
    }
    Collapsible.elements = [];
  }

  private static elements: CollapsibleElement[] = [];

  private single: boolean;

  public constructor(element: CollapsibleElement) {
    super(element);
    this.single = element.classList.contains('single');
    this.setupEventHandlers();
  }

  public getElement() {
    return this.element;
  }

  public destroy() {
    this.boundElements.clearAll();
    this.element.collapsible = undefined;
    this.element = undefined;
  }

  protected setInstance(element: CollapsibleElement) {
    if (element.collapsible) {
      element.collapsible.destroy();
    }
    this.element = element;
    element.collapsible = this;
  }

  private setupEventHandlers() {
    this.boundElements.bind(this.element, 'click', this.onClick.bind(this));
  }

  private onClick(event: Event): boolean {
    if (this.activate(event.target as Element)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  private activate(element: Element): boolean {
    const parent: HTMLElement = element.parentElement;
    if (this.element === parent.parentElement) {
      if (this.single) {
        const activeChilds = this.element.querySelectorAll(':scope > .active');
        console.log(activeChilds);
        for (let i = 0; i < activeChilds.length; i++) {
          const currentChild = activeChilds.item(i);
          if (parent !== currentChild) {
            currentChild.classList.remove('active');
          }
        }
      }
      if (!parent.classList.contains('active')) {
        parent.classList.add('active');
      } else {
        parent.classList.remove('active');
      }
      return true;
    }
    return false;
  }
}
