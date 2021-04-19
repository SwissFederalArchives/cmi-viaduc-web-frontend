import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {ClientContext, Utilities as _util} from '@cmi/viaduc-web-core';
import {Observable} from 'rxjs';
import {DefaultContextGuard} from './defaultContextGuard';
import {ContextService} from '../services/context.service';
import {UrlService} from '../services/url.service';

@Injectable()
export class DefaultRedirectGuard extends DefaultContextGuard {
	constructor(context: ClientContext,
				contextService: ContextService,
				private _url: UrlService,
				private _router: Router) {
		super(context, contextService);
	}

	public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		const can = super.canActivate(route);
		console.log('defaultRedirectGuard called');
		console.log('defaultredirect url was ', route.url);
		let oldurl = route.url.reduce((l, s) => {
			l += '/' + s.path;
			return l;
		}, '');

		let url = oldurl;
		console.log('1.) defaultredirect url is now ', url);
		if (_util.isEmpty(url) || url === '/') {
			url = this._url.getHomeUrl();
		} else {
			url = this._url.localizeUrl(this.context.language, oldurl);
		}

		console.log('2.) defaultredirect url is now ', url);

		if (oldurl !== url) {
			this._router.navigate([url], {preserveQueryParams: true});
		}

		return can;
	}

}
