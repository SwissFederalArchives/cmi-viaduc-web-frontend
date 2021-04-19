import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {UserService} from '../services/user.service';
import {ClientContext, PreloadService} from '@cmi/viaduc-web-core';
import {map, take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../services';

@Injectable()
export class PreloadedResolver implements Resolve<boolean> {
	constructor(private _preloadService: PreloadService) {
	}

	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
		if (this._preloadService.isPreloaded) {
			return true;
		} else {
			return this._preloadService.preloaded.pipe(take(1)).pipe(map(res => {
				return true;
			}));
		}
	}
}

@Injectable()
export class UserSettingsResolver implements Resolve<boolean> {
	constructor(private _usrService: UserService,
				private _ctx: ClientContext,
				private _pre: PreloadService,
				private _authService: AuthenticationService) {
	}

	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any  {
		if (this._usrService.hasUserSettingsLoaded || (!this._ctx.authenticated && !this._authService.isSigningIn)) {
			if (!this._pre.isPreloaded) {
				return this._pre.preloaded.pipe(take(1));
			}
			return true;
		} else {
			return this._usrService.userSettingsLoaded.pipe(take(1));
		}
	}
}

@Injectable()
export class TranslationsLoadedResolver implements Resolve<boolean> {
	constructor(private _context: ClientContext, private _preloadService: PreloadService) {
	}

	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
		const language = this._context.loadingLanguage || this._context.language;
		if (this._preloadService.hasTranslationsFor(language)) {
			return true;
		} else {
			return this._preloadService.translationsLoaded.pipe(take(1)).pipe(map(res => {
				this._context.language = res.language;
				return (res && res.language === language);
			}));
		}
	}
}
