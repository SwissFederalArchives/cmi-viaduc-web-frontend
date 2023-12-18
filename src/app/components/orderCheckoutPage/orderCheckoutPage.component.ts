import {Component, OnInit} from '@angular/core';
import {OrderItem, ShippingType, TranslationService} from '@cmi/viaduc-web-core';
import {AuthorizationService, SeoService, ShoppingCartService, UrlService} from '../../modules/client/services';
import {ToastrService} from 'ngx-toastr';

@Component({
	selector: 'cmi-viaduc-order-checkout-page',
	templateUrl: 'orderCheckoutPage.component.html',
	styleUrls: ['./orderCheckoutPage.component.less']
})
export class OrderCheckoutPageComponent implements OnInit {
	public stepNr = 1;
	public items: OrderItem[] = [];
	public itemsThatCouldNeedReason: OrderItem[] = [];
	public skipUserPage = false;
	public skipReservationPage = false;
	public skipReasonPage = false;

	public isAsUser = false;
	public crumbs: any[] = [];

	constructor(private _url: UrlService,
				private _scs: ShoppingCartService,
				private _author: AuthorizationService,
				private _txt: TranslationService,
				private _seoService: SeoService,
				private _toastr: ToastrService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Bestellung', 'orderCheckoutPageComponent.pageTitle'));
		this.crumbs = this.getBreadCrumb();
		this._scs.getOrderableItems().subscribe((data) => this.items = data);
		this.isAsUser = this._author.isAsUser();

		this._canSkipReasonPage().then(value => this.skipReasonPage = value)
			.then(() => {
				if (!this.skipReasonPage) {
					this._scs.getItemsThatCouldNeedAReason().subscribe(
						value => {
							this.itemsThatCouldNeedReason = value;
						}, (reason => this._toastr.error(reason)));
				}
			});
		this._canSkipUserPage().then(value => this.skipUserPage = value);
	}

	public isLesesaalOrdering(): boolean {
		return this._scs.isLesesaalOrdering();
	}


	public getBreadCrumb(): any[] {
		return [
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			},
			{url: this._url.getOrderCheckoutUrl(), label: this._txt.get('orderCheckoutPage.title', 'Bestellen')}
		];
	}

	public wizzardNextPage() {
		this.wizzardSetPage(this.stepNr + 1);
	}

	public wizzardPreviousPage() {
		if (this.stepNr === 4 && this.skipReasonPage) {
			this.stepNr = 3;
		}

		if (this.stepNr === 3 && this.skipUserPage) {
			this.stepNr = 2;
		}

		this.wizzardSetPage(this.stepNr - 1);
	}

	public wizzardSetPage(nr: number, isProcessView = false) {

		if (this.stepNr < 0 || this.stepNr > 6) {
			return;
		}

		// Bei erfolgter Bestellung kann nicht mehr zurückgewechselt werden
		if (this.stepNr === 6) {
			return;
		}

		// in der Prozessansicht darf man nicht nach vorne springen
		// weil die Daten über den Button validiert werden
		if (isProcessView && nr > this.stepNr) {
			return;
		}

		// Schritt 2 überspringen
		if (nr === 2 && this.skipUserPage) {
				nr = 3;
		}

		// Schritt 3 überspringen
		if (nr === 3 && this.skipReasonPage) {
			nr = 4;
		}

		// Schritt 5 überspringen
		if (nr === 5 && !this.isLesesaalOrdering()) {
				nr = 6;
		}

		this.stepNr = nr;
	}

	private async _canSkipReasonPage(): Promise<boolean> {
		if (!this.isAsUser) {
			return true;
		}
		const items = await this._scs.getItemsThatCouldNeedAReason().toPromise();
		return items.length === 0;
	}

	private async _canSkipUserPage(): Promise<boolean> {
		return !this._author.isBarUser();
	}

	public onOrdertypeChanged($event: ShippingType) {
		this.skipReservationPage =  $event && ($event === ShippingType.Verwaltungsausleihe ||  $event === ShippingType.Digitalisierungsauftrag);
	}
}




