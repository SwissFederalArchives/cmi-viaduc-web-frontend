import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {ErrorInfo, TranslationService} from '@cmi/viaduc-web-core';

@Injectable()
export class NotFoundResolver implements Resolve<ErrorInfo> {
	constructor(private _txt: TranslationService) {
	}

	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ErrorInfo {
		return <ErrorInfo>{
			title: this._txt.get('errors.pageNotFoundTitle', 'Die Seite wurde nicht gefunden')
		};
	}
}
