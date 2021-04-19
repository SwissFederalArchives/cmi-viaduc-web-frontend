import {Component, OnInit} from '@angular/core';
import {ConfigService, TranslationService, UserUiSettings} from '@cmi/viaduc-web-core';
import {SeoService, UrlService, UserService} from '../../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-settings-detail-page',
	templateUrl: 'accountSettingsPage.component.html'
})
export class AccountSettingsPageComponent implements OnInit {
	public loading: boolean;
	public error: any;
	public crumbs: any[] = [];

	public errorText: string;
	public saved: boolean = false;

	public possiblePagingSizes: any[];
	public sortingFields: any[];
	public userSettings: UserUiSettings;

	public chosenSortField: string = '';

	constructor(private _txt: TranslationService,
				private _url: UrlService,
				private _usr: UserService,
				private _cfg: ConfigService,
				private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Benutzeroberfläche', 'accountSettingsPageComponent.pageTitle'));
		this._buildCrumbs();
		this.possiblePagingSizes = this._cfg.getSetting('search.possiblePagingSizes');
		this.sortingFields = this._cfg.getSetting('search.simpleSearchSortingFields');

		this.userSettings = this._cfg.getUserSettings();

		this.chosenSortField = this.userSettings.selectedSortingField.displayName;

		console.log('accountSettingsPage: settings are: ');
		console.log(this.userSettings);
	}

	public onSortFieldChosen(key: any) {
		this.userSettings.selectedSortingField = this.sortingFields.filter(f => f.displayName === key)[0];
	}

	private _buildCrumbs(): void {
		this.crumbs = [];
		this.crumbs.push(
			{iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		this.crumbs.push({url: this._url.getAccountUrl(), label: this._txt.get('breadcrumb.account', 'Konto')});
		this.crumbs.push({label: this._txt.get('breadcrumb.uiSettings', 'Benutzeroberfläche')});
	}

	public saveUserSetting(): void {
		this._usr.updateUserSettings(this.userSettings).then(() => {
				this.errorText = null;
				this.saved = true;
			},
			(reason) => {
				this.errorText = reason;
				this.saved = false;
			});
	}

	public getTranslationKey(field: any): String {
		let key = 'metadata.sortFields.';
		if (field && field.orderBy && field.orderBy !== '') {
			key += field.orderBy;
			if (field.sortOrder && field.sortOrder !== '') {
				key += '.' + field.sortOrder;
			}
		} else {
			key += 'relevanz';
		}
		return key;
	}
}
