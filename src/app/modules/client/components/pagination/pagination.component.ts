import {Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {SearchService} from '../../services/search.service';
import {ConfigService, Paging, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-pagination',
	templateUrl: 'pagination.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./pagination.component.less']
})
export class PaginationComponent implements OnInit, OnChanges {

	@Input()
	public paging: Paging;

	@Output()
	public onPaged: EventEmitter<Paging> = new EventEmitter<Paging>();

	private _elasticHitLimit;

	public pagingSize: number;
	public possiblePagingSizes: number[];

	public items: any[] = [];

	constructor(private _searchService: SearchService,
				private _txt: TranslationService,
				private _cfg: ConfigService) {
	}

	public ngOnInit(): void {
		this.pagingSize = this._cfg.getValidPagingSize();
		this.possiblePagingSizes = this._cfg.getSetting('search.possiblePagingSizes');
		this._elasticHitLimit = this._searchService.elasticHitLimit;
		this._refresh();
	}

	public ngOnChanges(changes: any) {
		this._refresh();
	}

	private _addItem(index: number, label?: string, active?: any, enabled?: any, tooltip?: string): any {
		let classes = '';

		active = (!_util.isDefined(active) || !_util.isBoolean(active))
			? (index === this.pageIndex)
			: (active === true);

		enabled = (!_util.isDefined(enabled) || !_util.isBoolean(enabled))
			? this.pageIndexIsNavigable(index)
			: (enabled === true);

		if (active) {
			classes += ' active';
			enabled = false;
		}
		if (!enabled) {
			classes += ' disabled';
		}

		if (!tooltip) {
			tooltip = active
				? this._txt.get('search.browser.pageTooltipPageXofY',
				'Sie sind auf der Seite {0} von {1}', index + 1, this.pageCount)
				: this._txt.get('search.browser.pageTooltipNextPageXofY', 'Seite {0} von {1} anzeigen', index + 1, this.pageCount);
		}

		const item = {
			index: index,
			active: active,
			label: _util.isEmpty(label) ? '' + (index + 1) : label,
			enabled: enabled,
			classes: classes,
			tooltip: tooltip
		};

		this.items.push(item);
		return item;
	}

	private _refresh(): void {
		const index = this.pageIndex;
		const ilast = this.pageCount - 1;
		const imax = Math.min(ilast, this._getNumberOfNavigableAndCompletelyFilledPages());
		const weitereSeitenText = this._txt.get('search.browser.pageToolTipBetweenShow', 'Weitere Seiten anzeigen');

		this.items.splice(0, this.items.length);

		let ibase = Math.max(0, Math.min(ilast - 5, index - 2));

		if (ibase === ilast) {
			// only one page
			this._addItem(0, '1 / 1', true, false);
			return;
		}

		if (ibase > 0) {
			this._addItem(0, null, null, null);
		}

		if (ibase > 1) {
			this._addItem(Math.max(1, ibase - 5), '...', false, null, weitereSeitenText);
		}

		for (let i = 0; i < 5 && ibase <= ilast; i += 1, ibase += 1) {
			this._addItem(ibase, null, null, null);
		}

		ibase -= 1; // ibase is increment inside for

		if (ibase < ilast - 1) {
			this._addItem(Math.min(imax - 1, ibase + 5), '...', false, null, weitereSeitenText);
		}
		if (ibase < ilast) {
			this._addItem(ilast, null, null, null);
		}
	}

	private _paging(): Paging {
		if (this.paging) {
			this.paging.skip = this.paging.skip || 0;
			this.paging.take = this.paging.take || this.pagingSize;

			/*
			 PV-514: Bei gleichzeitger Darstellung mehrerer Controls zur Einstellung der Anzahl Suchtreffer pro Seite
			 muss bei einer Aenderung auch noch this.pagingSize neu gesetzt werden
			 */
			this.pagingSize = this.paging.take;

			return this.paging;
		}
		return <Paging>{skip: 0, take: this.pagingSize};
	}

	public get pageIndex(): number {
		const p = this._paging();
		return _util.isNumber(p.take) && (p.take > 0) ? Math.floor(p.skip / p.take) : 0;
	}

	public get pageCount(): number {
		const p = this._paging();
		if (_util.isNumber(p.take) && _util.isNumber(p.total) && (p.take > 0)) {
			return Math.floor(p.total / p.take) + (p.total % p.take > 0 ? 1 : 0);
		}
		return 1;
	}

	public onChangePageSize() {
		this.paging.take = this.pagingSize;
		this.paging.skip = 0;
		this._refresh();
		this.onPaged.emit(this.paging);
	}

	public setPageIndex(i: number): void {
		const p = this._paging();
		if (i < 0) {
			i = 0;
		}
		const skippedHitsToReachLastPage = p.total - (p.total % p.take);
		p.skip = Math.min(skippedHitsToReachLastPage, i * p.take);
		this._refresh();
		this.onPaged.emit(p);
	}

	public pageIndexIsNavigable(i: number): boolean {
		return (i >= 0) && (i < this._getNumberOfNavigableAndCompletelyFilledPages());
	}

	private _getNumberOfNavigableAndCompletelyFilledPages(): number {
		// Anzahl komplett gefuellte Seiten (eine eventuell nur teilweise gefuellte Seite wird weggelassen)
		const elasticSearchPageLimit = Math.floor(this._elasticHitLimit / this.paging.take);
		const currentHitlistPageLimit = Math.ceil(this.paging.total / this.paging.take);

		return Math.min(elasticSearchPageLimit, currentHitlistPageLimit);
	}
}
