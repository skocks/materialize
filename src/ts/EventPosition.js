"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventPosition = /** @class */ (function () {
    function EventPosition(event) {
        var touchEvent = event;
        if (touchEvent.targetTouches) {
            this.touchEvent = touchEvent;
        }
        else {
            this.mouseEvent = event;
        }
    }
    EventPosition.prototype.getX = function () {
        if (undefined === this.x) {
            if (this.touchEvent && (this.touchEvent.targetTouches.length >= 1)) {
                this.x = this.touchEvent.targetTouches[0].clientX;
            }
            else {
                this.x = this.mouseEvent.clientX;
            }
        }
        return this.x;
    };
    EventPosition.prototype.getY = function () {
        if (undefined === this.y) {
            if (this.touchEvent && (this.touchEvent.targetTouches.length >= 1)) {
                this.y = this.touchEvent.targetTouches[0].clientY;
            }
            else {
                this.y = this.mouseEvent.clientY;
            }
        }
        return this.y;
    };
    return EventPosition;
}());
exports.default = EventPosition;
//# sourceMappingURL=EventPosition.js.map