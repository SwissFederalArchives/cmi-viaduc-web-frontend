import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Injectable} from '@angular/core';
import {ErrorInfo, TranslationService} from '@cmi/viaduc-web-core';

@Injectable()
export class NotFoundResolver  {
	constructor(private _txt: TranslationService) {
	}

	// eslint-disable-next-line
	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ErrorInfo {
		return <ErrorInfo>{
			title: this._txt.get('errors.pageNotFoundTitle', 'Die Seite wurde nicht gefunden')
		};
	}
}
