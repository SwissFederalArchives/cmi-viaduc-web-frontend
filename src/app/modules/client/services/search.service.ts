import {Injectable} from '@angular/core';
import {
	ClientContext,
	CoreOptions,
	EntityDecoratorService,
	FieldOperator,
	GroupOperator,
	HttpService,
	SearchError,
	SearchModel,
	SearchRequest,
	SearchResponse, TranslationService,
	Utilities as _util,
	BooleanResponse
} from '@cmi/viaduc-web-core';
import {map} from 'rxjs/operators';
import {AdvancedSearchService} from './advancedSearch.service';

@Injectable()
export class SearchService {

	public elasticHitLimit = 10000;

	constructor(private _options: CoreOptions,
				private _http: HttpService,
				private _context: ClientContext,
				private _decorator: EntityDecoratorService,
				private _txt: TranslationService,
				private _adv: AdvancedSearchService
	) {
		this._decorator.decorate(undefined);
	}

	public search(request: SearchRequest): Promise<any> | Promise<SearchError> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		const queryString = `?language=${this._context.language}`;
		const url = `${apiDataUrl}/Search${queryString}`;
		return this._http.post<SearchResponse>(url, request, this._http.noCaching)
			.pipe(map(r => this._decorator.decorateSearchResponse(r)))
			.toPromise();
	}

	public searchExport(request: SearchRequest): any   {
		const apiDataUrl = this._options.serverUrl + this._options.privatePort + '/api/Data';
		const queryString = `?SearchText=${encodeURIComponent(JSON.stringify(request))}`;
		const url = `${apiDataUrl}/ExportSearchResultToExcel${queryString}`;
		return this._http.download(url);
	}

	public searchBySignatur(signatur: string): Promise<string> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		const query = encodeURIComponent(signatur);
		const url = `${apiDataUrl}/SearchBySignatur?signatur=${query}`;
		return this._http.get<string>(url, this._http.noCaching).toPromise();
	}

	public hasCurrentOe2UserEinsichtsgesuchForSignatur(signatur: string): Promise<BooleanResponse> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		const query = encodeURIComponent(signatur);
		const url = `${apiDataUrl}/HasCurrentOe2UserEinsichtsgesuchForSignatur?signatur=${query}`;
		return this._http.get<BooleanResponse>(url, this._http.noCaching).toPromise();
	}

	private _getFieldLabelText(fieldDefs: any[], key: string): string {
		for (const f of fieldDefs) {
			if (f.key === key) {
				return this._txt.get('metadata.searchFields.' + f.key, f.displayName);
			}
		}
		return '?';
	}

	private _getFieldOperatorText(op: FieldOperator) {
		switch (op) {
			case FieldOperator.And:
				return this._txt.get('search.fieldoperator.and', 'Alle Begriffe');
			case FieldOperator.Not:
				return this._txt.get('search.fieldoperator.not', 'Keiner der Begriffe');
			case FieldOperator.Or:
				return this._txt.get('search.fieldoperator.or', 'Mindestens ein Begriff');
			default:
				return '?';
		}
	}

	private _getGroupOperatorText(op: GroupOperator) {
		switch (op) {
			case GroupOperator.AND:
				return this._txt.get('search.groupoperator.capitalAnd', 'UND');
			case GroupOperator.OR:
				return this._txt.get('search.groupoperator.capitalOr', 'ODER');
			default:
				return '?';
		}
	}

	public toHumanReadableQueryString(searchModel: SearchModel): string {
		const fieldDefs = this._adv.getPossibleSearchFields();

		let s = '';
		const groupOperator = searchModel.groupOperator;
		for (const group of searchModel.searchGroups) {
			let groupString = '';

			if (s !== '') {
				groupString += ` ${this._getGroupOperatorText(groupOperator)} `;
			}

			const fieldOperator = group.fieldOperator;
			groupString += this._getFieldOperatorText(fieldOperator);

			groupString += ' (';
			let fieldString = '';
			for (const field of group.searchFields) {
				if (field.key && field.value && !_util.isEmpty(field.value)) {
					if (fieldString !== '') {
						fieldString += ', ';
					}
					fieldString += this._getFieldLabelText(fieldDefs, field.key) + ': ' + field.value;
				}
			}
			groupString += fieldString + ')';

			if (fieldString !== '') {
				s += groupString;
			}
		}
		return s;
	}

	public createSearchTermViewer(searchModel: SearchModel): string {
		let searchTerm = '';
		for (const group of searchModel.searchGroups) {

			for (const field of group.searchFields) {
				if (field.key && field.value && !_util.isEmpty(field.value)) {
					if (searchTerm !== '') {
						searchTerm += ' ';
					}
					if (field.key === 'allData' || field.key === 'title' || field.key === 'allPrimaryData') {
						searchTerm += field.value;
					}
				}
			}
		}
		return searchTerm;
	}
}
