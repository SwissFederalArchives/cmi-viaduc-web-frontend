import {of as observableOf, Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {DefaultContextGuard} from './defaultContextGuard';
import {ContextService, AuthenticationService} from '../services';
import {ClientContext, PreloadService} from '@cmi/viaduc-web-core';
import {mergeMap, skip} from 'rxjs/operators';

@Injectable()
export class AuthGuard extends DefaultContextGuard {
	constructor(private _context: ClientContext,
				private _preload: PreloadService,
				private _auth: AuthenticationService,
				contextService: ContextService) {
		super(_context, contextService);
	}

	public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		const can = super.canActivate(route);

		if (this._context.authenticated) {
			return can;
		}

		return this._auth.activateSession().pipe(
			mergeMap(isAuthenticated => {
				if (isAuthenticated) {
					return of(true);
				}

				if (this._preload.isPreloading || !this._preload.isPreloaded) {
					return this._preload.preloaded.pipe(mergeMap(() => {
						return this._waitForSignedIn().pipe(mergeMap(res => {
							if (!res) {
								return of(false);
							}

							return can;
						}));
					}));
				}
				return this._waitForSignedIn();
			}));
	}

	private _waitForSignedIn(): Observable<boolean> {
		if (!this._auth.isSigningIn && !this._context.authenticated) {
			this._auth.login();
			return observableOf(false);
		}

		if (this._auth.isSigningIn) {
			return this._auth.onSignedIn.pipe(skip(1)); // skipping first, because its a behaviour-subject
		}

		if (!this._context.authenticated) {
			this._auth.login();
			return observableOf(false);
		}

		return observableOf(this._context.authenticated);
	}
}
