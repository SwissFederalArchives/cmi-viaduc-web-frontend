import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
	CaptchaVerificationData,
	ClientContext,
	ConfigService,
	FacetteFilter,
	Paging,
	SearchBrowseState,
	SearchError,
	SearchRequest,
	SearchResponse,
	SimpleSearchModel,
	TranslationService, UserUiSettings,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {SearchFacetteListComponent} from '../../modules/client/components';
import {SearchService, SeoService, UrlService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-search-result-page',
	templateUrl: 'searchResultPage.component.html',
	styleUrls: ['./searchResultPage.component.less']
})
export class SearchResultPageComponent implements OnInit {
	@ViewChild('facetteList', { static: true})
	public facettenList: SearchFacetteListComponent;

	public searchResponse: SearchResponse;
	public loading: boolean;
	public showLoading: boolean;
	public showCaptcha: boolean;
	public facetteCollapsed: boolean = false;
	public upperPaginationEnabled: boolean = false;
	public lowerPaginationEnabled: boolean = true;
	public lastExecutedSimpleSearchModel: SimpleSearchModel;
	public lastExecutedQueryTerm: string;
	public deepLinkUrl: string;
	public showMoreInformationEnabled: boolean = false;
	public showAddSearchFavorite: boolean = false;

	public sortingFields: any[];
	public selectedSortingField: any;

	private _captchaToken: string = undefined;

	private _sortingField;
	private _pagingSize;
	private _userSettings: UserUiSettings;
	public crumbs: any[];

	constructor(private _context: ClientContext,
				private _config: ConfigService,
				private _url: UrlService,
				private _router: Router,
				private _activatedRoute: ActivatedRoute,
				private _txt: TranslationService,
				private _searchService: SearchService,
				private _seoService: SeoService) {
		this.showLoading = true;
	}

	public async ngOnInit(): Promise<void> {
		this._seoService.setTitle(this._txt.translate('Suchergebnisse', 'searchResultPageComponent.pageTitle'));
		this._setPaginations();
		this._setupSorting();

		await this._executeSearchFromQueryParams();
		this.crumbs = this.getBreadCrumb();
	}

	public getSortingFields(): any[] {
		return this._config.getSetting('search.simpleSearchSortingFields', {});
	}

	private _setupSorting() {
		this.sortingFields = this.getSortingFields();
		this._userSettings = this._config.getUserSettings();

		if (!this.selectedSortingField &&
			this._context &&
			this._context.search &&
			this._context.search.request &&
			this._context.search.request.paging) {
			let cf = this._context.search.request.paging;
			this.selectedSortingField = this.sortingFields.filter(f => f.orderBy === cf.orderBy && f.sortOrder === cf.sortOrder)[0];
		}

		if (!this.selectedSortingField) {
			this.selectedSortingField = this._userSettings.selectedSortingField;
		}
	}

	private _setResultPaging() {
		this._userSettings = this._config.getUserSettings();
		if (!this._context.search.request) {
			return;
		}

		let paging = this._context.search.request.paging;
		if (paging) {
			this._sortingField = paging;
			this._pagingSize = paging.take;
		} else {
			this._sortingField = this._userSettings.selectedSortingField;
			this._pagingSize = this._userSettings.pagingSize;
		}
	}

	private async _executeSearchFromQueryParams() {
		if (!this._context.search.request) {
			this._context.search.request = this._url.getSearchRequestFromQueryParams(this._activatedRoute.snapshot.queryParams);
		}
		if (this._context.search.request) {
			this._setResultPaging();
			let request = this._context.search.request;

			if (!this.isAdvancedSearchResult) {
				this._createLastExecutedSimpleSearchModel(request);
			} else {
				this.lastExecutedQueryTerm = this._searchService.toHumanReadableQueryString(request.query);
			}

			await this._search(this._context.search.request);
		} else {
			this.showLoading = false;
		}
	}

	private _setPaginations() {
		const paginationPosition = this._config.getSetting('ui.pagination.position', 'bottom');
		this.upperPaginationEnabled = paginationPosition.indexOf('top') >= 0;
		this.lowerPaginationEnabled = paginationPosition.indexOf('bottom') >= 0 || !this.upperPaginationEnabled;
	}

