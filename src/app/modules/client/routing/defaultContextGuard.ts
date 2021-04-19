import {of as observableOf, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate} from '@angular/router';
import {ContextService} from '../services';
import {ClientContext} from '@cmi/viaduc-web-core';

@Injectable()
export class DefaultContextGuard implements CanActivate {
	constructor(protected context: ClientContext, protected contextService: ContextService) {
	}

	public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		let language: string = route.params['lang'];
		const rte1stPart = route.root.children.length > 0 ? route.root.children[0] : route;
		if (!language && rte1stPart.url && rte1stPart.url.length > 0 && /^(de|fr|it|en)$/.test(rte1stPart.url[0].path)) {
			language = rte1stPart.url[0].path;
		}
		language = language || this.context.language;
		if (language !== this.context.language) {
			return this.contextService.updateLanguage(language);
		}
		return observableOf(true);
	}
}
