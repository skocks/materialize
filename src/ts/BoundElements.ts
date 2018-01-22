export default class BoundElements {
  private targets: EventTarget[];
  private index: HandlerIndex;

  constructor() {
    this.targets = [];
    this.index = {};
  }

  public bind(target: EventTarget, event: string, boundHandler: any, capture: boolean = false) {
    let index: number = this.targets.indexOf(target);
    if (-1 === index) {
      index = this.targets.push(target) - 1;
    }
    let boundHandlers: BoundHandlers;
    if (this.index[index]) {
      boundHandlers = this.index[index];
    } else {
      boundHandlers = {};
      this.index[index] = boundHandlers;
    }
    boundHandlers[event] = {
      capture: capture,
      handler: boundHandler
    };
    target.addEventListener(event, boundHandler, capture);
  }

  public clearAll() {
    for (const current of this.targets) {
      this.clear(current);
    }
  }

  public clear(target: EventTarget = null) {
    const index: number = this.targets.indexOf(target);
    if (index > -1) {
      const boundHandlers = this.index[index];
      for (const event in boundHandlers) {
        /* istanbul ignore else */
        if (boundHandlers.hasOwnProperty(event)) {
          const handlerDefinition: HandlerDefinition = boundHandlers[event];
          target.removeEventListener(event, handlerDefinition.handler, handlerDefinition.capture);
        }
      }
    }
  }
}

interface HandlerIndex {
  [index: number]: BoundHandlers;
}

interface BoundHandlers {
  [key: string]: HandlerDefinition;
}

interface HandlerDefinition {
  handler: any;
  capture: boolean;
}
