import { InternalModule } from './module';
import { ApiBridge } from '../api-bridge';
import { PersonInfo } from '../../model/person-info';
import { ConversationType } from '../../model/conversation-type';
import { IndividualUiState } from '../../model/individualui_state';
export declare type GeneralEventType = 'activeConversationChange' | 'notificationCountChange' | 'personChange' | 'uiStateChange';
declare const enum GeneralFunction {
    startConversation = "startConversation",
    joinConversation = "joinConversation",
    openConversation = "openConversation",
    toggleIndividualUi = "toggleIndividualUi",
    popoutIndividualUi = "popoutIndividualUi",
    openIndividualUi = "openIndividualUi",
    openPinEntryUi = "openPinEntryUi",
    collapseIndividualUi = "collapseIndividualUi",
    getIndividualUiState = "getIndividualUiState",
    getActiveConversation = "getActiveConversation",
    getNotificationCount = "getNotificationCount",
    getPersonInfo = "getPersonInfo"
}
export declare class GeneralModule extends InternalModule<GeneralFunction, GeneralEventType> {
    constructor(bridge: ApiBridge);
    startConversation(type: ConversationType, visitorName?: string): Promise<string>;
    joinConversation(pin: string, visitorName?: string): Promise<string>;
    openConversation(conversationId: string): Promise<void>;
    toggleIndividualUi(): Promise<void>;
    openPinEntryUi(): Promise<void>;
    popoutIndividualUi(): Promise<void>;
    openIndividualUi(): Promise<void>;
    collapseIndividualUi(): Promise<void>;
    getIndividualUiState(): Promise<IndividualUiState>;
    getActiveConversation(): Promise<string>;
    getNotificationCount(): Promise<number>;
    getPersonInfo(): Promise<PersonInfo>;
}
export {};
