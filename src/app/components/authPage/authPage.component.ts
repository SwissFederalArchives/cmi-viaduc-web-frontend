import {Component, OnInit} from '@angular/core';
import {AuthenticationService, SeoService} from '../../modules/client/services';
import {TranslationService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-auth-page',
	templateUrl: 'authPage.component.html'
})
export class AuthPageComponent implements OnInit {

	public success: boolean;

	constructor(private _authentication: AuthenticationService,
				private _seoService: SeoService,
				private _txt: TranslationService) {
		this._seoService.setTitle(this._txt.translate('Weiterleitung', 'authPage.pageTitle'));
	}

	public ngOnInit(): void {
		this._authentication.isSigningIn = true;
		this._authentication.activateSession().then(
			r => {
				this._authentication.isSigningIn = false;
				this._authentication.onSignedIn.next(r);
				this.redirectToOriginBeforeLogin();
			},
			e => {
				console.log('Login error', e);
				this.success = false;
				this._authentication.isSigningIn = false;
				this._authentication.onSignedIn.next(false);
			});
	}

	public redirectToOriginBeforeLogin(): void {
		this._authentication.redirectToOriginBeforeLogin();
	}
}
