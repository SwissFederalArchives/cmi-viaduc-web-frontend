import { UserService } from '../../../services';
import {Component, OnInit, AfterViewInit, ElementRef} from '@angular/core';
import {Countries, CountriesService, ClientContext, TranslationService, Country} from '@cmi/viaduc-web-core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../model';
import {OnboardingModel} from '../../../model/account/onboardingModel';
import {DigitalOnboardingAssistantErrorMessages} from './digital-onboarding-assistant.ErrorMessages';
import flatpickr from 'flatpickr';
import {German} from 'flatpickr/dist/l10n/de';
import {French} from 'flatpickr/dist/l10n/fr';
import {Italian} from 'flatpickr/dist/l10n/it';
import moment from 'moment';

@Component({
	selector: 'cmi-digital-onboarding-assistant',
	templateUrl: './digital-onboarding-assistant.component.html',
	styleUrls: ['./digital-onboarding-assistant.component.less']
})
export class DigitalOnboardingAssistantComponent implements OnInit, AfterViewInit {
	public currentStep: number;
	public userCanOnboard: boolean;
	public fidentityCanOnboard = true;
	public passportCountries: Countries;
	public idCountries: Countries;
	public allCountries: Countries;
	public myForm: FormGroup;
	public errors: { [key: string]: string } = {};
	private user: User;
	public url: string;
	public formStep1: FormGroup;
	public formStep2: FormGroup;
	private residenceCountries: Country[];
	public newDate = new Date();

	constructor(
		private _context: ClientContext,
		private _userService: UserService,
		private _countriesService: CountriesService,
		private _elemRef: ElementRef,
		private _route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		private _txt: TranslationService) {
		const lang = this._context.language;
		switch (lang) {
			case 'de' :
				flatpickr.localize(German);
				break;
			case 'fr' :
				flatpickr.localize(French);
				break;
			case 'it' :
				flatpickr.localize(Italian);
				break;
		}
	}

	public ngOnInit() {
		this.errors = {};
		this.currentStep = 1;
		this.loadData();
	}

	public ngAfterViewInit(): void {
		this._route.fragment.subscribe((fragment: string) => {
			if (fragment === 'identifiedUser') {
				this._elemRef.nativeElement.scrollIntoView();
			}
		});
	}

	public get languageDependantCountries(): any {
		return this.residenceCountries;
	}

	public getClassForStep(step: number): string {
		let retVal = '';

		if (step === 1 && this.currentStep === step) {
			retVal += 'active ';
		}

		// Schritt 2 darf nur aktiv wrden, wenn Schritt 1 erfolgreich.
		if (step === 2 && this.currentStep === step && this.isCountryValid()) {
			retVal += 'active ';
		} else if (step === 2 && !this.isCountryValid()) {
			retVal += 'disabled ';
		}

		// Schritt 3 darf nur aktiv sein, wenn Schritt 2 erfolgreich
		if (step === 3 && this.currentStep === step && this.formStep2.controls['hasSmartphoneOrPc'].value) {
			retVal += 'active ';
		} else if (step === 3 && this.currentStep === step && !this.formStep2.controls['hasSmartphoneOrPc'].value) {
			retVal += 'disabled ';
		}

		// Schritt 4 hat keine Bedingungen
		if (step === 4 && this.currentStep === step) {
			retVal += 'active ';
		}

		// Man darf nicht Schritte überspringen.
		if (step > this.currentStep) {
			retVal += 'disabled ';
		}
		return retVal;
	}

	public wizardNextPage() {
		this.currentStep++;
		this.wizardSetPage(this.currentStep);
	}

	public wizardPreviousPage() {
		// Wenn Schritt 4 und Schritt 2 nicht erfolgreich, dann zurück zu 2
		if (this.currentStep === 4 && !this.formStep2.controls['hasSmartphoneOrPc'].value) {
			this.currentStep = 2;
		}
		// Wenn Schritt 4 und gar kein Schritt erfolgreich, dann zurück zu 1
		if (this.currentStep === 4 && ! this.formStep2.controls['hasSmartphoneOrPc'].value && !this.isCountryValid()) {
			this.currentStep = 1;
		}

		if ( this.currentStep === 3 || this.currentStep === 2) {
			this.currentStep--;
		}

		if (!this.fidentityCanOnboard && this.currentStep === 4) {
			this.currentStep = 1;
		}

		this.wizardSetPage(this.currentStep);
	}

	public wizardSetPage(nr: number) {
		if (this.currentStep < 0 || this.currentStep > 4) {
			return;
		}

		// Verhindern, dass man vorwärts überspringen kann
		if (nr > this.currentStep) {
			return;
		}

		// Zur letzten Seite, wenn kein gültiges Land vorhanden
		if (nr === 2 && !this.isCountryValid()) {
			this.currentStep = 4;
			return;
		}

		if (nr === 3 ) {
			if ( !this.formStep2.controls['hasSmartphoneOrPc'].value) {
				this.userCanOnboard = false;
				this.currentStep = 4;
				return;
			}
		}

		if (nr === 4 &&  this.formStep2.controls['hasSmartphoneOrPc'].value) {
			this.currentStep = 3;
			this.startOnboardingProcess(this.sendData());
			return;
		}

		this.currentStep = nr;
	}

