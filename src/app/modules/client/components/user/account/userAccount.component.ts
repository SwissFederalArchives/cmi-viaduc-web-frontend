import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
	ClientContext,
	ConfigService,
	Countries,
	CountriesService,
	Country,
	TranslationService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import { User, UserSetting, UserSettingType } from '../../../model';
import { AuthorizationService, UrlService, UserService } from '../../../services';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'cmi-viaduc-user-account',
	templateUrl: 'userAccount.component.html',
	styleUrls: ['./userAccount.component.less']
})
export class UserAccountComponent implements OnInit {
	public name: string;
	public user: User;
	public loading: boolean = false;
	public isExternalUser: boolean;
	public saveClicked = false;

	public get allowEditingUserSettings(): boolean {
		return this._allowEditingUserSettings;
	}

	public get languageDependantCountries(): Countries {
		return !this.countryIsConfigured ? this._languageDependantCountriesWithEmpty : this._languageDependantCountries;
	}

	public get languages(): any {
		return this._languages;
	}

	public get countryIsConfigured(): boolean {
		let countryCode = this.countryCode;

		if (countryCode == null) {
			return false;
		}

		return countryCode !== '';
	}

	public get orderedUserSettings(): UserSetting[] {
		return this._userSettings;
	}

	public get eIAMLink(): string {
		return this._url.getExternalHostUrl() + this._cfg.getSetting('account.eIAMLink', '/_pep/myaccount?returnURI=/recherche/#/konto/benutzerangaben');
	}

	private get countryCode(): string {
		let userSetting = this._getCountryCodeUserSetting();

		if (userSetting == null) {
			return null;
		}

		return userSetting.value;
	}

	private set countryCode(newCountryCode: string) {
		this._getCountryCodeUserSetting().value = newCountryCode;
	}

	private _userSettings: UserSetting[];
	private _languageDependantCountriesWithEmpty: Countries = <Countries>{};
	private _errorMandatoryField: string;
	private _errorWrongFormat: string;
	private _errorDateFieldFormat: string;
	private _captionFamilyName: string;
	private _captionFirstName: string;
	private _captionEmail: string;
	private _captionOrganization: string;
	private _captionBirthday: string;
	private _captionStreet: string;
	private _captionStreetAttachment: string;
	private _captionZipcode: string;
	private _captionTown: string;
	private _captionCountry: string;
	private _captionPhonenumber: string;
	private _captionMobileNumber: string;
	private _captionPreferredLanguage: string;
	private _dateRegex = /(0[1-9]|1[0-9]|2[0-9]|3[01])\.(0[1-9]|1[012])\.(?:18|19|20)[0-9]{2}/;
	private _emailRegexPattern: string = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$';
	private _allowEditingUserSettings: boolean = false;
	private _languageDependantCountries: Countries = <Countries>{};
	private _languages: any;

	constructor(private _context: ClientContext,
		private _authorization: AuthorizationService,
		private _userService: UserService,
		private _countriesService: CountriesService,
		private _txt: TranslationService,
		private _cfg: ConfigService,
		private _cdr: ChangeDetectorRef,
		private _url: UrlService,
		private _toastr: ToastrService) {
		this.isExternalUser = this._authorization.isExternalUser();
	}

	public ngOnInit() {
		this._captionFamilyName = this._txt.get('account.familyName', 'Name');
		this._captionFirstName = this._txt.get('account.firstName', 'Vorname');
		this._captionEmail = this._txt.get('account.email', 'E-Mail');
		this._captionOrganization = this._txt.get('account.organization', 'Organisation');
		this._captionStreet = this._txt.get('account.street', 'Strasse');
		this._captionStreetAttachment = this._txt.get('account.streetAttachment', 'Zusatz');
		this._captionZipcode = this._txt.get('account.zipcode', 'PLZ');
		this._captionTown = this._txt.get('account.town', 'Ort');
		this._captionCountry = this._txt.get('account.country', 'Land');
		this._captionPhonenumber = this._txt.get('account.phoneNumber', 'Telefon');
		this._captionBirthday = this._txt.get('account.birthday', 'Geburtsdatum');
		this._captionMobileNumber = this._txt.get('account.mobileTel', 'Mobiltelefon');
		this._captionPreferredLanguage = this._txt.get('account.preferredLanguage', 'Bevorzugte Sprache');
		this._errorMandatoryField = this._txt.get('account.mandatoryFieldError', 'Dieses Feld muss ausgefüllt werden.');
		this._errorWrongFormat = this._txt.get('account.wrongFormat', 'Das Format entspricht keiner Telefonnummer');
		this._errorDateFieldFormat = this._txt.get('account.dateFieldFormat', 'Das Format entspricht keinem gültigen Datum (tt.mm.jjjj).');
		this._languages = [{ name: this._txt.get('languages.de', 'Deutsch'), code: 'de' },
							{ name: this._txt.get('languages.fr', 'Französisch'), code: 'fr' },
							{ name: this._txt.get('languages.it', 'Italienisch'), code: 'it' },
							{ name: this._txt.get('languages.en', 'Englisch'), code: 'en' }];
		this._callLoadOrReload();
	}

