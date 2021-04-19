export var CallState;
(function (CallState) {
    /**
     * A some one is trying to call, the phone is ringing
     */
    CallState["INBOUND"] = "INBOUND";
    /**
     * You are trying to call someone
     */
    CallState["OUTBOUND"] = "OUTBOUND";
    /**
     * A call is active and the local tab is connected to the call.
     */
    CallState["ACTIVE_JOINED"] = "ACTIVE_JOINED";
    /**
     * A call is active but the local person has declined it.
     */
    CallState["ACTIVE_NOT_JOINED"] = "ACTIVE_NOT_JOINED";
    /**
     * A call is active and the local person has joined it on an other device.
     */
    CallState["ACTIVE_JOINED_ELSEWHERE"] = "ACTIVE_JOINED_ELSEWHERE";
    /**
     * No inbound, outgoing or active call.
     */
    CallState["NONE"] = "NONE";
})(CallState || (CallState = {}));
//# sourceMappingURL=call-state.js.map