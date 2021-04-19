export var AgentAvailabilityState;
(function (AgentAvailabilityState) {
    /**
     * There is at least one agent available for the specified named area and language.
     */
    AgentAvailabilityState["AVAILABLE"] = "AVAILABLE";
    /**
     * There is at least one agent watching the inbound queue for the specified named area and language but the max capacity of pararallel conversations is reached.
     *
     * It is very likely, that an agent will be available in a short time.
     */
    AgentAvailabilityState["BUSY"] = "BUSY";
    /**
     * There is no agent watching the inbound queue for the specified named area and language.
     *
     * It is unlikely, that an agent will be available in a short time.
     */
    AgentAvailabilityState["UNAVAILABLE"] = "UNAVAILABLE";
    /**
     * There is currently no agent handling any inbound queue items.
     *
     * It is very unlikely, that an agent will be available in a short time.
     */
    AgentAvailabilityState["OFFLINE"] = "OFFLINE";
})(AgentAvailabilityState || (AgentAvailabilityState = {}));
//# sourceMappingURL=agent-availability-state.js.map