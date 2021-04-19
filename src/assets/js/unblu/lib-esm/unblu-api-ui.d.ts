import { InternalApi } from './internal/internal-api';
import { GeneralEventType } from './internal/module/general-module';
import { Listener } from './internal/util/event-emitter';
import { IndividualUiState } from './model/individualui_state';
/**
 * Listener called whenever the ui state changes.
 * @param uistate The new uistate.
 */
export declare type UiStateChangeListener = (uistate: IndividualUiState) => void;
/**
 * This class allows controlling of the UI state and the Unblu individual UI.
 */
export declare class UnbluUiApi {
    private internalApi;
    private internalListeners;
    private eventEmitter;
    /**
     * Event emitted every time the state of the individual ui is changed.
     *
     * @event uiStateChange
     * @see [[on]] for listener registration
     * @see [[UiStateChangeListener]]
     */
    static readonly UI_STATE_CHANGE: 'uiStateChange';
    /**
     * @hidden
     */
    constructor(internalApi: InternalApi);
    /**
     * Registers an event listener for the given event.
     * @param event The uistateChange event.
     * @param listener The listener to be called.
     * @see [[UI_STATE_CHANGE]]
     */
    on(event: typeof UnbluUiApi.UI_STATE_CHANGE, listener: UiStateChangeListener): void;
    /**
     * Removes a previously registered listener
     * @param event The event to unregister from.
     * @param listener The listener to remove.
     */
    off(event: GeneralEventType, listener: Listener): boolean;
    private onInternal;
    private offInternal;
    /**
     * Toggle the individual UI.
     */
    toggleIndividualUi(): Promise<void>;
    /**
 * Open the PIN entry UI.
 */
    openPinEntryUi(): Promise<void>;
    /**
     * Pop-out the individual UI.
     * **NOTE:** this has to be called in a click-event.
     */
    popoutIndividualUi(): Promise<void>;
    /**
     * Open the individual UI.
     */
    openIndividualUi(): Promise<void>;
    /**
     * Collapse the individual UI.
     */
    collapseIndividualUi(): Promise<void>;
    /**
     * Get the state of the individual UI.
     * @return A promise that resolves to the state of the individual ui.
     */
    getIndividualUiState(): Promise<IndividualUiState>;
    private requireUpgrade;
    private onUpgraded;
}
