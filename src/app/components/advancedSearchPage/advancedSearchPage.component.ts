import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
	AdvancedSearchModel,
	ClientContext,
	ConfigService,
	FieldOperator,
	GroupOperator,
	Paging,
	SearchModel,
	SearchRequest,
	TranslationService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {AdvancedSearchService, SeoService, UrlService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-advanced-search-page',
	templateUrl: 'advancedSearchPage.component.html',
	styleUrls: ['./advancedSearchPage.component.less']
})
export class AdvancedSearchPageComponent implements OnInit {

	public viewModel: AdvancedSearchModel;
	public groupOperator = GroupOperator;

	public groupOperators: GroupOperator[] = [GroupOperator.AND, GroupOperator.OR];
	public queryString = '';
	public pagingSize;

	public constructor (private _config: ConfigService,
						private _context: ClientContext,
						private _adv: AdvancedSearchService,
						private _url: UrlService,
						private _route: ActivatedRoute,
						private _txt: TranslationService,
						private _router: Router,
						private _seoService: SeoService) {
	}

	public ngOnInit() {
		this._seoService.setTitle(this._txt.translate('Erweiterte Suche', 'advancedSearchPageComponent.pageTitle'));
		let qs = this._route.snapshot.queryParams['q'];

		if (qs && !_util.isEmpty(qs)) {
			let tempModel: SearchModel = JSON.parse(qs);
			this.viewModel = this._adv.regenerateAdvancedModelFromBaseSearchModel(tempModel);
		} else {
			this.reset();
		}
		this.pagingSize = this._config.getValidPagingSize();
	}

	public addSearchGroup() {
		let groupid = this.viewModel.searchGroups.length + 1;
		while (this.viewModel.searchGroups.filter(g => g.id === groupid).length > 0) {
			groupid++;
		}
		let grp = this._adv.createNewGroup(groupid);
		this.viewModel.searchGroups.push(grp);
	}

	public reset(): void {
		this.viewModel = new AdvancedSearchModel();
		let grp = this._adv.getInitialSearchGroup();
		this.viewModel.searchGroups.push(grp);
	}

	public getBreadCrumb(): any[] {
		return [
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			},
			{
				url: this._url.getAdvancedSearchUrl(),
				label: this._txt.get('breadcrumb.erweiterteSuche', 'Erweiterte Suche')
			}
		];
	}

	public search(event): void {
		this.queryString = '';

		for (let g of this.viewModel.searchGroups) {
			let fields = '';

			for (let f of g.searchFields) {
				if (f.value && f.value !== '') {
					if (fields !== '') {
						if (g.fieldOperator === FieldOperator.And) {
							fields += ' AND ';
						} else {
							fields += ' OR ';
						}
					}
					fields += '(' + f.key + ':(' + f.value + '))';
				}
			}

			if (this.queryString !== '' && fields.length > 0) {
				if (this.viewModel.groupOperator === GroupOperator.AND) {
					this.queryString += ' AND ';
				} else if (this.viewModel.groupOperator === GroupOperator.OR) {
					this.queryString += ' OR ';
				} else {
					this.queryString += ' AND NOT ';
				}
			}

			if (fields && fields.length > 0) {
				this.queryString += '(';
				this.queryString += fields;
				this.queryString += ')';
			}
		}

		let queryModel:SearchModel = <SearchModel>this._adv.getModelForQuery(this.viewModel);

		let request = this._createNewSearchRequest();
		request.query = queryModel;
		request.options = {
			enableExplanations: event.shiftKey,
			enableHighlighting: true,
			enableAggregations: true
		};
		request.facetsFilters = null;

		this._context.search.request = request;
		this._context.search.advancedSearch = true;

		this._router.navigate([this._url.getSearchResultUrl()]);
	}

	private _createNewSearchRequest() {
		return Object.assign(new SearchRequest(), {
			paging: <Paging>{
				skip: 0,
				take: this.pagingSize
			}
		});
	}

	public containsValidationErrors(): boolean {
		for (let g of this.viewModel.searchGroups) {
			for (let f of g.searchFields) {
				if (f.containsValidationErrors) {
					return true;
				}
			}
		}
		return false;
	}

	public handleEnterKey(event: any): void {
		if (!event || !_util.isObject(event.target)) {
			return;
		}

		const target = event.target;
		if (!_util.isString(target.tagName) || !_util.isString(target.type)) {
			return;
		}

		const tagName = (target.tagName || '').toLocaleLowerCase();
		const elemType = (target.type || '').toLocaleLowerCase();

		if (tagName === 'input' && elemType === 'text') {
			event.stopPropagation();
			this.search(event);
		}
	}
}
