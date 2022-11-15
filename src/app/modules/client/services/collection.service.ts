import {Injectable} from '@angular/core';
import {ClientContext, CollectionListItemDto, CoreOptions, HttpService} from '@cmi/viaduc-web-core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {CollectionItemResult} from '../model/collection/collectionItemResult';
import {UrlService} from './url.service';
import {Router} from '@angular/router';

@Injectable()
export class CollectionService {
	private readonly _createBaseUrl: string;
	public getBaseUrl: string;

	constructor(private _options: CoreOptions,
				private _context: ClientContext,
				private http: HttpService,
				private _url: UrlService,
				private _router: Router) {
		this._createBaseUrl = this._options.serverUrl + this._options.publicPort + '/api/Collections/';
		this.getBaseUrl = this._options.serverUrl + this._options.publicPort;
	}

	public getActiveCollections(parentId: number | null): Observable<CollectionListItemDto[] | null> {
		let url = this._createBaseUrl + `GetActiveCollections?parentId=${parentId}&language=${this._context.language}`;
		return this.http.get<CollectionListItemDto[]>(url).pipe(map(arr =>  arr.map(item => CollectionListItemDto.fromJS(item))));
	}

	public get(id: number): Observable<CollectionItemResult | null> {
		let url = this._createBaseUrl + 'Get/{id}?language=' + this._context.language;
		if (isNaN(id)) {
			this._router.navigate([this._url.getHomeUrl()]);
		} else {
			url = url.replace('{id}', '' + id);
			return this.http.get(url, this.http.noCaching).pipe(map(r => CollectionItemResult.fromJS(r)));
		}
	}

	public getSizedImageURL(collectionId: number):string {
		let url = this._createBaseUrl + 'GetSizedImage/{id}?mimeType=image/png&width=400&height=282';
		if (collectionId === undefined || collectionId === null) {
			throw new Error('The parameter ' + collectionId + ' must be defined.');
		}
		url = url.replace('{id}', '' + collectionId);
		return url;
	}

	public getImageURL(collectionId: number):string {
		let url = this._createBaseUrl + 'GetImage/{id}?usePrecalculatedThumbnail=false';
		if (collectionId === undefined || collectionId === null) {
			throw new Error('The parameter ' + collectionId + ' must be defined.');
		}
		url = url.replace('{id}', '' + collectionId);
		return url;
	}

	public getCollectionHeader():Observable<string> {
		let url = this._createBaseUrl + 'GetCollectionsHeader?language=' + this._context.language;
		return this.http.get<string>(url).pipe(map(r => r));
	}

}