	public onChangeSettingsClicked() {
		this._allowEditingUserSettings = !this._allowEditingUserSettings;
	}

	public onCancelChangeSettingsClicked() {
		this._allowEditingUserSettings = !this._allowEditingUserSettings;
		this._callLoadOrReload();
	}

	public async onFormSubmitClicked() {
		this.saveClicked = true;
		this.recalcRegexes();

		if (this.userSettingsAreInvalid()) {
			this._cdr.detectChanges();
			return;
		}

		await this._saveUserSettingsIfChanged();
	}

	public onCountryChanged(countryName: string): void {
		let userSetting = this._getCountryCodeUserSetting();
		userSetting.value = this._getCountryCodeFromLanguageDependantCountryName(countryName);
	}

	public onLanguageChanged(languageName: string): void {
		let userSetting = this._getLanguageCodeUserSetting();
		userSetting.value = this._getLanguageCodeFromLanguageName(languageName);
	}

	public getLanguageDependantCountryNameFromUserSetting(userSetting: UserSetting): string {
		let match = this._languageDependantCountries.find(c => c.code === userSetting.value);
		return match != null ? match.name : '';
	}

	public getLanguageFromUserSetting(userSetting: UserSetting): string {
		let match = this._languages.find(c => c.code === userSetting.value);
		return match != null ? match.name : '';
	}

	public getValueForSelectedCountryAttribute(country: Country): string {
		const selected = 'selected';

		if (this.countryIsConfigured && this._stringsAreEqualIndependantOfCase(country.code, this.countryCode)) {
			return selected;
		}

		if (!this.countryIsConfigured && country.code === '') {
			return selected;
		}

		if (!_util.isEmpty(country.code) && country.code === this.countryCode) {
			return selected;
		}

		return '';
	}

	public getValueForSelectedLanguageAttribute(language: any): string {
		const selected = 'selected';

		if (this.user && this._stringsAreEqualIndependantOfCase(language.code, this.user.language)) {
			return selected;
		}

		if (!_util.isEmpty(language.code) && language.code === this.user.language) {
			return selected;
		}

		return '';
	}

	public userSettingsAreInvalid(): boolean {
		for (let userSetting of this._userSettings) {
			if (userSetting.isInvalid) {
				return true;
			}
		}

		return false;
	}

	public recalcRegexes(): boolean {
		for (let userSetting of this._userSettings) {
			if (userSetting.calculateInvalidRegex()) {
				return true;
			}
		}

		return false;
	}

	private _loadCountries(language: string) {
		let countries = this._countriesService.getCountries(language);
		this._languageDependantCountries = this._countriesService.sortCountriesByName(countries);
		countries.push(new Country('', ''));
		this._languageDependantCountriesWithEmpty = this._countriesService.sortCountriesByName(countries);
	}

	private async _loadUser(): Promise<void> {
		try {
			this.loading = true;
			this.user = await this._userService.getUser();

		} finally {
			this.loading = false;
		}
	}

	private _callLoadOrReload(): void {
		this._loadOrReloadUserSettings().then(() => {
		});
	}

	private async _loadOrReloadUserSettings(): Promise<void> {
		try {
			this.loading = true;

			await this._loadUser();
			this._loadCountries(this._context.language);

			this._userSettings = [];
			this._userSettings.push(new UserSetting(UserSettingType.FamilyName, this._captionFamilyName, this.user.familyName,
				this._authorization.hasMoreThenOe2Rights(), true, null, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.FirstName, this._captionFirstName, this.user.firstName,
				this._authorization.hasMoreThenOe2Rights(), true, null, this._errorMandatoryField, null));
			// Only Ö3 User is not allowed to change birthday
			this._userSettings.push(new UserSetting(UserSettingType.Birthday, this._captionBirthday, this._formatDateToDayMonthYearFormat(this.user.birthday),
				this._authorization.hasRole(this._authorization.roles.Oe3), false, this._dateRegex.source, this._errorDateFieldFormat));
			this._userSettings.push(new UserSetting(UserSettingType.Organization, this._captionOrganization, this.user.organization, false, !this.isExternalUser, null,
				this.isExternalUser ? null : this._errorMandatoryField));
			this._userSettings.push(new UserSetting(UserSettingType.Street, this._captionStreet, this.user.street, false,
				true, null, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.StreetAttachment, this._captionStreetAttachment, this.user.streetAttachment, false));
			this._userSettings.push(new UserSetting(UserSettingType.Zipcode, this._captionZipcode, this.user.zipCode, false,
				true, null, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.Town, this._captionTown, this.user.town, false,
				true, null, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.Country, this._captionCountry, this.user.countryCode, false,
				true, null, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.PhoneNumber, this._captionPhonenumber, this.user.phoneNumber, false,
				false, '^([s()+]*([0-9][s( )-]*){6,20})$', this._errorWrongFormat, ''));
			this._userSettings.push(new UserSetting(UserSettingType.MobileNumber, this._captionMobileNumber, this.user.mobileNumber, false,
				false, '^([s()+]*([0-9][s( )-]*){6,20})$', this._errorWrongFormat, ''));
			this._userSettings.push(new UserSetting(UserSettingType.Email, this._captionEmail, this.user.emailAddress, (this._authorization.isInternalUser()), true,
				this._emailRegexPattern, this._errorMandatoryField, null));
			this._userSettings.push(new UserSetting(UserSettingType.Language, this._captionPreferredLanguage, this.user.language, false,
				true, null, this._errorMandatoryField, this._txt.get('account.preferredLanguageHelpText', 'Bitte geben Sie an, in welcher Sprache Sie mit dem Bundesarchiv kommunizieren möchten.')));

		} catch (e) {
			console.log(e);
			throw e;
		}
		finally {
			this.loading = false;
		}
	}
	private _formatDateToDayMonthYearFormat(date: string): string {
		if (_util.isEmpty(date)) {
			return '';
		}
		return moment(new Date(date)).format('DD.MM.YYYY');
	}