	public getUserMailToLink(): string {
		return 'mailTo:benutzer-admin@bar.admin.ch';
	}

	public getUserMail(): string {
		return 'benutzer-admin@bar.admin.ch';
	}
	private async loadData() {
		const lang = this._context.language;
		this._loadUser().then(async r => {
			this.user = r;
			this._countriesService.loadCountries(lang)
				.then(async res => {
					this.passportCountries = res.filter(country => country.canOnboardWithPassport && country.newLaenderCode !== null);
					this.idCountries = res.filter(country => country.canOnboardWithIdentityCard && country.newLaenderCode !== null);
					this.passportCountries.push(new Country('00', this._txt.get('account.digitalOnboarding.noPassportOfListedCountry'
						, 'Ich besitze keinen Pass von einem der aufgeführten Länder'), false, false, '000'));
					this.residenceCountries = res.filter(country => country.newLaenderCode !== null);
					this.idCountries.push(new Country('00', this._txt.get('account.digitalOnboarding.noIdOfListedCountry'
						, 'Ich besitze keine Identitätskarte von einem der aufgeführten Länder'), false, false, '000'));
					this.allCountries = res;
					this.InitForm();
			});
		});
	}

	private sendData(): OnboardingModel {
		const userData = new OnboardingModel();
		userData.dateOfBirth = this.myForm.controls['dateOfBirth'].value;
		userData.dateOfBirth = moment(this.myForm.controls['dateOfBirth'].value).utc(true).toISOString();
		userData.email = this.myForm.controls['email'].value;
		userData.name = this.myForm.controls['name'].value;
		userData.firstname = this.myForm.controls['firstName'].value;
		if (this.formStep1.controls['pass'].value !== '000') {
			userData.idType = 'PASSPORT';
			userData.nationality = this.formStep1.controls['pass'].value;
		} else {
			userData.idType = 'ID_CARD';
			userData.nationality = this.formStep1.controls['idCard'].value;
		}

		return userData;
	}

	private isCountryValid(): boolean {
		if (this.formStep1) {
			return this.formStep1.controls['pass'].value && this.formStep1.controls['pass'].value.length === 3  && this.formStep1.controls['pass'].value !== '000' ||
				(this.formStep1.controls['idCard'] && this.formStep1.controls['idCard'].value.length === 3)  && this.formStep1.controls['idCard'].value !== '000';
		}

		return true;
	}

	private InitForm() {
		if (this.allCountries) {
			this.formStep1 = this._formBuilder.group({
			pass: new FormControl('000', [Validators.required, Validators.maxLength(3)]),
			idCard: new FormControl('000',  [Validators.required, Validators.maxLength(3)]),
		});

		let birth = null;
		if (this.user.birthday) {
			birth =  new Date(this.user.birthday);
		}

		this.formStep2 = this._formBuilder.group({
			hasSmartphoneOrPc: new FormControl(false, [Validators.required])
		});
		this.myForm = this._formBuilder.group({
			userId: new FormControl(this.user.userExtId, Validators.required),
			hasSmartphoneOrPc: new FormControl(false),
			name: new FormControl({
					value: this.user.familyName,
					disabled: false
				},
				[Validators.required, Validators.maxLength(60)]),
			firstName: new FormControl(this.user.firstName, [Validators.required, Validators.maxLength(60)]),
			dateOfBirth: new FormControl(birth, [Validators.required, this.dateValidator.bind(this)]),
			email: new FormControl(this.user.emailAddress, [Validators.required, Validators.maxLength(60)])
		});
		this.myForm.statusChanges.subscribe(() => this.updateErrorMessages());
			// Erzeugt eine Warnung;
			this.updateErrorMessages();
		} else {
			this.loadData();
		}
	}

	private async startOnboardingProcess(model:OnboardingModel) {
		await this._userService.startOnboardingProcess(model).then(async res => {
			this.currentStep = 4,
			this.url = res;
			// Nur wenn alle Voraussetzungen erüllt, kann der Benutzer digital onboarden
			this.userCanOnboard =  true;
			this.fidentityCanOnboard = true;
		},
		err => {
			this.userCanOnboard =  true;
			this.fidentityCanOnboard =  false;
			this.currentStep = 4;
		});
	}

	private async _loadUser(): Promise<User> {
		return await this._userService.getUser();
	}

	private updateErrorMessages() {
		this.errors = {};
		for (const message of DigitalOnboardingAssistantErrorMessages) {
			const control = this.myForm.get(message.forControl);
			if (control &&
				control.invalid &&
				control.errors[message.forValidator] &&
				!this.errors[message.forControl]) {
				this.errors[message.forControl] = this._txt.get(message.key, message.text);
			}
		}
	}

	private dateValidator(control: FormControl): any | null {
		if (control.value !==  undefined && control.value !== null && control.value !== '') {
			return null;
		}
		// return error object
		return {'invalidDate': {'value': control.value}};
	}

}
