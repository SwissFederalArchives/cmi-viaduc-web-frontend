import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ErrorInfo, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {AuthenticationService} from '../../modules/client/services/authentication.service';

@Component({
	selector: 'cmi-viaduc-error-page',
	templateUrl: 'errorPage.component.html'
})
export class ErrorSmartcardPageComponent implements OnInit {

	public error: ErrorInfo;

	constructor(private _txt: TranslationService, private _route: ActivatedRoute, private _authentication: AuthenticationService) {
	}

	public ngOnInit() {
		const errInfo = this.error = (this._route.snapshot.data['error'] || <ErrorInfo>{});
		if (_util.isEmpty(errInfo.title)) {
			errInfo.title = this._txt.get(
				'errors.smartcardErrorTitle',
				'Nur Kerberos-Anmeldung möglich'
			);
		}
		if (_util.isEmpty(errInfo.message)) {
			errInfo.message = this._txt.get(
				'errors.smartcardErrorMessage',
				'Sie haben sich versucht mit Smartcard anzumelden. In Ihrer Rolle dürfen Sie sich nur mit Kerberos anmelden. Sie werden innert 8 Sekunden automatisch abgemeldet.'
			);
		}

		setTimeout(() => {
			this._authentication.logout();
		}, 8000);
	}
}
