import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthorizationService, ShoppingCartService, UrlService} from '../../../services';
import {ArtDerArbeit, Ordering, ShippingType, StammdatenService, TranslationService} from '@cmi/viaduc-web-core';
import * as moment from 'moment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'cmi-viaduc-order-details-step',
	templateUrl: 'checkoutOrderDetailsStep.component.html',
	styleUrls: ['./checkoutOrderDetailsStep.component.less']
})
export class CheckoutOrderDetailsStepComponent implements OnInit {

	public isAsUser: boolean = false;
	public artDerArbeiten: ArtDerArbeit[] = [];
	public openingDays: string[];
	public invalidDateError: boolean = false;
	public form: FormGroup;

	@Output()
	public onGoBackClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();
	public nextClicked: boolean = false;

	constructor(private _scs: ShoppingCartService,
				private _stm: StammdatenService,
				private _author: AuthorizationService,
				private _formBuilder: FormBuilder,
				private _url: UrlService,
				private _txt: TranslationService) {
	}

	public ngOnInit(): void {
		let ordering = this._scs.getActiveOrder() || <Ordering>{};
		this.isAsUser = this._author.isAsUser();

		this.form = this._formBuilder.group({
			artDerArbeitDropdown: [ordering.artDerArbeit || undefined, this.isAsUser ? null : Validators.required],
			konsultierungsDatum: [ordering.lesesaalDate ? moment(ordering.lesesaalDate).format('DD.MM.YYYY') : null,
				ordering.type === ShippingType.Lesesaalausleihen ? Validators.required : null],
			bemerkungBestellung: [ordering.comment, null],
			termsofUse: [ordering.termsAccepted, Validators.requiredTrue]
		});

		this.openingDays = this._scs.getOpeningDays();

		this._stm.getArtDerArbeiten().subscribe(ada => {
			this.artDerArbeiten = ada;
		});
		this.openingDays = this._scs.getOpeningDays();
	}

	public isLesesaalOrdering(): boolean {
		return this._scs.isLesesaalOrdering();
	}

	private _getLesesaalDate(): Date {
		let lesesaalCtrl = this.form.controls.konsultierungsDatum;
		if (!lesesaalCtrl || !lesesaalCtrl.value || lesesaalCtrl.value.length < 6) {
			return null;
		}

		const m = moment(lesesaalCtrl.value, 'DD.MM.YYYY');
		return m.isValid() ? m.toDate() : null;
	}

	public validateDate(e: any) {
		const hasValue = e && e.target && e.target.value;
		this.invalidDateError = hasValue && !this._scs.isValidLesesaalDate(e.target.value);
	}

	private _saveActiveOrder() {
		let order = this._scs.getActiveOrder();
		order.lesesaalDate = this._getLesesaalDate();
		order.artDerArbeit = (this.form.controls.artDerArbeitDropdown || <any>{}).value;
		order.comment = this.form.controls.bemerkungBestellung.value;
		order.termsAccepted = this.form.controls.termsofUse.value;
		this._scs.setActiveOrder(order);
	}

	public validateFields() {
		this.nextClicked = true;
		if (this.form.invalid || this.invalidDateError) {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.controls[field];
				control.markAsTouched({ onlySelf: true });
			});
			return;
		}

		this._saveActiveOrder();
		this.onNextClicked.emit();
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
}
