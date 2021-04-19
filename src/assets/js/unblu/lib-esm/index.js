import { UnbluStaticApi } from './unblu-static-api';
import { UnbluUtil } from './unblu-util';
import { CallState } from './model/call-state';
import { ConnectionState } from './model/connection-state';
import { ConversationType } from './model/conversation-type';
import { AgentAvailabilityState } from './model/agent-availability-state';
import { ConversationState } from './model/conversation-state';
import { UnbluErrorType } from './unblu-api-error';
export { UnbluApi } from './unblu-api';
export { Conversation } from './conversation';
var unblu = (UnbluUtil.getUnbluObject() || UnbluUtil.createUnbluObject());
unblu.AgentAvailabilityState = AgentAvailabilityState;
unblu.CallState = CallState;
unblu.ConnectionState = ConnectionState;
unblu.ConversationState = ConversationState;
unblu.ConversationType = ConversationType;
unblu.UnbluErrorType = UnbluErrorType;
/**
 * The central access point to the unblu JS API.
 * This api object gives static access to configure and initialize the full unblu `UnbluApi`.
 * When loaded in the global space use `Unblu.Api` to access it.
 * @hidden
 */
export var api = new UnbluStaticApi();
//# sourceMappingURL=index.js.map