var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { EventEmitter } from './internal/util/event-emitter';
import { UnbluApiError, UnbluErrorType } from './unblu-api-error';
/**
 * This class allows controlling of the UI state and the Unblu individual UI.
 */
var UnbluUiApi = /** @class */ (function () {
    /**
     * @hidden
     */
    function UnbluUiApi(internalApi) {
        var _this = this;
        this.internalApi = internalApi;
        this.internalListeners = {};
        this.eventEmitter = new EventEmitter();
        internalApi.meta.on('upgraded', function () { return _this.onUpgraded(); });
    }
    UnbluUiApi.prototype.on = function (event, listener) {
        var needsInternalSubscription = !this.eventEmitter.hasListeners(event);
        this.eventEmitter.on(event, listener);
        if (needsInternalSubscription)
            this.onInternal(event).catch(function (e) { return console.warn('Error registering internal listener for event:', event, 'error:' + e, e); });
    };
    /**
     * Removes a previously registered listener
     * @param event The event to unregister from.
     * @param listener The listener to remove.
     */
    UnbluUiApi.prototype.off = function (event, listener) {
        var removed = this.eventEmitter.off(event, listener);
        if (!this.eventEmitter.hasListeners(event))
            this.offInternal(event).catch(function (e) { return console.warn('Error removing internal listener for event:', event, 'error:' + e, e); });
        return removed;
    };
    UnbluUiApi.prototype.onInternal = function (eventName) {
        return __awaiter(this, void 0, void 0, function () {
            var internalListener, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (eventName) {
                            case UnbluUiApi.UI_STATE_CHANGE:
                                internalListener = function (event) {
                                    _this.eventEmitter.emit(event.name, event.data);
                                };
                                break;
                            default:
                                throw new UnbluApiError(UnbluErrorType.INVALID_FUNCTION_ARGUMENTS, 'Registration to unknown event:' + eventName);
                        }
                        return [4 /*yield*/, this.internalApi.meta.isUpgraded()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        this.internalListeners[eventName] = internalListener;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.internalApi.general.on(eventName, internalListener)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        delete this.internalListeners[eventName];
                        throw e_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UnbluUiApi.prototype.offInternal = function (eventName) {
        return __awaiter(this, void 0, void 0, function () {
            var listener;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listener = this.internalListeners[eventName];
                        if (listener == null) {
                            return [2 /*return*/];
                        }
                        delete this.internalListeners[eventName];
                        return [4 /*yield*/, this.internalApi.general.off(eventName, listener)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Toggle the individual UI.
     */
    UnbluUiApi.prototype.toggleIndividualUi = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.toggleIndividualUi()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
 * Open the PIN entry UI.
 */
    UnbluUiApi.prototype.openPinEntryUi = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.openPinEntryUi()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pop-out the individual UI.
     * **NOTE:** this has to be called in a click-event.
     */
    UnbluUiApi.prototype.popoutIndividualUi = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.popoutIndividualUi()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open the individual UI.
     */
    UnbluUiApi.prototype.openIndividualUi = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.openIndividualUi()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Collapse the individual UI.
     */
    UnbluUiApi.prototype.collapseIndividualUi = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.collapseIndividualUi()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the state of the individual UI.
     * @return A promise that resolves to the state of the individual ui.
     */
    UnbluUiApi.prototype.getIndividualUiState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireUpgrade()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.internalApi.general.getIndividualUiState()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UnbluUiApi.prototype.requireUpgrade = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.internalApi.meta.upgrade(false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UnbluUiApi.prototype.onUpgraded = function () {
        for (var _i = 0, _a = this.eventEmitter.getEventsWithListeners(); _i < _a.length; _i++) {
            var event_1 = _a[_i];
            // register internal listeners for all events that need upgrade.
            if (!this.internalListeners[event_1])
                this.onInternal(event_1);
        }
    };
    /**
     * Event emitted every time the state of the individual ui is changed.
     *
     * @event uiStateChange
     * @see [[on]] for listener registration
     * @see [[UiStateChangeListener]]
     */
    UnbluUiApi.UI_STATE_CHANGE = 'uiStateChange';
    return UnbluUiApi;
}());
export { UnbluUiApi };
//# sourceMappingURL=unblu-api-ui.js.map