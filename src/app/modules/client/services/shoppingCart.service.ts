
import {of as observableOf, from as observableFrom, Observable} from 'rxjs';
import { AuthorizationService } from './authorization.service';
import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {ToastrService} from 'ngx-toastr';
import {catchError, flatMap, map, tap} from 'rxjs/operators';
import {
	ClientContext,
	ConfigService,
	CoreOptions,
	Entity,
	HttpService,
	Ordering,
	OrderItem,
	SelfMadeOrderItem,
	ShippingType,
	TranslationService,
	BooleanResponse
} from '@cmi/viaduc-web-core';
import {Router} from '@angular/router';
import {UrlService} from './url.service';
import * as moment from 'moment';
import {Moment} from 'moment';
import {HttpErrorResponse} from '@angular/common/http';
import { SearchService } from './search.service';
import {KontingentResult} from '../model';

@Injectable()
export class ShoppingCartService {
	private activeOrder: Ordering;
	private _apiUrl: string;

	private _totalItemsInCart: number = 0;
	private _openingDays: Moment[];
	private _isAddingNewItem: boolean = false;

	constructor(private _toastr: ToastrService,
				private _context: ClientContext,
				private _authentication: AuthenticationService,
				private _authorization: AuthorizationService,
				private _router: Router,
				private _http: HttpService,
				private _url: UrlService,
				private _options: CoreOptions,
				private _cfg: ConfigService,
				private _txt: TranslationService,
				private _searchService: SearchService) {
		this._apiUrl = this._options.serverUrl + this._options.privatePort + '/api/Order';
		this.refreshItemsCount();
	}

	public canDownload(ve: Entity): boolean {
		return this.downloadPossible(ve) && ve.isDownloadAllowed;
	}

	public downloadPossible(ve:Entity): boolean {
		return !!ve.primaryDataLink && ve.primaryDataLink.length > 0;
	}

	public getKontingent(forUserId: string = ''): Observable<KontingentResult> {
		const url = `${this._apiUrl}/GetKontingent?forUserId=${forUserId}`;
		return this._http.get<KontingentResult>(url);
	}

	public isOe2WithEinsichtsgesuch(ve:Entity, signatur?:string): Observable<BooleanResponse> {
		let retVal = false;
		if (this._authorization.hasRole('Ö2')) {
			if (ve && ve.primaryDataDownloadAccessTokens) {
				retVal = ve.primaryDataDownloadAccessTokens.indexOf(`EB_${this._context.currentSession.userExtId}`) >= 0;
			} else {
				return observableFrom(this._searchService.hasCurrentOe2UserEinsichtsgesuchForSignatur(signatur));
			}
		}

		return observableOf(new BooleanResponse(retVal));
	}

	public refreshItemsCount() {
		this.getTotalItemsInCartFromServer().subscribe((data) => {
			this._totalItemsInCart = data;
		});
	}

	public getBasket(): Observable<OrderItem[]> {
		const url = `${this._apiUrl}/GetBasket`;
		return this._http.get<OrderItem[]>(url).pipe(
			tap((data) => this._totalItemsInCart = data.length)
		);
	}

	public getOrderableItems(): Observable<OrderItem[]> {
		let basket = this.getBasket();
		return basket.pipe(map(items => items.filter(i => !i.einsichtsbewilligungNotwendig)));
	}

	public getItemsWhereEinsichtsGesuchNoeting(): Observable<OrderItem[]> {
		let basket = this.getBasket();
		return basket.pipe(map(items => items.filter(i => i.einsichtsbewilligungNotwendig)));
	}

	public removeFromCart(id: string): Observable<any> {
		const url = `${this._apiUrl}/RemoveFromBasket?orderItemId=${id}`;
		return this._http.post(url, null).pipe(tap(() => this._totalItemsInCart--));
	}

	public get totalItemsInCart(): number {
		return this._totalItemsInCart;
	}

	public getTotalItemsInCartFromServer(): Observable<number> {
		if (!this._context.authenticated) {
			return observableOf(0);
		}

		return this.getBasket().pipe(map((data) => {
			return data.length;
		}));
	}

	public order(order: Ordering): Observable<void> {
		const url = `${this._apiUrl}/Order`;

		return this._http.post(url, order).pipe(flatMap((data) => {
			return this.getTotalItemsInCartFromServer().pipe(map(nr => {
				this._totalItemsInCart = nr;
				this.activeOrder = null;
			}));
		}));
	}

	public orderEinsichtsgesuch(order: Ordering): Observable<void> {
		const url = `${this._apiUrl}/OrderEinsichtsgesuch`;
		return this._http.post(url, order).pipe(flatMap((data) => {
			return this.getTotalItemsInCartFromServer().pipe(map(nr => {
				this._totalItemsInCart = nr;
				this.activeOrder = null;
			}));
		}));
	}

