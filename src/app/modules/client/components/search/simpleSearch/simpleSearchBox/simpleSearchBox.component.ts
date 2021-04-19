import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SearchSynonymeIconComponent} from '../../searchSynonyme/searchSynonymeIcon/searchSynonymeIcon.component';
import {
	ClientContext,
	ConfigService,
	Paging,
	SearchOptions,
	SearchRequest,
	SimpleSearchModel
} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-simple-search',
	templateUrl: 'simpleSearchBox.component.html',
	styleUrls: ['./simpleSearchBox.component.less']
})
export class SimpleSearchComponent implements OnInit {
	public search: SimpleSearchModel = new SimpleSearchModel();

	@ViewChild('searchSynonymeIconComponent', { static: false})
	private searchSynonymeIconComponent: SearchSynonymeIconComponent;

	public dateRangeValid: boolean = true;

	private pagingSize: number;
	private _shiftKeyPressed: boolean;

	constructor(private _context: ClientContext,
				private _cfg: ConfigService) {
	}

	@Input()
	public lastUsedQuery: SimpleSearchModel;

	@Input()
	public hasErweiterteSucheLink = false;

	@Output()
	public onSearch = new EventEmitter<SearchRequest>();

	public ngOnInit(): void {
		if (this.lastUsedQuery) {
			this.search = this.lastUsedQuery;
		}

		this.pagingSize = this._cfg.getValidPagingSize();
	}

	public get language(): string {
		return this._context.language;
	}

	private _createNewSearchRequest() {
		return Object.assign(new SearchRequest(), {
			paging: <Paging>{
				skip: 0,
				take: this.pagingSize
			}
		});
	}
	private _search(): void {
		let request = this._createNewSearchRequest();
		request.query = SearchRequest.createSearchModelFromSimple(this.search);
		request.options = <SearchOptions>{
			enableExplanations: this._shiftKeyPressed,
			enableHighlighting: true,
			enableAggregations: true
		};

		request.facetsFilters = null;
		this._context.search.request = null;
		this._context.search.advancedSearch = false;

		this.onSearch.emit(request);
	}

	public submit() {
		this._search();
	}

	public onClick(event) {
		this._shiftKeyPressed = event.shiftKey;
		this.submit();
	}

	public onKeydownSearch(event: KeyboardEvent) {
		this.searchSynonymeIconComponent.setSynonymSearchTimer();
		if (event.keyCode === 13) {
			event.stopPropagation();
			this.submit();
		}
	}

	public getEditQueryParameters() {
		return JSON.stringify(this._context.search.request.query, undefined, 0);
	}

	public onAddSynonymToSearchClicked(searchString: string) {
		// Gewählte Synonyme aus dem Dialog abfüllen
		this.search.term = searchString;
	}
}
