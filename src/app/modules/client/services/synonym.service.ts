import {Injectable} from '@angular/core';
import {SynonymGruppe} from '../model/SynonymGruppe/SynonymGruppe';
import {Observable} from 'rxjs';
import {CoreOptions, HttpService} from '@cmi/viaduc-web-core';

@Injectable()
export class PublicService {

	private _apiUrl: string;

	constructor(private _options: CoreOptions, private _http: HttpService) {
		this._apiUrl = this._options.serverUrl + this._options.privatePort + '/api/Public';
	}

	public getSynonyme(searchValue:string): Observable<SynonymGruppe[]> {
		const url = `${this._apiUrl}/GetSynonyme?fieldContent=${searchValue}`;
		return this._http.get<SynonymGruppe[]>(url);
	}
}
