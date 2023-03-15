import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthorizationService, ShoppingCartService, UrlService} from '../../../services';
import {ArtDerArbeit, ClientContext, Ordering, ShippingType, StammdatenService, TranslationService} from '@cmi/viaduc-web-core';
import moment from 'moment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {German} from 'flatpickr/dist/l10n/de';
import {French} from 'flatpickr/dist/l10n/fr';
import flatpickr from 'flatpickr';
import {Italian} from 'flatpickr/dist/l10n/it';
import { FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';

@Component({
	selector: 'cmi-viaduc-order-details-step',
	templateUrl: 'checkoutOrderDetailsStep.component.html',
	styleUrls: ['./checkoutOrderDetailsStep.component.less']
})
export class CheckoutOrderDetailsStepComponent implements OnInit {
	public isAsUser = false;
	public artDerArbeiten: ArtDerArbeit[] = [];
	public openingDays: string[];
	public form: FormGroup;
	public minimumDate = new Date();

	@Output()
	public onGoBackClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();
	public nextClicked = false;

	constructor(private _context: ClientContext,
				private _scs: ShoppingCartService,
				private _stm: StammdatenService,
				private _author: AuthorizationService,
				private _formBuilder: FormBuilder,
				private _url: UrlService,
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

	public ngOnInit(): void {
		const ordering = this._scs.getActiveOrder() || <Ordering>{};
		this.isAsUser = this._author.isAsUser();
		this.form = this._formBuilder.group({
			artDerArbeitDropdown: [ordering.artDerArbeit || undefined, this.isAsUser ? null : Validators.required],
			konsultierungsDatum:  new FormControl (null,
				ordering.type === ShippingType.Lesesaalausleihen ?
					[Validators.required, this.dateValueValidator.bind(this)] : null),
			bemerkungBestellung: [ordering.comment, null],
			termsofUse: [ordering.termsAccepted, Validators.requiredTrue]
		});

		this._stm.getArtDerArbeiten().subscribe(ada => {
			this.artDerArbeiten = ada;
		});
		this.openingDays = this._scs.getOpeningDays();
	}

	public isLesesaalOrdering(): boolean {
		return this._scs.isLesesaalOrdering();
	}

	private _getLesesaalDate(): Date {
		const lesesaalCtrl = this.form.controls.konsultierungsDatum;
		if (!lesesaalCtrl || !lesesaalCtrl.value || lesesaalCtrl.value.length < 6) {
			return null;
		}
		const m = moment(lesesaalCtrl.value, 'DD.MM.YYYY');
		return m.isValid() ? m.toDate() : null;
	}


	private _saveActiveOrder() {
		const order = this._scs.getActiveOrder();
		order.lesesaalDate = this._getLesesaalDate();
		order.artDerArbeit = (this.form.controls.artDerArbeitDropdown || <any>{}).value;
		order.comment = this.form.controls.bemerkungBestellung.value;
		order.termsAccepted = this.form.controls.termsofUse.value;
		this._scs.setActiveOrder(order);
	}

	public validateFields() {
		this.nextClicked = true;
		// the dates written in by hand cannot be valid
		if (this.form.invalid) {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.controls[field];
				control.markAsTouched({ onlySelf: true });
			});
			return;
		}

		this._saveActiveOrder();
		this.onNextClicked.emit();
	}

	public dateValueValidator(control: FormControl): any | null {
		if (this._scs.isValidLesesaalDate(control.value)){
			return null;
		}

		// return error object
		return {'invalidDateValue': {'value': control.value}};
	}

	public goBack() {
		this._saveActiveOrder();
		this.onGoBackClicked.emit();
	}

	public getNutzungsbestimmungenUrl(): string {
		return this._txt.translate('Ich habe die <a href="#/{0}" target="_blank" rel="noopener">Nutzungsbestimmungen</a> gelesen und erkläre mich damit einverstanden',
			'file.termsofUse',
			this._url.getNutzungsbestimmungenUrl());
	}

	public dataPickerValueUpdate($event: FlatPickrOutputOptions) {
		if ($event.dateString === ''){
			this.form.controls.konsultierungsDatum.setValue(null);
		}
	}
}
