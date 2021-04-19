import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {ClientContext, CoreOptions, EntitiesResult, Entity, EntityDecoratorService, HttpService, Paging} from '@cmi/viaduc-web-core';

@Injectable()
export class EntityService {
	constructor(private _options: CoreOptions, private _http: HttpService, private _context: ClientContext, private _decorator: EntityDecoratorService) {
	}

	public get(id: string, paging: Paging = null): Promise<Entity> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		let queryString = `?id=${id}&language=${this._context.language}`;

		if (paging) {
			queryString += '&paging=' + encodeURIComponent(JSON.stringify(paging));
		}

		const url = `${apiDataUrl}/GetEntity${queryString}`;
		return this._http.get<Entity>(url, this._http.noCaching)
			.pipe(
				map(r => this._decorator.decorate(r)))
			.toPromise();
	}

	public getEntities(ids: string[], paging: Paging = null): Promise<EntitiesResult> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		let queryString = `?ids=${ids.join(',')}&language=${this._context.language}`;

		if (paging) {
			queryString += '&paging=' + encodeURIComponent(JSON.stringify(paging));
		}

		const url = `${apiDataUrl}/GetEntities${queryString}`;
		return this._http.get<EntitiesResult>(url, this._http.noCaching)
			.pipe(map(r => this._decorator.decorateEntitiesResult(r)))
			.toPromise();
	}

	public getChildHtml(id: string): Promise<string> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		let queryString = `?id=${id}`;

		const url = `${apiDataUrl}/GetArchivplanChildrenHtml${queryString}`;
		return this._http.get<string>(url, this._http.noCaching).toPromise();
	}

	public getArchivplanHtml(id: string): Promise<string> {
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		let queryString = `?id=${id}`;

		const url = `${apiDataUrl}/GetArchivplanHtml${queryString}`;
		return this._http.get<string>(url, this._http.noCaching).toPromise();
	}
}

export class MockEntityService {
	constructor() {
	}

	public get(id: string): Promise<Entity> {
		return new Promise<Entity>((resolve, reject) => {
			let mockResponse = <Entity>{
				archiveRecordId: id,
				title: 'Item ' + id
			};
			resolve(mockResponse);
		});
	}
}
