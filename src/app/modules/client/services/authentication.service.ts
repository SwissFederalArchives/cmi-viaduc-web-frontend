import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {
	ConfigService, CoreOptions, HttpService, PreloadService, Session,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {ContextService} from './context.service';
import {AuthorizationService} from './authorization.service';
import {SessionStorageService} from './sessionStorage.service';
import {UserService} from './user.service';
import {UrlService} from './url.service';
import {skip, take} from 'rxjs/operators';
import {AuthStatus} from '../model';

const currentSessionKey = 'viaduc_auth_session';
const authReturnUrlKey = 'viaduc_auth_return_url';
const logoutReturnUrlKey = 'viaduc_logout_return_url';
const dontUseReturnUrl = 'viaduc_dont_use_return';
const editReturnUrlKey = 'viaduc_edit_return_url';

@Injectable()
export class AuthenticationService {

	public isSigningIn = false;
	public onSignedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private _options: CoreOptions,
				private _config: ConfigService,
				private _contextService: ContextService,
				private _authorizationService: AuthorizationService,
				private _http: HttpService,
				private _sessionStorage: SessionStorageService,
				private _router: Router,
				private _preloadService: PreloadService,
				private _userService: UserService,
				private _urlService: UrlService) {
	}

	public login(): void {
		const callbackUrl = `${window.location.pathname}#/auth/success?login`; // relative url
		let returnUrl = window.location.href;
		let loginUrl = _util.addToString(this._options.serverUrl + this._options.publicPort, '/', 'AuthServices/SignIn?ReturnUrl=' + encodeURIComponent(callbackUrl));

		this._setUrl(authReturnUrlKey, returnUrl);
		window.location.assign(loginUrl);
	}

	public logout(): void {
		this.clearCurrentSession();
		this._setUrl(logoutReturnUrlKey, window.location.href);
		const logoutUrl = _util.addToString(this._options.serverUrl + this._options.publicPort, '/', 'private/?logout');
		window.location.assign(logoutUrl);
	}

	public clearRedirectUrl(): void {
		this._setUrl(authReturnUrlKey, '');
		this._setUrl(logoutReturnUrlKey, '');
		this._setUrl(dontUseReturnUrl, '');
	}

	public redirectToOriginBeforeLogin(): void {
		const returnUrl = this._sessionStorage.getUrl(authReturnUrlKey);
		const logoutReturnUrl = this._sessionStorage.getUrl(logoutReturnUrlKey);
		const dontUseReturn = this._sessionStorage.getUrl(dontUseReturnUrl);
		this.clearRedirectUrl();
		if (dontUseReturn) {
			return;
		}

		if (returnUrl !== '') {
			window.location.assign(returnUrl);
		} else if (logoutReturnUrl !== '' ) {
			window.location.assign(logoutReturnUrl);
		} else {
			this._router.navigate([this._urlService.getHomeUrl()]);
		}
	}

	public edit(): void {
		let hostUrl = this._urlService.getExternalHostUrl();
		let baseUrl = this._urlService.getExternalBaseUrl();
		const partialEditUrl = this._config.getSetting('account.partialEditUrl');
		const returnUrl = this._router.url;
		const targetUrl = _util.addToString(hostUrl, '/', partialEditUrl) + '?returnURL=' + baseUrl + '#' + returnUrl;

		this._setUrl(editReturnUrlKey, returnUrl);
		window.location.assign(targetUrl);
	}

	public setCurrentSession(session: Session): void {
		this._sessionStorage.setItem(currentSessionKey, session);
		this._contextService.updateSession(session);
	}

	public clearCurrentSession(): void {
		this._config.removeSetting('user.settings');
		this.isSigningIn = false;
		this.setCurrentSession(<Session>{});
	}

	private _initSession(token: string, identity?: any): void {
		const session = <Session>{
			token: token,
			inited: new Date().getTime()
		};

		this._authorizationService.setupSessionAuthorization(session, identity);

		let claims;
		if (_util.isObject(identity) && _util.isArray(identity.issuedClaims)) {
			claims = identity.issuedClaims;
		}

		if (_util.isArray(claims)) {
			session.authenticated = true;

			let matches = claims.filter(c => c.type.indexOf('/identity/claims/e-id/userExtId') >= 0);
			if (!_util.isEmpty(matches)) {
				session.userid = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/displayName') >= 0);
			if (!_util.isEmpty(matches)) {
				session.username = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/surname') >= 0);
			if (!_util.isEmpty(matches)) {
				session.lastname = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/givenname') >= 0);
			if (!_util.isEmpty(matches)) {
				session.firstname = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/emailaddress') >= 0);
			if (!_util.isEmpty(matches)) {
				session.emailaddress = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/e-id/userExtId') >= 0);
			if (!_util.isEmpty(matches)) {
				session.userExtId = matches[0].value;
			}
			matches = claims.filter(c => c.type.indexOf('/identity/claims/authenticationmethod') >= 0);
			if (!_util.isEmpty(matches)) {
				session.isKerberosAuthentication = matches[0].value.toLowerCase().indexOf('kerberos') >= 0;
			}
		}

		this.setCurrentSession(session);
		console.log('_initSession', identity);
		if (!_util.isEmpty(identity)) {
			if (!this._userService.hasUserSettingsLoaded && !this._userService.isLoadingUserSettings) {
				console.log('wait for sign in', identity);
				this.onSignedIn.pipe(skip(1)).subscribe(res => { // skipping first, because its a behaviour-subject
						console.log('signed in', res);
						if (!this._preloadService.settings && !this._preloadService.isPreloaded) {
							console.log('settings not preloaded, waiting');
							this._preloadService.settingsloaded.pipe(take(1)).subscribe(() => {
								console.log('now preloaded, initusersettings now');
								this._userService.initUserSettings();
							});
						} else {
							console.log('already preloaded, initusersettings now');
							this._userService.initUserSettings();
						}
					}
				, (error) => console.log('Auth Service Error', error));
			}
		}

	}

	private _getIdentity(): Observable<any> {
		const baseUrl = this._options.serverUrl + this._options.publicPort;
		let claimsUrl = baseUrl + '/api/Auth/GetIdentity';
		return this._http.get<any>(claimsUrl);
	}

	public activateSession(): Promise<any> {
		const baseUrl = this._options.serverUrl + this._options.publicPort;
		const tokenUrl = baseUrl + '/token';
		const oAuthParameters = 'grant_type=client_credentials';

		return this._http.post<any>(tokenUrl, oAuthParameters).toPromise().then(
			response => {
				let token = response.access_token;
				this._initSession(token);
				if (token !== '') {
					return this._getIdentity().toPromise().then(
						r => {
							return this.handleIdentityResponse(r, token);
						},
						err => {
							this.clearCurrentSession();
							console.error(err);
							throw err;
						}
					);
				} else {
					return false;
				}
			},
			error => {
				console.error(error);
				throw error;
			}
		);
	}

	public async tryActivateExistingSession(): Promise<any> {
		this.isSigningIn = true;
		const returnUrl = this._sessionStorage.getUrl(authReturnUrlKey);

		if (!_util.isEmpty(returnUrl)) {
			return false;
		}

		let session = this._sessionStorage.getItem<Session>(currentSessionKey);
		if (session != null && session.authenticated) {
			let token = session.token;
			this._initSession(session.token);

			return this._getIdentity().toPromise().then(r => {
					return this.handleIdentityResponse(r, token);
				},
				err => {
					console.log(err);
					this.clearCurrentSession();
					throw err;
				});
		}
	}

	private handleIdentityResponse(response: any, token: any): boolean {
		this._initSession(token, response);

		switch (response.authStatus) {
			case AuthStatus.ok:
				return true;
			case AuthStatus.keineRolleDefiniert:
				this._setUrl(dontUseReturnUrl, 'true');
				this._router.navigate([this._urlService.getErrorUrl()]);
				return true;
			case AuthStatus.neuerBenutzer:
				this._setUrl(dontUseReturnUrl, 'true');
				this._router.navigate([this._urlService.getRegister()]);
				return true;
			case AuthStatus.keineMTanAuthentication:
				this._setUrl(dontUseReturnUrl, 'true');
				if (_util.isEmpty(response.redirectUrl)) {
					this._router.navigate([this._urlService.getErrorUrl()]);
					return false;
				}

				// we have to clear the cache, because the old token would be used
				// when the user returns after he entered his mobile number
				// which would create a loop (claims are old)
				this.clearCurrentSession();

				if (!response.redirectUrl.startsWith('http')) {
					response.redirectUrl = `https://${response.redirectUrl}`;
				}
				document.location.href = response.redirectUrl;
				return true;
			case AuthStatus.keineKerberosAuthentication:
				this._setUrl(dontUseReturnUrl, 'true');
				this._router.navigate([this._urlService.getErrorSmartcardUrl()]);
				return true;
			default:
				console.log('Keine definierter AuthStatus!');
				break;
		}

		return false;
	}

	private _setUrl(key: string , url: string) {
		const authMode = this._config.getSetting('authentication.mode');
		if (authMode === 'builtin') {
			this._sessionStorage.setItem(key, url);
		} else {
			this._sessionStorage.setUrl(key, url);
		}
	}

}
