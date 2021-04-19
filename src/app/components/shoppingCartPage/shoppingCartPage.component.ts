import {Component, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {
	Entity,
	OrderItem,
	SearchField, SelfMadeOrderItem, TranslationService, UiService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {Router} from '@angular/router';
import {EntityService, SearchService, SeoService, ShoppingCartService, UrlService} from '../../modules/client/services';
import {tap} from 'rxjs/operators';
import { DateRangeFieldComponent } from '../../modules/client';

@Component({
	selector: 'cmi-viaduc-shopping-cart-page',
	templateUrl: 'shoppingCartPage.component.html',
	styleUrls: ['./shoppingCartPage.component.less']
})
export class ShoppingCartPageComponent implements OnInit {

	@ViewChild('zeitraumDossier', { static: false})
	private zeitraumDossier: DateRangeFieldComponent;

	public manualAddSectionVisible = false;
	public itemsWhereEinsichtsGesuchNoetig: OrderItem[] = [];
	public orderableItems: OrderItem[] = [];
	public collapseLinkCss: string;
	public collapseDivCss: string;

	public signatureToSearch: string;

	public timeSpanField = <SearchField>{key: 'timespan', value: null};
	public teilBestand: string;
	public ablieferung: string;
	public behaeltnisNr: string;
	public archivNr: string;
	public aktenzeichen: string;
	public dossierTitel: string;

	constructor(private _url: UrlService,
				private _scs: ShoppingCartService,
				private _toastr: ToastrService,
				private _router: Router,
				private _ui: UiService,
				private _ent: EntityService,
				private _searchService: SearchService,
				private _txt: TranslationService,
				private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Bestellkorb', 'shoppingCartPageComponent.pageTitle'));
		this.setCss();
		this.updateLists();
	}

	public setCss() {
		this.collapseDivCss = this.manualAddSectionVisible ? 'collapse in' : 'collapse';
		this.collapseLinkCss = this.manualAddSectionVisible ? 'active icon icon--before icon--root' : 'icon icon--before icon--greater collapsed';
	}

	public hasItemsInCart() {
		return this.orderableItems.length > 0 || this.itemsWhereEinsichtsGesuchNoetig.length > 0;
	}

	public toggleManualAddSectionVisibility() {
		this.manualAddSectionVisible = !this.manualAddSectionVisible;
		this.setCss();
	}

	public updateLists() {
		this._scs.getBasket().subscribe((data) => {
			this.orderableItems = data.filter(i => !i.einsichtsbewilligungNotwendig);
			this.itemsWhereEinsichtsGesuchNoetig = data.filter(i => i.einsichtsbewilligungNotwendig);
		});
	}

	public goToCheckout() {
		this._router.navigate([this._url.getCheckutUrl()]);
	}

	public goToCheckoutEinsicht() {
		this._router.navigate([this._url.getCheckoutEinsichtUrl()]);
	}

	public async addBySignature() {
		if (_util.isEmpty(this.signatureToSearch)) {
			return;
		}

		let signaturesString = this.signatureToSearch.replace(/\n/g, ';');
		let signatures = signaturesString.split(';').map(s => s.trim());

		for (let signatureToSearch of signatures) {
			if (_util.isEmpty(signatureToSearch)) {
				continue;
			}
			try {
				await this._searchAndAddSignature(signatureToSearch);
			} catch (e) {
				this._ui.showError(e);
			}
		}
	}

	private async _searchAndAddSignature(signatureToSearch: string) {
		let archiveRecordId = await this._searchService.searchBySignatur(signatureToSearch);
		if (!archiveRecordId || _util.isEmpty(archiveRecordId)) {
			this._showNotFoundToast();
			return;
		}

		let fullItem = await this._ent.get(archiveRecordId);
		if (!fullItem) {
			// PV-1139: user darf VE nicht sehen, daher wird ein '[nicht sichtbar]' Einsichtsgesuch in den Bestellkorb gelegt
			fullItem = <Entity> {
				archiveRecordId: archiveRecordId,
				referenceCode: signatureToSearch
			};
		} else {
			signatureToSearch = null;
		}

		return this._scs.addToCart(fullItem, signatureToSearch).pipe(tap((data) => {
			if (data) {
				if (!data.einsichtsbewilligungNotwendig) {
					this.orderableItems.push(data);
				} else {
					this.itemsWhereEinsichtsGesuchNoetig.push(data);
				}
				this.signatureToSearch = '';
			}
		})).toPromise();
	}

	private _showNotFoundToast() {
		let message = this._txt.translate('Keine Verzeichnungseinheit mit dieser Signatur gefunden', 'shoppingCartPage.veNotFound');
		let title = this._txt.translate('Nicht gefunden', 'shoppingCartPage.veNotFoundTitle');
		this._toastr.error(message, title);
	}

	public addWithoutSignature() {
		if (!this.zeitraumDossier.isValid) {
			return;
		}

		let selfmadeItem = <SelfMadeOrderItem> {
			period: this.timeSpanField.value,
			title: this.dossierTitel,
			aktenzeichen: this.aktenzeichen,
			behaeltnisNr: this.behaeltnisNr,
			archivNr: this.archivNr,
			ablieferung: this.ablieferung,
			bestand: this.teilBestand
		};

		this._scs.addManuallyToCart(selfmadeItem).then((data) => {
			if (data) {
				if (!data.einsichtsbewilligungNotwendig) {
					this.orderableItems.push(data);
				} else {
					this.itemsWhereEinsichtsGesuchNoetig.push(data);
				}
				this._clearWithoutSignatureFields();
			}
		});
	}

	private _clearWithoutSignatureFields() {
		this.teilBestand = null;
		this.ablieferung = null;
		this.behaeltnisNr = null;
		this.archivNr = null;
		this.dossierTitel = null;
		this.timeSpanField.value = null;
		this.aktenzeichen = null;
	}

	public getBreadCrumb(): any[] {
		return [
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			},
			{url: this._url.getAdvancedSearchUrl(), label: this._txt.get('breadcrumb.shoppingcart', 'Bestellkorb')}
		];
	}

	public isBehaeltnisNrAndArchivNrEmpty(): boolean {
		return _util.isEmpty(this.archivNr) && _util.isEmpty(this.behaeltnisNr);
	}
}
