import {Component, OnInit} from '@angular/core';
import {AuthorizationService, UrlService, UserService, SeoService} from '../../../modules/client/services';
import {User} from '../../../modules/client/model';
import {ClientContext, CountriesService, TranslationService, ComponentCanDeactivate} from '@cmi/viaduc-web-core';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';

@Component({
	selector: 'cmi-viaduc-register-page',
	templateUrl: 'registerPage.component.html',
	styleUrls: ['registerPage.component.less']
})
export class RegisterPageComponent extends ComponentCanDeactivate implements OnInit  {

	public crumbs: any[] = [];
	public show:boolean = false;
	public user:User;

	public emailRegexPattern: string = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$';
	public phonenumberRegexPattern: string = '^([s()+]*([0-9][s( )-]*){6,20})$';
	public countries: any;
	public languages: any;

	public saveClicked = false;
	public canDeactivateFlag = false;
	public isInternalUser: boolean;
	public minimumDate = moment('01.01.1850', 'DD.MM.YYYY', true).toDate();

	constructor(private _usr: UserService,
				private _auth: AuthorizationService,
				private _countriesService: CountriesService,
				private _context: ClientContext,
				private _txt: TranslationService,
				private _url: UrlService,
				private _router: Router,
				private _seoService: SeoService,
				private _toastr: ToastrService) {
		super();
	}

	public async ngOnInit(): Promise<void> {
		this.isInternalUser = this._auth.isInternalUser();
		this._usr.getUserDataFromClaims().then(u => {
			this.user = u;
			this.user.birthday = '';
			this.user.language = this._context.language;
		});

		this._seoService.setTitle(this._txt.translate('Eingabe Benutzerdaten', 'user.pageTitle'));
		this._buildCrumbs();
		this.languages = [{ name: this._txt.get('languages.de', 'Deutsch'), code: 'de' },
							{ name: this._txt.get('languages.fr', 'Französisch'), code: 'fr' },
							{ name: this._txt.get('languages.it', 'Italienisch'), code: 'it' },
							{ name: this._txt.get('languages.en', 'Englisch'), code: 'en' }];

		await this._countriesService.loadCountries(this._context.language).then(countries => {
			this.countries = this._countriesService.sortCountriesByName(countries);
		});
		this.show = true;
	}

	private _buildCrumbs(): void {
		this.crumbs = [];
		this.crumbs.push({iconClasses: 'glyphicon glyphicon-home', url: this._url.getHomeUrl()});
		this.crumbs.push({label: this._txt.get('breadcrumb.register', 'Eingabe Benutzerdaten')});
	}

	public saveUser(isValid: boolean): void {
		this.saveClicked = true;

		if (!isValid) {
			return;
		}

		if (this.user.birthday) {
			this.user.birthday =  moment(this.user.birthday, 'DD.MM.YYYY', true).utcOffset(0, true).toISOString();
		}
		this._usr.insertUser(this.user).then(() => {
			this.canDeactivateFlag = true;
			this._toastr.success(this._txt.get('user.savesuccess', 'Erfolgreich gespeichert.'));
			this._router.navigate([this._url.getSimpleSearchUrl()]);
		});
	}

	public get legalAgreementConsentText(): string {
		const url: string = this._url.getNutzungsbestimmungenUrl();

		return this._txt.get('user.legelAgreementConsentText',
			'Ich bin einverstanden, dass das Schweizerische Bundesarchiv (BAR) meine Personendaten wie in ' +
			'der <a href=\"#/{0}\">Datenschutzerklärung</a> beschrieben zur Erbringung von Benutzungsdienstleistungen ' +
			'im Rahmen seines Online-Zugangs verwenden darf.',
			url);

	}

	public canDeactivate(): boolean {
		return this.canDeactivateFlag;
	}
	public promptForMessage(): false | 'question' | 'message' {
		return 'message';
	}
	public message(): string {
		return this._txt.get('user.cancelRegistrationMessage', 'Bitte schliessen Sie die Registrierung ab und speichern Sie die Daten.');
	}

}