	public async addManuallyToCart(selfMadeItem: SelfMadeOrderItem): Promise<OrderItem> {
		if (!this._context.authenticated) {
			this._showNotLoggedInToast();
			return;
		}

		const url = `${this._apiUrl}/AddToBasket`;
		let newItem: OrderItem = null;
		await this._http.post<OrderItem>(url, selfMadeItem).toPromise().then((data => {
			newItem = data;
			this._totalItemsInCart++;
			this._showSuccessfullyAddedToast(selfMadeItem.title);
		}), (error) => {
			this._showErrorWhenAddingToBasket(error);
		});

		return newItem;
	}

	public addToCart(ve: Entity, signatur?:string): Observable<OrderItem> {
		if (this._isAddingNewItem) {
			return observableOf(null);
		}
		if (this.canDownload(ve)) {
			this._showDigitalAvailableToast(ve);
			return observableOf(null);
		} else if (ve.canBeOrdered === false) {
			this._showLevelValidationError();
			return observableOf(null);
		}
		if (!this._context.authenticated) {
			this._showNotLoggedInToast();
			return observableOf(null);
		}
		return this.isOe2WithEinsichtsgesuch(ve, signatur).pipe(flatMap(booleanResponse => {
			if (booleanResponse.value) {
				this._showMissingOe3RoleToast();
				return observableOf(null);
			}

			this._isAddingNewItem = true;
			let result = this.getBasket().pipe(items => {
				if (signatur !== undefined && signatur !== null) {
					return this._addUnknownToBasket(items, signatur).pipe(catchError((err: HttpErrorResponse) => {
						this._catchAndShowAddToBasketServerErrors(err);
						return observableOf(null);
					}));
				} else {
					return this._addIndexItemToBasket(items, ve).pipe(catchError((err: HttpErrorResponse) => {
						this._catchAndShowAddToBasketServerErrors(err);
						return observableOf(null);
					}));
				}
			});
			this._isAddingNewItem = false ;
			if (result !== null) {
				return result;
			} else {
				return observableOf(null);
			}
		}));
	}

	private _catchAndShowAddToBasketServerErrors(e: HttpErrorResponse) {
		if (e.status === 409) {
			this._showLevelValidationError();
		} else {
			this._showErrorWhenAddingToBasket(e.error);
		}
	}

	private _addIndexItemToBasket(items: Observable<OrderItem[]>, ve: Entity): Observable<OrderItem> {
		const url = `${this._apiUrl}/AddToBasket?veId=${ve.archiveRecordId}`;
		return this._http.post<OrderItem>(url, null).pipe(map(newItem => {
			if (parseInt(newItem.id, 10) === 0) {
				this._showAlreadyInCartToast(ve.title);
				return null;
			} else {
				this._totalItemsInCart++;
				this._showSuccessfullyAddedToast(ve.title);
				return newItem;
			}
		}));
	}

	private _addUnknownToBasket(items: Observable<OrderItem[]>, signatur: string): Observable<OrderItem> {
		const url = `${this._apiUrl}/AddUnknowToBasket?signatur=${encodeURIComponent(signatur)}`;
		return this._http.post<OrderItem>(url, null).pipe( map (
			newItem => {
				if (parseInt(newItem.id, 10) === 0) {
					this._showAlreadyInCartToast(signatur);
					return null;
				} else {
					this._totalItemsInCart++;
					this._showSuccessfullyAddedToast(signatur);
					return newItem;
				}
			}));
	}

	public getActiveOrder(): Ordering {
		return this.activeOrder;
	}

	public isLesesaalOrdering(): boolean {
		return this.activeOrder && this.activeOrder.type === ShippingType.Lesesaalausleihen;
	}

	public isValidLesesaalDate(dt: string | Date) {
		if (!this._openingDays) {
			this._openingDays = this.getOpeningDays().map(d => moment(d, 'DD.MM.YYYY'));
		}

		const days  = this._openingDays.filter(m => {
			return m.isSame(moment(dt, 'DD.MM.YYYY'), 'day');
		}).length;

		return !this.isLesesaalOrdering || (days > 0);
	}

	public getOpeningDays(): string[] {
		let days = this._cfg.getSetting('managementClientSettings.openingDaysLesesaal');
		if (days && days !== '') {
			return days.split(';');
		}
		return [];
	}

	public getOrderings(): Observable<Ordering[]> {
		const url = `${this._apiUrl}/GetOrderings`;
		return this._http.get<Ordering[]>(url);
	}

