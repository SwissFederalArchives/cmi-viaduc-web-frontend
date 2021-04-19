import {Ordering} from '@cmi/viaduc-web-core';

export interface OrderCreationRequest extends Ordering {
	orderIdsToExclude: number[];
}
