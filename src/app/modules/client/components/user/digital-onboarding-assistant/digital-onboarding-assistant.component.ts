import { UserService } from '../../../services';
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Countries, CountriesService, ClientContext } from '@cmi/viaduc-web-core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'cmi-digital-onboarding-assistant',
	templateUrl: './digital-onboarding-assistant.component.html',
	styleUrls: ['./digital-onboarding-assistant.component.less']
})
export class DigitalOnboardingAssistantComponent implements OnInit, AfterViewInit {
	public currentStep: number;
	public hasPhoneWithSms: boolean = false;
	public hasSmartphoneOrPc: boolean = false;
	public userCanOnboard: boolean;
	public swisscomLink: string;
	public passportCountries: Countries;
	public idCountries: Countries;
	public selectedId: string;
	public selectedCountry: string;

	constructor(
		private _context: ClientContext,
		private _userService: UserService,
		private _countriesService: CountriesService,
		private _elemRef: ElementRef,
		private _route: ActivatedRoute) { }

	public ngOnInit() {
		this.currentStep = 1;
		this._userService.GetOnboardingUri()
			.then(link => this.swisscomLink = link);
		const lang = this._context.language;
		this._countriesService.loadCountries(lang)
			.then(res => {
				this.passportCountries = res.filter(country => country.canOnboardWithPassport);
				this.idCountries = res.filter(country => country.canOnboardWithIdentityCard);
		});
		this.selectedId = '0';
		this.selectedCountry = '0';
	}

	public ngAfterViewInit(): void {
		this._route.fragment.subscribe((fragment: string) => {
			if (fragment === 'identifiedUser') {
				this._elemRef.nativeElement.scrollIntoView();
			}
		});
	}

	public setNextStep(nextStep: number) {
		this.currentStep = nextStep;
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
		if (step === 3 && this.currentStep === step && this.hasPhoneWithSms) {
			retVal += 'active ';
		} else if (step === 3 && !this.hasPhoneWithSms) {
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
		// Wenn auf Schritt 2 oder 3 dann kann imer zurück gegangen werden
		// Wenn Schritt 4 und Schrit 3 erfolgreich dann auch.
		if (this.currentStep === 2 || this.currentStep === 3 ||
			(this.currentStep === 4 && this.hasSmartphoneOrPc)) {
			this.currentStep--;
		}

		// Wenn Schritt 4 und nur Schritt 2 erfolgreich, dann zurück zu 3
		if (this.currentStep === 4 && !this.hasSmartphoneOrPc && this.hasPhoneWithSms) {
			this.currentStep = 3;
		}

		// Wenn Schritt 4 und nur Schritt 1 erfolgreich, dann zurück zu 2
		if (this.currentStep === 4 && !this.hasSmartphoneOrPc && !this.hasPhoneWithSms && this.isCountryValid()) {
			this.currentStep = 2;
		}

		// Wenn Schritt 4 und gar kein Schritt erfolgreich, dann zurück zu 1
		if (this.currentStep === 4 && !this.hasSmartphoneOrPc && !this.hasPhoneWithSms && !this.isCountryValid()) {
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
			nr = 4;
		}

		// Zur letzten Seite, wenn kein SMS fähiges Phone vorhanden
		if (nr === 3 && !this.hasPhoneWithSms) {
			nr = 4;
		}

		// Nur wenn alle Voraussetzungen erüllt, kann der Benutzer digital onboarden
		this.userCanOnboard = nr === 4 && this.isCountryValid() && this.hasPhoneWithSms && this.hasSmartphoneOrPc;

		this.currentStep = nr;
	}

	public getUserMailToLink(): string {
		return 'mailTo:benutzer-admin@bar.admin.ch';
	}

	public getUserMail(): string {
		return 'benutzer-admin@bar.admin.ch';
	}

	private isCountryValid(): boolean {
		return this.selectedCountry !== '0' || this.selectedId !== '0';
	}
}
