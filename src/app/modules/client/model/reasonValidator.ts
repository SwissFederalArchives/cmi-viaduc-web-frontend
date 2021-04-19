import {AbstractControl, ValidationErrors} from '@angular/forms';
import {Utilities as _util} from '@cmi/viaduc-web-core';

export class ReasonValidator {
	public static missingReason(c: AbstractControl): ValidationErrors {
		if (!c || !c.value) {
			return null;
		}

		let item = c.value;
		let missing = item.hasPersonendaten && _util.isEmpty(item.reason);
		return missing ? { missingReason: missing } : null;
	}

	public static missingFlag(c: AbstractControl): ValidationErrors {
		if (!c || !c.value) {
			return null;
		}

		let item = c.value;
		let missing = (!item.hasPersonendaten) && !_util.isEmpty(item.reason);
		return missing ? {missingFlag: missing} : null;
	}
}
