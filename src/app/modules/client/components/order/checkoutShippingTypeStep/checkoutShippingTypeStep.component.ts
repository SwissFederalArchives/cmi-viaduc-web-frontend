import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ShoppingCartService} from '../../../services/shoppingCart.service';
import {AuthorizationService} from '../../../services/authorization.service';
import {Ordering, OrderItem, ShippingType, ConfigService} from '@cmi/viaduc-web-core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {KontingentResult, OrderCreationRequest} from '../../../model';

@Component({
	selector: 'cmi-viaduc-shipping-type-step',
	templateUrl: 'checkoutShippingTypeStep.component.html',
	styleUrls: ['./checkoutShippingTypeStep.component.less']
})
export class CheckoutShippingTypeStepComponent implements OnInit {

	public liefertypAmtText: string;
	public liefertypDigitalText: string;
	public liefertypLesesaalText: string;
	public cartCount: number = 0;
	public ShippingType = ShippingType;
	public isAsOrBvwUser: boolean = false;
	public showDigitizationWarning: boolean;
	public digitalisatBestellungMoeglich = false;
	public showDigitalisationNichtMoeglichHint = false;
	public willExceedKontingent = false;
	public loading = true;
	public showLoading: boolean = false;

	public items: OrderItem[] = [];
	public form: FormGroup;
	public nextClicked: boolean = false;
	public kontingentResult: KontingentResult;
	public digitalisationItemsToOrder: OrderItem[] = [];

	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();

	constructor(private _scs: ShoppingCartService,
				private _cfg: ConfigService,
				private _formBuilder: FormBuilder,
				private _author: AuthorizationService) {
	}

	public async ngOnInit(): Promise<void> {
		this.cartCount = this._scs.totalItemsInCart;
		this.form = this._formBuilder.group({
			shippingType: [null, Validators.required]
		});

		this.liefertypAmtText = this._cfg.getSetting('frontendDynamicTextSettings.deliveryTypeCommission', 'ins <strong>Amt</strong> bestellen (Lieferfrist: ein bis zwei Arbeitstage)');

		this.liefertypDigitalText = this._cfg.getSetting('frontendDynamicTextSettings.deliveryTypeDigital',
		'<strong>digital</strong> erhalten. Sie erhalten das digitalisierte Dossier in rund 30 Tagen. Alles Weitere zur Digitalisierung finden Sie unter ' +
		'<a href=\"https://www.recherche.bar.admin.ch/recherche/#/de/informationen/bestellen-und-konsultieren\" target=\"_blank\" rel=\"noopener noreferrer\">Bestellen und Konsultieren</a>.');

		this.liefertypLesesaalText = this._cfg.getSetting('frontendDynamicTextSettings.deliveryTypeReadingRoom',
		'zur Konsultation in den <strong>Lesesaal</strong> bestellen. Bestellen Sie 24 Stunden im Voraus, ' +
		'damit Ihnen die Unterlagen am gewünschten Tag zur Verfügung stehen (Dienstag, Mittwoch und Donnerstag).');

		this.isAsOrBvwUser = this._author.isAsUser() || this._author.isBvwUser();
		let activeOrder = this._scs.getActiveOrder();
		if (activeOrder) {
			this.form.patchValue({
				shippingType: activeOrder.type
			});
		} else {
			this.form.patchValue({
				shippingType: ShippingType.Lesesaalausleihen
			});
		}

		this.showDigitizationWarning = this._scs.getShowDigitizationWarningSetting();

		this.form.controls.shippingType.valueChanges.subscribe(async val => {
			await this._resetActiveOrder();
		});
	}

	public get shippingType(): ShippingType {
		return this.form.controls.shippingType.value;
	}

	private async _resetActiveOrder(): Promise<void> {
		let order = this._scs.getActiveOrder();
		if (order) {
			order = <Ordering>{
				type: this.form.controls.shippingType.value
			};
			this._scs.setActiveOrder(order);
		}

		if (this.form.controls.shippingType.value === ShippingType.Digitalisierungsauftrag) {
			await this.CheckKontingent();
		}
	}

	private async CheckKontingent() {
		this.loading = true;
		this._delayShowLoading();
		this.digitalisatBestellungMoeglich = true;
		this.willExceedKontingent = false;
		this.showDigitalisationNichtMoeglichHint = false;

		this.items = await this._scs.getOrderableItems().toPromise();
		this._scs.getKontingent().subscribe(res => {
			this.kontingentResult = res;
			if (res.bestellkontingent > 0) {
				this.digitalisatBestellungMoeglich = true;
				this.showDigitalisationNichtMoeglichHint = false;
				this.willExceedKontingent = (res.bestellkontingent - this.items.length) < 0;
				if (this.willExceedKontingent) {
					this.digitalisationItemsToOrder = [];
				}
			} else {
				this.digitalisatBestellungMoeglich = false;
				this.showDigitalisationNichtMoeglichHint = true;
				this.willExceedKontingent = false;
			}
		}, () => {
		}, () => {
			this.loading = false;
		});
	}

	public get isNextButtonDisabled(): boolean {
		let isDigitalisierungsAuftrag = (this.form
			&& this.form.controls.shippingType
			&& this.form.controls.shippingType.value === ShippingType.Digitalisierungsauftrag);

		if (!isDigitalisierungsAuftrag) {
			return false;
		}

		if (this.loading) {
			return true;
		}

		// Benutzer darf nicht alle abwählen
		let excludedAll = this.digitalisationItemsToOrder.length === 0;
		return isDigitalisierungsAuftrag && (!this.digitalisatBestellungMoeglich || (this.exceedsKontingent()) || this.willExceedKontingent && excludedAll);
	}

	private _delayShowLoading() {
		setTimeout(() => {
			if (this.loading) {
				this.showLoading = true;
				let interval = setInterval(() => {
					if (!this.loading) {
						this.showLoading = false;
						clearInterval(interval);
					}
				}, 500);
			} else {
				this.showLoading = false;
			}
		}, 1000);
	}

	private exceedsKontingent() {
		return this.willExceedKontingent && this.digitalisationItemsToOrder.length > this.kontingentResult.bestellkontingent;
	}

	private saveShippingType() {
		let order = this._scs.getActiveOrder() as OrderCreationRequest;
		if (!order) {
			order = <OrderCreationRequest>{
				type: this.form.controls.shippingType.value
			};
		} else {
			order.type = this.form.controls.shippingType.value;
		}
		if (order.type === ShippingType.Digitalisierungsauftrag && this.willExceedKontingent) {
			order.orderIdsToExclude = this.items.filter(i => this.digitalisationItemsToOrder.indexOf(i) < 0).map(i => parseInt(i.id, 10));
		}
		this._scs.setActiveOrder(order);
	}

	public validateFields() {
		if (this.isNextButtonDisabled) {
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

	public updateDigitalisationSelection(event: Event, item: OrderItem) {
		let index = this.digitalisationItemsToOrder.indexOf(item);
		if (index >= 0) {
			this.digitalisationItemsToOrder.splice(index, 1);
		} else {
			if (this.digitalisationItemsToOrder.length >= this.kontingentResult.bestellkontingent) {
				event.preventDefault();
				return;
			}
			this.digitalisationItemsToOrder.push(item);
		}
	}

	public isSelected(item: OrderItem) {
		return this.digitalisationItemsToOrder.indexOf(item) >= 0;
	}
}