	private async _saveUserSettingsIfChanged(): Promise<void> {
		let hasChanged = false;
		for (let userSetting of this._userSettings) {
			if (userSetting.isReadOnly) {
				continue;
			}
			switch (userSetting.userSettingType) {
				case UserSettingType.FamilyName:
					if (!(this.user.familyName === userSetting.value)) {
						this.user.familyName = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.FirstName:
					if (!(this.user.firstName === userSetting.value)) {
						this.user.firstName = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Organization:
					if (!(this.user.organization === userSetting.value)) {
						this.user.organization = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Street:
					if (!(this.user.street === userSetting.value)) {
						this.user.street = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.StreetAttachment:
					if (!(this.user.streetAttachment === userSetting.value)) {
						this.user.streetAttachment = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Zipcode:
					if (!(this.user.zipCode === userSetting.value)) {
						this.user.zipCode = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Town:
					if (!(this.user.town === userSetting.value)) {
						this.user.town = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Country:
					if (!(this.user.countryCode === userSetting.value)) {
						this.user.countryCode = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.PhoneNumber:
					if (!(this.user.phoneNumber === userSetting.value)) {
						this.user.phoneNumber = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.MobileNumber:
					if (!(this.user.mobileNumber === userSetting.value)) {
						this.user.mobileNumber = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Birthday:
					if (!(this.user.birthday === userSetting.value)) {
						this.user.birthday = userSetting.hasValue ? moment(userSetting.value, 'DD.MM.YYYY', true).utcOffset(0, true).toISOString() : '';
						hasChanged = true;
					}
					break;
				case UserSettingType.Email:
					if (!(this.user.emailAddress === userSetting.value)) {
						this.user.emailAddress = userSetting.value;
						hasChanged = true;
					}
					break;
				case UserSettingType.Language:
					if (!(this.user.language === userSetting.value)) {
						this.user.language = userSetting.value;
						hasChanged = true;
					}
					break;
				default:
					console.log('Not implemented: user setting \'' + userSetting.userSettingType + '\' in userAccount._saveUserSettingsIfChanged()');
			}
		}

		if (!hasChanged) {
			return;
		}

		this._userService.updateUser(this.user).subscribe(() => {
			this._allowEditingUserSettings = !this._allowEditingUserSettings;
			this._toastr.success(this._txt.get('userAccount.saveSuccess', 'Ihre Benutzerdaten wurden erfolgreich gespeichert'),
				this._txt.get('userAccount.saveSuccessTitle', 'Erfolgreich Gespeichert'));
			this._callLoadOrReload();	// Required to update any server generated data like modified date
		}, (error) => {
			this._toastr.error(this._txt.get('userAccount.saveError', 'Ihre Benutzerdaten wurden nicht gespeichert'),
				this._txt.get('userAccount.saveErrorTitle', 'Problem beim Speichern'));
			this._callLoadOrReload();
		}
		);
	}

	private _getCountryCodeFromLanguageDependantCountryName(countryName: string): string {
		let match = this._languageDependantCountries.find(c => c.name === countryName);
		return match.code;
	}

	private _getLanguageCodeFromLanguageName(languageName: string): string {
		let match = this._languages.find(c => c.name === languageName);
		return match.code;
	}

	private _getCountryCodeUserSetting(): UserSetting {
		return this._userSettings.find(s => s.isCountryCode);
	}

	private _getLanguageCodeUserSetting(): UserSetting {
		return this._userSettings.find(s => s.isLanguage);
	}

	private _stringsAreEqualIndependantOfCase(a: string, b: string): boolean {
		if (a == null || b == null) {
			return a == null && b == null;
		}

		return a.toLowerCase() === b.toLowerCase();
	}
}
