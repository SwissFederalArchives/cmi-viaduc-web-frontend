import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ErrorInfo, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-error-page',
	templateUrl: 'errorPage.component.html'
})
export class ErrorPageComponent implements OnInit {

	public error: ErrorInfo;

	constructor(private _txt: TranslationService, private _route: ActivatedRoute) {
	}

	public ngOnInit() {
		const errInfo = this.error = (this._route.snapshot.data['error'] || <ErrorInfo>{});
		if (_util.isEmpty(errInfo.title)) {
			errInfo.title = this._txt.get(
				'errors.unknownErrorTitle',
				'Es ist ein Fehler aufgetreten'
			);
		}
		if (_util.isEmpty(errInfo.message)) {
			errInfo.message = this._txt.get(
				'errors.unknownErrorMessage',
				'Bitte versuchen Sie es später erneut. Falls das Problem bestehen bleibt, wenden Sie sich bitte an das Bundesarchiv.'
			);
		}
	}
}
