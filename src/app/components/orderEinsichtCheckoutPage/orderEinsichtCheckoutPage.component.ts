import {Component, OnInit} from '@angular/core';
import {Ordering, ShippingType, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {AuthorizationService, SeoService, ShoppingCartService, UrlService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-order-einsicht-checkout-page',
	templateUrl: 'orderEinsichtCheckoutPage.component.html',
	styleUrls: ['./orderEinsichtCheckoutPage.component.less']
})
export class
OrderEinsichtCheckoutPageComponent implements OnInit {
	public stepNr: number = 1;
	public isAsUser: boolean = false;

	constructor(private _url: UrlService,
				private _scs: ShoppingCartService,
				private _author: AuthorizationService,
				private _txt: TranslationService,
				private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Einsichtsgesuch einreichen', 'orderEinsichtCheckoutPageComponent.pageTitle'));
		this._saveShippingType();
		this.isAsUser = this._author.isAsUser();
	}

	public getBreadCrumb(): any[] {
		return [
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			},
			{
				url: this._url.getCheckoutEinsichtUrl(),
				label: this._txt.get('orderEinsichtCheckoutPage.title', 'Einsichtsgesuch einreichen')
			}
		];
	}

	public wizzardNextPage() {
		this.wizzardSetPage(this.stepNr++);
	}

	public wizzardPreviousPage() {
		this.wizzardSetPage(this.stepNr--);
	}

	public wizzardSetPage(nr: number) {
		if (this.stepNr < 0 || this.stepNr > 2) {
			return;
		}

		// Bei erfolgter Bestellung kann nicht mehr zurückgewechselt werden
		if (this.stepNr === 2) {
			return;
		}

		// Verhindern, dass man vorwärts überspringen kann
		if (nr > this.stepNr && !this.canProceed(nr - 1)) {
			return;
		}

		this.stepNr = nr;
	}

	public canProceed(stepNr: number): boolean {
		let activeOrder = this._scs.getActiveOrder();
		switch (stepNr) {
			case 1:
				return this._isStepOneFullfilled(activeOrder);
			case 2:
				return true;
			default:
				return false;
		}
	}

	private _isStepOneFullfilled(order: Ordering): boolean {
		if (_util.isEmpty(order)) {
			return false;
		}

		const isArtDerArbeitFilled = (!this.isAsUser && !_util.isEmpty(order.artDerArbeit) && order.artDerArbeit !== 0) || (this.isAsUser);
		if (!isArtDerArbeitFilled) {
			return false;
		}

		return !_util.isEmpty(order.begruendungEinsichtsgesuch) && (order.hasEigenePersonendaten ? this._author.hasMoreThenOe2Rights() : true);
	}

	private _saveShippingType() {
		let order = this._scs.getActiveOrder() as Ordering;
		if (!order) {
			order = <Ordering>{
				type: ShippingType.Einsichtsgesuch
			};
		} else {
			order.type = ShippingType.Einsichtsgesuch;
		}
		this._scs.setActiveOrder(order);
	}
}