	private _createLastExecutedSimpleSearchModel(request) {
		let query = request.query || <any>{};
		let searchGroups = query.searchGroups || <any>[];
		if (_util.isEmpty(searchGroups)) {
			return;
		}

		if (!this.lastExecutedSimpleSearchModel) {
			this.lastExecutedSimpleSearchModel = new SimpleSearchModel();
		}

		let group = searchGroups[0] || <any>{};
		let searchFields = group.searchFields || <any>[];
		if (_util.isEmpty(searchFields)) {
			return;
		}

		let termField = searchFields[0];
		if (termField && _util.isObject(termField)) {
			this.lastExecutedSimpleSearchModel.term = termField.value;
		}

		let dateField = searchFields.length > 1 ? searchFields[1] : null;
		if (dateField) {
			this.lastExecutedSimpleSearchModel.dateRange = dateField;
		}
	}

	public get isAdvancedSearchResult(): boolean {
		let search = this._context.search || <any> {};
		let request = search.request || <any>{};

		return request.advancedSearch || search.advancedSearch;
	}

	public getBreadCrumb(): any[] {
		const advanced = this.isAdvancedSearchResult;
		const label = advanced
			? this._txt.get('breadcrumb.erweiterteSuche', 'Erweiterte Suche')
			: this._txt.get('breadcrumb.einfacheSuche', 'Einfache Suche');
		const url = advanced ? this._url.getAdvancedSearchUrl() : this._url.getSimpleSearchUrl();
		return [
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			},
			{url: url, label: label},
			{url: '', label: this._txt.get('breadcrumb.resultat', 'Resultat')}
		];
	}

	public get language(): string {
		return this._context.language;
	}

	public async onSorted(sortingField: any) {
		this._sortingField = sortingField;
		await this._search(this._context.search.request);
	}

	private _isErrorResponse(obj: any): obj is SearchError {
		return 'error' in obj;
	}

	private _getErrorSafe(): any {
		let search = this._context.search || <any>{};
		let errorResult = search.error || <any> {};

		return errorResult.error || {};
	}

	private _getErrorCodeSafe(): number {
		const error = this._getErrorSafe();
		return (error.statusCode) ? error.statusCode : 0;
	}

	public get hasAnyErrors(): boolean {
		return this._getErrorCodeSafe() > 0;
	}

	public get hasSyntaxError(): boolean {
		return this._getErrorCodeSafe() === 400;
	}

	public get hasOtherErrors(): boolean {
		return this.hasAnyErrors && !this.hasSyntaxError;
	}

	public get errorMessage(): string {
		const error = this._getErrorSafe();
		return error.message;
	}

	public get errorDetails(): string {
		const error = this._getErrorSafe();
		return error.details;
	}

	private async _search(request: SearchRequest): Promise<void> {
		if (this._requiresCaptchaValidation()) {
			this.showCaptcha = true;
			return;
		}
		this.showCaptcha = false;

		if (this.loading) {
			return;
		}
		this.loading = true;

		this._preProcessRequest(request);
		this._delayShowLoading();

		try {
			await this._searchInternal(request);
		} catch (err) {
			this._context.search.error = <SearchError>{
				error: {
					statusCode: 99,
					message: this._txt.get('search.unexpectedSystemError', 'Es ist ein unerwarteter Fehler aufgetreten.'),
					details: err.toString()
				}
			};
		} finally {
			this._context.lastSearchLink = this._url.getLastSearchUrl(request);
			this.deepLinkUrl = this._url.getExternalSearchUrl(request);

			await this._router.navigateByUrl(this._url.getUrlTreeFromSearchRequest(request));

			this.facetteCollapsed = this.totalhits <= 0;
			this.loading = false;
		}
	}

	private _requiresCaptchaValidation() {
		return this.showCaptcha && _util.isEmpty(this._captchaToken);
	}

	private _preProcessRequest(request: SearchRequest) {
		request.paging = request.paging || <Paging>{};
		request.paging.orderBy = this._sortingField.orderBy;
		request.paging.sortOrder = this._sortingField.sortOrder;
		request.paging.take = request.paging.take || this._pagingSize;
		request.advancedSearch = this.isAdvancedSearchResult;
		this._context.search.request = request;
	}

	private async _searchInternal(request: SearchRequest) {
		this._context.search.error = null;

		if (!_util.isEmpty(this._captchaToken)) {
			request.captcha = <CaptchaVerificationData>{token: this._captchaToken};
			this._captchaToken = undefined;
		}

		let response: SearchResponse | SearchError = await this._searchService.search(request);

		if (this._isErrorResponse(response)) {
			this._setSearchError(response);
		} else {
			this._setSearchResponse(response);
		}
	}

	private _setSearchResponse(response: SearchResponse | SearchError) {
		response = <SearchResponse>response;

		if (response && response['entities']) {
			this.searchResponse = response;
			this._context.search.result = response['entities'];
			this._context.search.browse = <SearchBrowseState>{offset: 0};
		} else {
			this.searchResponse.entities = null;
		}
	}

	private _setSearchError(response: SearchResponse | SearchError) {
		response = <SearchError>response;
		const error = response.error;
		if (error) {
			this._context.search.error = response;
			this._context.search.result = null;
			this.searchResponse = null;

			if (error.identifier === 'Captcha.Missing') {
				this.showCaptcha = true;
			} else {
				if (_util.isEmpty(error.message)) {
					error.message = this._txt.get('search.unexpectedSystemError', 'Es ist ein unerwarteter Fehler aufgetreten.');
				}
				// allowing the api to send string.empty details
				if (error.details === undefined || error.details === null) {
					error.details = this._txt.get('search.genericTryAgain', 'Versuchen Sie, die Suche später erneut auszuführen.');
				}
			}
		}
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
		}, 1500);
	}

	public async onSearch(request: SearchRequest): Promise<void> {
		await this._search(request);
		if (this.facettenList) {
			this.facettenList.resetFilters(false);
		}
	}

	public async onFilterRequest(filters: FacetteFilter[]): Promise<void> {
		if (this._context.search.request.paging) {
			this._context.search.request.paging.skip = 0;
		}
		this._context.search.request.facetsFilters = filters;
		await this._search(this._context.search.request);
	}

	public async onPaged(paging: Paging): Promise<void> {
		this._context.search.request.paging.skip = paging.skip;
		this._context.search.request.paging.take = paging.take;
		await this._search(this._context.search.request);
	}

	public onFacetteToggle(collapsed: boolean) {
		this.facetteCollapsed = collapsed;
	}

	public get totalhits(): number {
		if (!this.searchResponse) {
			return 0;
		}

		let entities = this.searchResponse.entities || <any>{};
		let paging = entities.paging || <any> {};
		return Math.max(0, paging.total || 0);
	}

	public editAdvancedSearch() {
		let qs = JSON.stringify(this._context.search.request.query, undefined, 0);
		this._router.navigate([this._url.getAdvancedSearchUrl()], {queryParams: {q: qs}});
	}

	public get getClassForHitbar(): string {
		const cls = 'col-xs hitbar';
		if (!this.facetteCollapsed && this.searchResponse && this.searchResponse.facets) {
			return cls;
		}

		if (this.facetteCollapsed) {
			return `${cls} hitbar-collapsed`;
		}

		return cls;
	}

	public get getClassForHitlist(): string {
		if (this.hasAnyErrors || !this.searchResponse || !this.searchResponse.facets) {
			return '';
		}

		if (!this.facetteCollapsed && this.searchResponse && this.searchResponse.facets) {
			return 'hitlist';
		}

		return '';
	}

	public compareSortFields(f1: any, f2: any): boolean {
		return f1 && f2 ? f1.displayName === f2.displayName : f1 === f2;
	}

	public getSortTranslationKey(field: any): String {
		let key = 'metadata.sortFields.';
		if (field && field.orderBy && field.orderBy !== '') {
			key += field.orderBy;
			if (field.sortOrder && field.sortOrder !== '') {
				key += '.' + field.sortOrder;
			}
		} else {
			key += 'relevanz';
		}
		return key;
	}

	public async onCaptchaResponse(response: any): Promise<void> {
		this._captchaToken = <string>response;
		this.showCaptcha = false;
		await this._search(this._context.search.request);
	}

	public toggleSearchFavoriteMenu(): void {
		this.showAddSearchFavorite = !this.showAddSearchFavorite;
	}
}
