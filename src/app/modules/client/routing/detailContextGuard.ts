import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {ClientContext, Utilities as _util} from '@cmi/viaduc-web-core';
import {DefaultContextGuard} from './defaultContextGuard';
import {Observable} from 'rxjs';
import {ContextService} from '../services/context.service';
import {UrlService} from '../services/url.service';

@Injectable()
export class DetailContextGuard extends DefaultContextGuard {
	constructor(context: ClientContext,
				contextService: ContextService,
				private _url: UrlService,
				private _router: Router) {
		super(context, contextService);
	}

	public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		const can = super.canActivate(route);

		let id: string = route.params['id'];
		if (!_util.isEmpty(id) && !isNaN(parseFloat(this._url.getDetailIdFromReference(id)))) {
			this._router.navigate([this._url.getDetailUrl(id)]);
		}

		return can;
	}

}
