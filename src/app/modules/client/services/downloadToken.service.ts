import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CoreOptions, HttpService} from '@cmi/viaduc-web-core';

@Injectable()
export class DownloadTokenService {

	private _apiUrl: string;

	constructor(private _options: CoreOptions, private _http: HttpService) {
		this._apiUrl = this._options.serverUrl + this._options.privatePort + '/api/file';
	}

	public getOneTimeToken(archivRecordId: string): Observable<any> {
		const url = `${this._apiUrl}/GetOneTimeToken?archiveRecordId=${archivRecordId}`;
		return this._http.get<any>(url);
	}
}
