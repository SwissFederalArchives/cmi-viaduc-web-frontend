import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
	ClientContext, EntityResult, Paging, SearchBrowseState, SearchRequest,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {SearchService} from '../../../services';
import {UrlService} from '../../../services';
@Component({
	selector: 'cmi-viaduc-search-browser',
	templateUrl: 'searchBrowser.component.html',
	styleUrls: ['./searchBrowser.component.less']
})
export class SearchBrowserComponent implements OnInit {
	public loading: boolean = false;
	public currentId: string;
	public itemIndex: number = 0;
	public itemCount: number = 0;

	constructor(private _context: ClientContext,
				private _searchService: SearchService,
				private _url: UrlService,
				private _route: ActivatedRoute,
				private _router: Router) {
		this._route.params.subscribe(p => {
			this.currentId = p.id;
		});
	}

	public ngOnInit(): void {
		this.itemIndex = this._getCurrentIndex();
		this.itemCount = this._getItemCount();
	}

	public get canGoPrev(): boolean {
		return !this.loading && this.itemIndex > 0;
	}

	public get canGoNext(): boolean {
		return !this.loading
			&& ((this.itemIndex + 1) < this.itemCount)
			&& ((this.itemIndex + 1) < this._searchService.elasticHitLimit);
	}

	public get canGoToLast(): boolean {
		return !this.loading
			&& ((this.itemIndex + 1) < this.itemCount)
			&& this.itemCount < this._searchService.elasticHitLimit;
	}

	public async goToPrevious() {
		if (!this.canGoPrev) {
			return;
		}
		if (this._getOffset().offset === 0) {
			await this._pageBackwardAndSelectLast();
		} else {
			const b = this._getOffset();
			this._selectItem(b.offset - 1);
		}

		this._goToCurrent();
	}

	public async goToNext() {
		if (!this.canGoNext) {
			return;
		}
		if (this._getOffset().offset === this._getResult().items.length - 1) {
			await this._pageForwardAndSelectFirst();
		} else {
			const b = this._getOffset();
			this._selectItem(b.offset + 1);
		}

		this._goToCurrent();
	}

	public async goToFirst() {
		if (!this.canGoPrev) {
			return;
		}
		await this._pageAndSelect(0, 0);
		this._goToCurrent();
	}

	public async goToLast() {
		if (!this.canGoToLast) {
			return;
		}
		const p = this._paging();
		const skip = Math.max(p.total - p.take, 0);
		const index = this._context.search.request.paging.take - 1;
		await this._pageAndSelect(skip, index);
		this._goToCurrent();
	}

	private async _update(request: SearchRequest): Promise<void> {
		this.loading = true;
		try {
			let response = await this._searchService.search(request);

			if (response && _util.isObject(response['entities'])) {
				this._context.search.request = request;
				this._context.search.result = <EntityResult>response['entities'];
			}
		} catch (err) {
		} finally {
			this.itemCount = this._getItemCount();
			this.loading = false;
		}
	}

	private _paging(): Paging {
		let r = this._getResult();
		if (r && r.paging) {
			if (r.paging) {
				r.paging.skip = r.paging.skip || 0;
				return r.paging;
			}
		}

		return <Paging>{skip: 0, index: 0};
	}

	private _getOffset(): SearchBrowseState {
		let itemIndex = 0;

		const result = this._getResult();
		if (result && result.items) {
			const index = result.items.findIndex(i => i.archiveRecordId === this.currentId);
			if (index >= 0) {
				itemIndex = index;
			}
		}

		return <SearchBrowseState>{offset: Math.max(itemIndex, 0)};
	}

	private _goToCurrent(): void {
		const b = this._getOffset();
		let item = this._context.search.result.items[b.offset];

		this._router.navigate([this._url.getDetailUrl(item.archiveRecordId, item.title)]).then(() => {
			this.itemIndex = this._getCurrentIndex();
		});
	}

	private _getCurrentIndex(): number {
		const p = this._paging();
		const b = this._getOffset();
		return (_util.isNumber(p.skip) ? p.skip : 0) + b.offset;
	}

	private _getItemCount(): number {
		const p = this._paging();
		return _util.isNumber(p.total) ? p.total : 1;
	}

	private async _pageForwardAndSelectFirst() {
		const skip = this._context.search.request.paging.skip + this._context.search.result.paging.take;
		return this._pageAndSelect(skip, 0);
	}

	private async _pageBackwardAndSelectLast() {
		const skip = Math.max(this._context.search.request.paging.skip - this._context.search.result.paging.take, 0);
		const index = this._context.search.request.paging.take - 1;
		return this._pageAndSelect(skip, index);
	}

	private async _pageAndSelect(skip: number, index: number) {
		this._context.search.request.paging.skip = skip;
		await this._update(this._context.search.request);
		this._selectItem(index);
	}

	private _selectItem(index: number) {
		let lastItem = this._context.search.result.items[index];
		this.currentId = lastItem.archiveRecordId;
	}

	private _getResult(): EntityResult {
		return this._context.search ? this._context.search.result : undefined;
	}
}
