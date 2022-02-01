import {Injectable} from '@angular/core';
import {ApplicationFeatureEnum, ClientContext, CoreOptions} from '@cmi/viaduc-web-core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthorizationService} from './authorization.service';
import {StaticRouteInfo} from '../model/static/staticRouteInfo';

@Injectable()
export class StaticContentService {
	private _apiUrl: string;

	constructor(private _http: HttpClient,
				private _options: CoreOptions,
				private _context: ClientContext,
				private _authorization: AuthorizationService,
	) {
		this._apiUrl = this._options.serverUrl + this._options.publicPort + '/api/Static';
	}

	public getContent(relativeUrl: string): Observable<any> {
		const url = `${this._apiUrl}/GetContent?url=${relativeUrl}`;

		return this._http.get(url, {responseType: 'text'});
	}

	public getStaticRouteInfo(url: string): StaticRouteInfo {
		url = url || '';
		const qPos = url.indexOf('?');
		const hPos = url.indexOf('#');
		return <StaticRouteInfo>{
			route: (qPos > 0 || hPos > 0) ? url.substring(0, (qPos > 0) ? qPos : hPos) : url,
			query: (qPos > 0) ? url.substring(qPos + 1, (hPos > qPos) ? hPos : url.length) : '',
			hash: (hPos > 0) ? url.substring(hPos + 1, url.length) : '',
		};
	}

	public hasWebAuthoringFeature(): boolean {
		if (this._context.currentSession === null) {
			return false;
		}
		return this._authorization.hasApplicationFeature(ApplicationFeatureEnum.PublicClientVerwaltenStaticContentEdit);
	}
}
