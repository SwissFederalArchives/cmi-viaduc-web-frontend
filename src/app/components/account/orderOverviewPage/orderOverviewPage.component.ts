import {Component, OnInit, ViewChild} from '@angular/core';
import {
	Abbruchgrund,
	ArtDerArbeit, CmiGridComponent,
	ConfigService,
	EntityDecoratorService, EntscheidGesuchStatus, ExternalStatus,
	Ordering,
	OrderListDisplayItem,
	Reason, ShippingType,
	StammdatenService,
	TranslationService, UiService, WijmoService,
} from '@cmi/viaduc-web-core';
import {DataMap} from '@grapecity/wijmo.grid';
import {SeoService, ShoppingCartService, UrlService} from '../../../modules/client/services';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';
import {CollectionView} from '@grapecity/wijmo';
import {map} from 'rxjs/operators';

@Component({
	selector: 'cmi-viaduc-order-overview-page',
	templateUrl: 'orderOverviewPage.component.html',
	styleUrls: ['./orderOverviewPage.component.less']
})
export class OrderOverviewPage implements OnInit {
	public loading: boolean;
	public crumbs: any[] = [];
	public orderDisplayItems: CollectionView;
	public artDerArbeit: ArtDerArbeit[] = [];
	public reasons: Reason[] = [];
	public isEmptyResult = false;

	public showColumnPicker = false;
	public columns: any[] = [];
	public hiddenColumns: any[] = [];
	public visibleColumns: any[] = [];

	@ViewChild('flexGrid', { static: false })
	public flexGrid: CmiGridComponent;

	public rowCount = 0;
	public originalRowCount = 0;
	public valueFilters: any;

	constructor(private _txt: TranslationService,
				private _url: UrlService,
				private _cfg: ConfigService,
				private _dec: EntityDecoratorService,
				private _stm: StammdatenService,
				private _ui: UiService,
				private _scs: ShoppingCartService,
				private _seoService: SeoService,
				private _wjs: WijmoService,
				private _stamm: StammdatenService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Bestellübersicht', 'orderOverviewPage.pageTitle'));
		this._buildCrumbs();
		this._initTableView();
		this._createFilterMaps().then((m) => {
			this.valueFilters =	m;
		});
	}

	public translateColumns() {
		for (let col of this.columns) {
			col.defaultLabel = this._txt.translate(col.defaultLabel, 'orderOverviewPage.columnItems.' + col.key);
		}
	}

	private _initTableView() {
		console.log('_initTableView');
		this.loading = true;

		// deepcopy
		this.columns = this._cfg.getSetting('account.orderOverviewColumns').map(x => Object.assign({}, x));
		this.translateColumns();
		this.refreshHiddenVisibleColumns();

		const artDerArbeitenSub = this._stm.getArtDerArbeiten();
		const reasonSub = this._stm.getReasons();

		forkJoin([artDerArbeitenSub, reasonSub]).subscribe(vals => {
			this.artDerArbeit = vals[0];
			this.reasons = vals[1];

			this._scs.getOrderings().subscribe(orderings => {
				this.orderDisplayItems = new CollectionView(this.postProcessOrdering(orderings));
				this.rowCount = this._getRowCount();
				this.originalRowCount = this.rowCount;
				this.isEmptyResult = this.rowCount === 0;
			}, () => {
			}, () => {
				this.loading = false;
			});
		});

	}

	public onGridFilterChanged() {
		this.rowCount = this.flexGrid.rows.length;
	}

	private _buildCrumbs(): void {
		this.crumbs = [];
		this.crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		this.crumbs.push({url: this._url.getAccountUrl(), label: this._txt.get('breadcrumb.account', 'Konto')});
		this.crumbs.push({label: this._txt.get('breadcrumb.orderings', 'Bestellübersicht')
		});
	}

