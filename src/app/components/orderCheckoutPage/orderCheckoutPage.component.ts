import {Component, OnInit} from '@angular/core';
import {OrderItem, TranslationService} from '@cmi/viaduc-web-core';
import {AuthorizationService, SeoService, ShoppingCartService, UrlService} from '../../modules/client/services';
import {ToastrService} from 'ngx-toastr';

@Component({
	selector: 'cmi-viaduc-order-checkout-page',
	templateUrl: 'orderCheckoutPage.component.html',
	styleUrls: ['./orderCheckoutPage.component.less']
})
export class OrderCheckoutPageComponent implements OnInit {
	public stepNr: number = 1;
	public items: OrderItem[] = [];
	public itemsThatCouldNeedReason: OrderItem[] = [];
	public skipUserPage: boolean = false;
	public skipReasonPage: boolean = false;
	public isAsUser: boolean = false;
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

	public wizzardSetPage(nr: number, isProcessView: boolean = false) {
		if (this.stepNr < 0 || this.stepNr > 5) {
			return;
		}

		// Bei erfolgter Bestellung kann nicht mehr zurückgewechselt werden
		if (this.stepNr === 5) {
			return;
		}

		// in der Prozessansicht darf man nicht nach vorne springen
		// weil die Daten über den Button validiert werden
		if (isProcessView && nr > this.stepNr) {
			return;
		}

		// Schritt 2 überspringen
		if (nr === 2 && this.skipUserPage) {
			if (this.skipReasonPage) {
				nr = 4;
			} else {
				nr = 3;
			}
		}

		// Schritt 3 überspringen
		if (nr === 3 && this.skipReasonPage) {
			nr = 4;
		}

		this.stepNr = nr;
	}

	private async _canSkipReasonPage(): Promise<boolean> {
		if (!this.isAsUser) {
			return true;
		}
		let items = await this._scs.getItemsThatCouldNeedAReason().toPromise();
		return items.length === 0;
	}

	private async _canSkipUserPage(): Promise<boolean> {
		return !this._author.isBarUser();
	}
}
