export default class EventPosition {
  private touchEvent: TouchEvent;
  private mouseEvent: MouseEvent;
  private x: number;
  private y: number;

  constructor(event) {
    const touchEvent = event as TouchEvent;
    if (touchEvent.targetTouches) {
      this.touchEvent = touchEvent;
    } else {
      this.mouseEvent = event as MouseEvent;
    }
  }

  public getX(): number {
    if (undefined === this.x) {
      if (this.touchEvent && (this.touchEvent.targetTouches.length >= 1)) {
        this.x = this.touchEvent.targetTouches[0].clientX;
      } else {
        this.x = this.mouseEvent.clientX;
      }
    }
    return this.x;
  }

  public getY(): number {
    if (undefined === this.y) {
      if (this.touchEvent && (this.touchEvent.targetTouches.length >= 1)) {
        this.y = this.touchEvent.targetTouches[0].clientY;
      } else {
        this.y = this.mouseEvent.clientY;
      }
    }
    return this.y;
  }
}

