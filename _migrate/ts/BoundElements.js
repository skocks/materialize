"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BoundElements = /** @class */ (function () {
    function BoundElements() {
        this.targets = [];
        this.index = {};
    }
    BoundElements.prototype.bind = function (target, event, boundHandler, capture) {
        if (capture === void 0) { capture = false; }
        var index = this.targets.indexOf(target);
        if (-1 === index) {
            index = this.targets.push(target) - 1;
        }
        var boundHandlers;
        if (this.index[index]) {
            boundHandlers = this.index[index];
        }
        else {
            boundHandlers = {};
            this.index[index] = boundHandlers;
        }
        boundHandlers[event] = {
            capture: capture,
            handler: boundHandler
        };
        target.addEventListener(event, boundHandler, capture);
    };
    BoundElements.prototype.clear = function (target) {
        var index = this.targets.indexOf(target);
        if (index > -1) {
            var boundHandlers = this.index[index];
            for (var event_1 in boundHandlers) {
                /* istanbul ignore else */
                if (boundHandlers.hasOwnProperty(event_1)) {
                    var handlerDefinition = boundHandlers[event_1];
                    target.removeEventListener(event_1, handlerDefinition.handler, handlerDefinition.capture);
                }
            }
        }
    };
    return BoundElements;
}());
exports.BoundElements = BoundElements;
