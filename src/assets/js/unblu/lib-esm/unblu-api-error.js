var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Type of an unblu error. This can be used to check what kind of error occurred.
 */
export var UnbluErrorType;
(function (UnbluErrorType) {
    /**
     * Thrown if the browser is not supported by unblu.
     */
    UnbluErrorType["UNSUPPORTED_BROWSER"] = "UNSUPPORTED_BROWSER";
    /**
     * Thrown if the initialization of the unblu API failed due to a timeout.
     */
    UnbluErrorType["INITIALIZATION_TIMEOUT"] = "INITIALIZATION_TIMEOUT";
    /**
     * Thrown if the initialization is called with no existing snippet and no configuration.
     */
    UnbluErrorType["CONFIGURATION_MISSING"] = "CONFIGURATION_MISSING";
    /**
     * Thrown during initialization if the snippet can't be loaded or unblu can't be initialized from the snippet.
     */
    UnbluErrorType["ERROR_LOADING_UNBLU"] = "ERROR_LOADING_UNBLU";
    /**
     * Thrown if the unblu JS API is not compatible with the unblu collaboration server.
     */
    UnbluErrorType["INCOMPATIBLE_UNBLU_VERSION"] = "INCOMPATIBLE_UNBLU_VERSION";
    /**
     * Thrown if a function call was invalid.
     * This is usually do to an incompatibility between the unblu JS API and the unblu collaboration server.
     */
    UnbluErrorType["INVALID_FUNCTION_CALL"] = "INVALID_FUNCTION_CALL";
    /**
     * Thrown if the arguments passed to a function where invalid.
     */
    UnbluErrorType["INVALID_FUNCTION_ARGUMENTS"] = "INVALID_FUNCTION_ARGUMENTS";
    /**
     * Thrown if a called action is not permitted for the local person.
     * The details message usually has more information about the required permissions.
     */
    UnbluErrorType["ACTION_NOT_GRANTED"] = "ACTION_NOT_GRANTED";
    /**
     * Thrown if an unexpected exception occurrs during a function execution.
     */
    UnbluErrorType["EXECUTION_EXCEPTION"] = "EXECUTION_EXCEPTION";
    /**
     * Thrown if a method is called in an invalid context. E.g. if the Object called upon was already destroyed.
     */
    UnbluErrorType["ILLEGAL_STATE"] = "ILLEGAL_STATE";
})(UnbluErrorType || (UnbluErrorType = {}));
/**
 * General unblu JS API error class that will be thrown whenever something goes wrong.
 *
 * - Use the [[UnbluApiError.type]] to check what kind of error occurred.
 * - Use the [[UnbluApiError.detail]] for human readable details.
 *
 * Check the documentation of [[UnbluErrorType]] for more details on the different error types.
 *
 * Example:
 * ```ts
 * unblu.api.initialize().then(api => {
 *      // use the api
 * }).catch(e => {
 *     if(e.type === 'INITIALIZATION_TIMEOUT') {
 *          //retry
 *     } else if(e.type === 'UNSUPPORTED_BROWSER') {
 *          // display unsupported browser dialog
 *     } else {
 *          // show generic error message
 *     }
 * });
 * ```
 *
 * or using async / await:
 *
 * ```ts
 * try {
 *     const api = await unblu.api.initialize();
 *     // use the api
 * } catch(e) {
 *     if(e.type === 'INITIALIZATION_TIMEOUT') {
 *          //retry
 *     } else if(e.type === 'UNSUPPORTED_BROWSER') {
 *          // display unsupported browser dialog
 *     } else {
 *          // show generic error message
 *     }
 * }
 * ```
 *
 *
 * The error types may either be checked via their constant string values or via the UnbluErrorType enum:
 *
 * ```ts
 * // using string constant
 * function isTimeout(e: UnbluApiError) {
 *  return e.type === 'INITIALIZATION_TIMEOUT';
 * }
 * ```
 * ```ts
 * // using the enum
 * function isTimeout(e: UnbluApiError) {
 *  return e.type === window.unblu.UnbluErrorType.INITIALIZATION_TIMEOUT;
 * }
 * ```
 *
 */
var UnbluApiError = /** @class */ (function (_super) {
    __extends(UnbluApiError, _super);
    function UnbluApiError(type, detail) {
        var _this = _super.call(this, "type: " + type + ", detail: " + detail) || this;
        _this.type = type;
        _this.detail = detail;
        _this.name = 'UnbluApiError';
        return _this;
    }
    return UnbluApiError;
}(Error));
export { UnbluApiError };
//# sourceMappingURL=unblu-api-error.js.map