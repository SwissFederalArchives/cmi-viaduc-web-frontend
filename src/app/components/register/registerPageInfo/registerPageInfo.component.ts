import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService, UrlService} from '../../../modules/client/services';
import {TranslationService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-register-info-page',
	templateUrl: 'registerPageInfo.component.html',
	styleUrls: ['registerPageInfo.component.less']
})
export class RegisterPageInfoComponent implements OnInit {

	public crumbs: any[] = [];
	constructor(private _auth: AuthenticationService,
				private _url: UrlService,
				private _router: Router,
				private _txt: TranslationService) {
	}

	public login(): void {
		this._auth.login();
	}

	private _buildCrumbs(): void {
		let crumbs: any[] = this.crumbs = [];
		crumbs.push({iconClasses: 'glyphicon glyphicon-home', url: this._url.getHomeUrl()});
		crumbs.push({label: this._txt.get('breadcrumb.registerInfo', 'Infos zur Kontoeröffnung')});
	}

	public getTextZugangEIam(): string {
		return this._txt.translate('Sie können den Online-Zugang anonym, als registrierte oder als identifizierte Person nutzen. Je nach Benutzerstatus stehen Ihnen ' +
			'unterschiedliche Funktionen zur Verfügung.', 'registerInfo.info1');
	}

	public getTextFragen(): string {
		return this._txt.translate('Bei Fragen zur Registrierung wenden Sie sich bitte an die Beratung oder an ' +
			'<a href="mailto:benutzer-admin@bar.admin.ch">benutzer-admin@bar.admin.ch</a>.', 'registerInfo.questionText');
	}

	public cancel(): void {
		this._router.navigate([this._url.getHomeUrl()]);
	}

	public ngOnInit(): void {
		this._buildCrumbs();
	}
}
