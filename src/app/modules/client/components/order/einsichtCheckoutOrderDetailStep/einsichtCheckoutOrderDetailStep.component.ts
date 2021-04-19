import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthorizationService, ShoppingCartService, UrlService} from '../../../services';
import {ArtDerArbeit, Ordering, ShippingType, StammdatenService, TranslationService} from '@cmi/viaduc-web-core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'cmi-viaduc-einsicht-order-details-step',
	templateUrl: 'einsichtCheckoutOrderDetailStep.component.html',
	styleUrls: ['einsichtCheckoutOrderDetailStep.component.less']
})
export class EisichtCheckoutOrderDetailsStepComponent implements OnInit {
	public artDerArbeiten: ArtDerArbeit[] = [];
	public isAsUser: boolean = false;
	public form: FormGroup;
	public nextClicked: boolean = false;
	public identifizierungsText: string;

	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();

	constructor(private _scs: ShoppingCartService,
				private _stm: StammdatenService,
				private _formBuilder: FormBuilder,
				private _txt: TranslationService,
				private _url: UrlService,
				private _author: AuthorizationService) {
	}

	public ngOnInit(): void {
		this.translateIdentifizierungsText();
		this.isAsUser = this._author.isAsUser();

		this.form = this._formBuilder.group({
			artDerArbeit: [null, this.isAsUser ? null : Validators.required],
			personenbezogeneNachforschung: [null, Validators.required],
			begruendungEinsichtsgesuch: [null, Validators.required],
			hasEigenePersonendaten: [null, Validators.required]
		});

		let activeOrder = this._scs.getActiveOrder();
		if (activeOrder) {
			this.form.patchValue({
				artDerArbeit: activeOrder.artDerArbeit,
				personenbezogeneNachforschung: activeOrder.personenbezogeneNachforschung,
				begruendungEinsichtsgesuch: activeOrder.begruendungEinsichtsgesuch,
				hasEigenePersonendaten: activeOrder.hasEigenePersonendaten
			});
		}

		this._stm.getArtDerArbeiten().subscribe(ada => {
			this.artDerArbeiten = ada;
		});
	}

	public HasEigenePersonendatenAndLowerThenOe3Rights(): boolean {
		return this.form.controls.hasEigenePersonendaten.value && !this._author.hasMoreThenOe2Rights();
	}

	private saveShippingType() {
		let order = this._scs.getActiveOrder();
		if (!order) {
			order = <Ordering> {};
		}

		order.type = ShippingType.Einsichtsgesuch;
		order.artDerArbeit = this.form.controls.artDerArbeit.value;
		order.personenbezogeneNachforschung = this.form.controls.personenbezogeneNachforschung.value;
		order.begruendungEinsichtsgesuch = this.form.controls.begruendungEinsichtsgesuch.value;
		order.hasEigenePersonendaten = this.form.controls.hasEigenePersonendaten.value;

		this._scs.setActiveOrder(order);
	}

	public validateFields() {
		// If user is Ö2 and has Eigene Personendaten he is not allowed to place an order
		if (this.HasEigenePersonendatenAndLowerThenOe3Rights()) {
			return;
		}

		this.nextClicked = true;
		if (this.form.invalid) {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.controls[field];
				control.markAsTouched({ onlySelf: true });
			});
			return;
		}

		this.saveShippingType();
		this.onNextClicked.emit();
	}

	private translateIdentifizierungsText() {
		const url = this._url.getAccountUrl() + '#identifiedUser';
		const text = this._txt.translate('Um ein Auskunftsgesuch einzureichen, müssen Sie sich zuerst identifizieren. Die Identifizierung können Sie im ' +
		'Benutzungskonto <a href="#{0}" target="_blank" rel="noopener">Identifizierungsfunktion</a> beantragen.',
			'einsichtCheckoutOrderDetailsStep.identifizierung', url);
		this.identifizierungsText = text;
	}
}
