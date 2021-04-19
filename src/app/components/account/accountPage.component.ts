import { Component, OnInit } from '@angular/core';
import { ConfigService, TranslationService } from '@cmi/viaduc-web-core';
import { SeoService, UrlService, AuthorizationService } from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-account-page',
	templateUrl: 'accountPage.component.html',
	styleUrls: ['./accountPage.component.less']
})
export class AccountPageComponent implements OnInit {

	public crumbs: any[] = [];
	private submitIdRequestUrl = '';

	public isRegistered: boolean = true;
	public isIdentified: boolean = false;

	constructor(private _txt: TranslationService,
				private _url: UrlService,
				private _cfg: ConfigService,
				private _seoService: SeoService,
				private _authService: AuthorizationService) {
	}

	public ngOnInit(): void {
		this.submitIdRequestUrl = this._cfg.getSetting('account.submitIdRequestUrl');

		// this component is only visible for registered user, so everything != ö2 is identified
		this.isRegistered = this._authService.hasRole('Ö2');
		this.isIdentified = !this.isRegistered;

		this._seoService.setTitle(this._txt.translate('Konto', 'accountPageComponent.pageTitle'));
		this._buildCrumbs();
	}

	private _buildCrumbs(): void {
		this.crumbs = [];
		this.crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl() ,
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		this.crumbs.push({ label: this._txt.get('breadcrumb.account', 'Konto') });
		this.crumbs.push({ label: this._txt.get('breadcrumb.accountStatus', 'Benutzerstatus') });
	}

	public submitIdRequest(): void {
		location.href = this.submitIdRequestUrl;
	}
}
