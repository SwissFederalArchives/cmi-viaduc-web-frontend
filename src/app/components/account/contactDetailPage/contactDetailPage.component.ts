import {Component, OnInit} from '@angular/core';
import {TranslationService} from '@cmi/viaduc-web-core';
import {SeoService, UrlService} from '../../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-contact-detail-page',
	templateUrl: 'contactDetailPage.component.html'
})
export class ContactDetailPageComponent implements OnInit {
	public loading: boolean;
	public error: any;
	public crumbs: any[] = [];

	constructor(private _txt: TranslationService,
				private _url: UrlService,
				private _seoService: SeoService) {
	}

	private _buildCrumbs(): void {
		let crumbs: any[] = this.crumbs = [];
		crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		crumbs.push({url: this._url.getAccountUrl(), label: this._txt.get('breadcrumb.account', 'Konto')});
		crumbs.push({label: this._txt.get('breadcrumb.userDetails', 'Benutzerdaten')
		});
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Benutzerdaten', 'contactDetailPageComponent.pageTitle'));
		this._buildCrumbs();
	}
}