	private _createFilterMaps(): Promise<any> {
		let obs = forkJoin([
			this._stamm.getReasons().pipe(map((r: Reason[]) => {
				let pairs = [];
				for (const item of r) {
					pairs.push({name: item.name});
				}
				return new DataMap(pairs, 'name', 'name');
			})),
			this._stamm.getArtDerArbeiten().pipe(map((a: ArtDerArbeit[]) => {
				let pairs = [];
				for (const item of a) {
					pairs.push({name: item.name});
				}
				return new DataMap(pairs, 'name', 'name');
			}))]);

		return obs.toPromise().then(res => {
			const reasonList = res[0] as DataMap;
			const artDerArbeitList = res[1] as DataMap;

			let maps: { [id: string]: DataMap; } = {};
			maps['orderingTypeDisplay'] = this._wjs.getDataMap(ShippingType, this._dec.translateOrderingType.bind(this));
			maps['statusDisplay'] =  this._wjs.getDataMap(ExternalStatus, this._dec.translateExternalStatus.bind(this));
			maps['abbruchgrundDisplay'] =  this._wjs.getDataMap(Abbruchgrund, this._dec.translateAbbruchgrund.bind(this));
			maps['entscheidGesuchDisplay'] =  this._wjs.getDataMap(EntscheidGesuchStatus, this._dec.translateEntscheidGesuchStatus.bind(this));
			maps['artDerArbeitDisplay'] = artDerArbeitList;
			maps['orderingEinsichtsgesuchZweck'] = reasonList;

			return maps;
		});
	}

	private _getRowCount(): number {
		return this.orderDisplayItems ? this.orderDisplayItems.itemCount : 0;
	}

	public _getVisibleColumns(): any[] {
		return this.columns.filter(c => c.visible);
	}

	public _getHiddenColumns(): any [] {
		return this.columns.filter(c => !c.visible);
	}

	public showColumn(c: any) {
		this.columns.filter(col => col.key === c.key)[0].visible = true;
		this.refreshHiddenVisibleColumns();
	}

	public hideColumn(c: any) {
		this.columns.filter(col => col.key === c.key)[0].visible = false;
		this.refreshHiddenVisibleColumns();
	}

	public refreshHiddenVisibleColumns() {
		this.visibleColumns = this._getVisibleColumns();
		this.hiddenColumns = this._getHiddenColumns();
	}

	public postProcessOrdering(orderings: Ordering[]): OrderListDisplayItem[] {
		let items: OrderListDisplayItem[] = [];

		for (let ordering of orderings) {
			let orderItems = ordering.items;
			for (let item of orderItems) {
				let newItem = <OrderListDisplayItem> item;
				newItem.artDerArbeitDisplay = this.artDerArbeit.filter(a => a.id + '' === ordering.artDerArbeit + '').map(a => a.name)[0];
				newItem.orderingId = ordering.id;
				newItem.orderingComment = ordering.comment;
				newItem.orderingDate = ordering.orderDate ? moment(ordering.orderDate).toDate() : null; // Nötig damit die Spalte sich von Wijmo formatieren lässt
				newItem.statusDisplay = this._dec.translateExternalStatus(item.externalStatus);
				newItem.statusTime = ordering.orderDate ? moment(newItem.orderingDate).toDate() : null;
				newItem.orderingType = ordering.type;
				newItem.orderingLieferdatumLesesaal = ordering.lesesaalDate ? moment(ordering.lesesaalDate).toDate() : null;
				newItem.orderingTypeDisplay = this._dec.translateOrderingType(newItem.orderingType);
				newItem.enthaeltPersonendaten = item.hasPersonendaten;
				newItem.reasonDisplay = this.reasons.filter(r => r.id === item.reason).map(r => r.name)[0];
				newItem.orderingEinsichtsgesuchZweck = ordering.begruendungEinsichtsgesuch;
				newItem.entscheidGesuchDisplay = this._dec.translateEntscheidGesuchStatus(newItem.entscheidGesuch);
				newItem.abbruchgrundDisplay = this._dec.translateAbbruchgrund(newItem.abbruchgrund);
				newItem.datumDesEntscheids = newItem.datumDesEntscheids ? moment(newItem.datumDesEntscheids).toDate() : null;
				newItem.orderingPeronenbezogeneNachforschung = ordering.personenbezogeneNachforschung;
				newItem.orderingEigeneUnterlagen = ordering.hasEigenePersonendaten;
				items.push(newItem);
			}
		}
		return items;
	}

	public goToVe(item: OrderListDisplayItem) {
		return this._url.getDetailUrl(item.veId + '');
	}

	public exportExcel() {
		this.flexGrid.exportToExcel('orders_recherche.bar.ch.xlsx').subscribe(() => {
			// nothing
		}, (err) => {
			this._ui.showError(err);
		});
	}

	public resetSortsAndFilters() {
		this.flexGrid.filter.clear();
		this.flexGrid.resetGridState();
	}

	public resetView() {
		this.flexGrid.resetGridState();
		this._initTableView();
	}

	public showColumnPickerModal() {
		this.showColumnPicker = true;
	}
}