	public setActiveOrder(order: Ordering) {
		this.activeOrder = order;
	}

	public setReason(orderItem: OrderItem, reason: number): Observable<any> {
		const url = `${this._apiUrl}/UpdateReason?orderItemId=${orderItem.id}&reason=${reason}&hasPersonendaten=${orderItem.hasPersonendaten}`;
		return this._http.post(url, null);
	}

	public setComment(orderItem: OrderItem): Observable<any> {
		const url = `${this._apiUrl}/UpdateComment?orderItemId=${orderItem.id}&comment=${encodeURIComponent(orderItem.comment)}`;
		return this._http.post(url, null);
	}

	public updateBewilligungsDatum(orderItem: OrderItem): Observable<any> {
		const url = `${this._apiUrl}/UpdateBewilligungsDatum?orderItemId=${orderItem.id}&bewilligung=${orderItem.bewilligungsDatum}`;
		return this._http.post(url, null);
	}

	public getItemsThatCouldNeedAReason(): Observable<OrderItem[]> {
		return this.getOrderableItems().pipe(map(items => items.filter(i => i.couldNeedAReason && !i.einsichtsbewilligungNotwendig)));
	}

	public getShowDigitizationWarningSetting(): boolean {
		return this._cfg.getSetting('managementClientSettings.showWarningOnDigitalDeliveryType', true);
	}

	private _showSuccessfullyAddedToast(title: string) {
		let successMessage = this._txt.translate('{0} wurde erfolgreich dem Bestellkorb hinzugefügt.', 'simpleHit.addedToBasketText', title);
		let successTitle = this._txt.translate('Im Bestellkorb', 'simpleHit.addedToBasketTitle');
		this._toastr.success(successMessage, successTitle);
	}

	private _showAlreadyInCartToast(title: string) {
		let message = this._txt.translate('{0} ist bereits schon im Bestellkorb vorhanden.', 'simpleHit.alreadyAddedToBasketText', title);
		let titleWarning = this._txt.translate('Bereits hinzugefügt', 'simpleHit.alreadyAddedToBasketTitle');
		this._toastr.warning(message, titleWarning);
	}

	private _showDigitalAvailableToast(ve: Entity) {
		let message = this._txt.translate('Dieses Dossier liegt bereits digital vor. Sie können es hier anschauen oder herunterladen.', 'simpleHit.digitalAvailableText');
		let title = this._txt.translate('Digital verfügbar', 'simpleHit.digitalAvailableTitle');
		let t = this._toastr.info(message, title);

		t.onTap.subscribe(() => {
			this._router.navigateByUrl(this._url.getDetailUrl(ve.archiveRecordId));
		});
	}

	private _showLevelValidationError() {
		let title = this._txt.get('simpleHit.failedBecauseOfLevelTitle', 'Bestellen fehlgeschlagen');
		let message = this._txt.get('simpleHit.failedBecauseOfLevelMessage',
			'Diese Verzeichnungseinheit ist nicht bestellbar. Bei Fragen wenden Sie sich bitte an die Beratung oder an bestellen@bar.admin.ch.');

		this._toastr.error(message, title);
	}

	private _showErrorWhenAddingToBasket(error: any) {
		let message = this._txt.translate('Beim Hinzufügen in den Bestellkorb gab es einen Fehler.', 'simpleHit.failedAddToBasketText') + ' ' + error;
		let title = this._txt.translate('Fehler', 'simpleHit.failedAddToBasketTitle');

		this._toastr.error(message, title);
	}

	private _showNotLoggedInToast() {
		let message = this._txt.translate('Bitte melden Sie sich an, um den Bestellkorb nutzen zu können.', 'simpleHit.loginToUseBasketText');
		let title = this._txt.translate('Jetzt anmelden', 'simpleHit.loginToUsebasketTitle');

		let t = this._toastr.warning(message, title);
		t.onTap.subscribe(() => {
			this._authentication.login();
		});
	}

	private _showMissingOe3RoleToast() {
		let message = this._txt.translate('Um Unterlagen mit einer Einsichtsbewilligung bestellen zu können, ist der Benutzerstatus «identifizierter Benutzer» notwendig.' +
			' Um zum Identifizierungsprozess zu gelangen, klicken Sie bitte auf diese Meldung.', 'simpleHit.oe3RoleRequired');
		let title = this._txt.translate('Bestellung nicht möglich', 'simpleHit.oe3RoleRequiredTitle');

		let t = this._toastr.warning(message, title, {disableTimeOut: true, closeButton: true});
		t.onTap.subscribe(() => {
			this._router.navigate([this._url.getAccountUrl()], {fragment: 'identifiedUser'});
		});
	}
}
