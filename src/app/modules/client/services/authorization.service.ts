import {Injectable} from '@angular/core';
import {ClientContext, CoreOptions, Entity, HttpService, Session, Utilities as _util} from '@cmi/viaduc-web-core';
import {ApplicationFeatureEnum} from '@cmi/viaduc-web-core';

@Injectable()
export class AuthorizationService {

	// keep in-sync with CMI.Contract.Common.AccessRoles. Note: lower-cased
	public readonly roles: any = {
		Oe1: 'Ö1',
		Oe2: 'Ö2',
		Oe3: 'Ö3',
		BVW: 'BVW',
		AS: 'AS',
		BAR: 'BAR'
	};

	private _getApplicationFeatures(): { [key: string]: string; } {
		let dict: { [key: string]: string; } = { };
		const keys = Object.keys(ApplicationFeatureEnum).map((e) => {
			if (typeof ApplicationFeatureEnum[e] === 'string') {
				return ApplicationFeatureEnum[e];
			}
		});
		keys.forEach(k => dict[k] = k);
		return dict;
	}

	constructor(private _context: ClientContext, private _options: CoreOptions, private _http: HttpService) {
	}

	public setupSessionAuthorization(session: Session, identity?: any): void {
		session.roles = {};
		session.accessTokens = {};
		session.applicationRoles = {};
		session.applicationFeatures = {};

		session.authenticationRoles = this.roles;
		session.authorizationFeatures = this._getApplicationFeatures();

		if (!_util.isObject(identity)) {
			return;
		}

		if (_util.isArray(identity.roles)) {
			_util.forEach(identity.roles, t => {
				session.roles[t] = true;
			});
		}

		if (_util.isArray(identity.issuedAccessTokens)) {
			_util.forEach(identity.issuedAccessTokens, t => {
				session.accessTokens[t] = true;
			});
		}

		if (_util.isArray(identity.applicationRoles)) {
			_util.forEach(identity.applicationRoles, r => {
				session.applicationRoles[r.identifier] = true;
			});
		}

		if (_util.isArray(identity.applicationFeatures)) {
			_util.forEach(identity.applicationFeatures, f => {
				session.applicationFeatures[f.identifier] = true;
			});
		}
	}

	public hasRole(key: string): boolean {
		const session = this._context.currentSession || <Session>{};
		if (key === this.roles.Oe1) {
			// Ö1 user === anonymous. In diesem Fall ist die Session nicht vorhanden und wird als leeres Objekt angelegt.
			// Prüfung auf key hinzugefügt für den Fall, dass in Zukunft die Ö1 Rolle doch übergeben wird.
			return !_util.isObject(session.roles) || (session.roles[key] === true);
		}
		return _util.isObject(session.roles) && (session.roles[key] === true);
	}

	public hasAccessToken(key: string): boolean {
		const session = this._context.currentSession || <Session>{};
		if (key === this.roles.Oe1) {
			// Ö1 user === anonymous. In diesem Fall ist die Session nicht vorhanden und wird als leeres Objekt angelegt.
			// Prüfung auf key hinzugefügt für den Fall, dass in Zukunft das Ö1 AccessToken doch übergeben wird.
			return !_util.isObject(session.accessTokens) || (session.accessTokens[key] === true);
		}
		return _util.isObject(session.accessTokens) && (session.accessTokens[key] === true);
	}

	public hasAnyAccessToken(accessTokens: string[]): boolean {
		let retVal = false;
		_util.forEach(accessTokens, t => {
			if (this.hasAccessToken(t)) {
				retVal = true;
			}
		});
		return retVal;
	}

	public hasApplicationRole(identifier: string): boolean {
		const session = this._context.currentSession || <Session>{};
		return _util.isObject(session.applicationRoles) && (session.applicationRoles[identifier] === true);
	}

	public hasApplicationFeature(identifier: ApplicationFeatureEnum): boolean {
		let key: string = ApplicationFeatureEnum[identifier];
		const session = this._context.currentSession || <Session>{};
		return _util.isObject(session.applicationFeatures) && (session.applicationFeatures[key] === true);
	}

	public isAsUser(): boolean {
		return this.hasRole(this.roles.AS);
	}

	public isBvwUser(): boolean {
		return this.hasRole(this.roles.BVW);
	}

	public allowDataDownload(entity: Entity): boolean {
		return (entity.isDownloadAllowed);
	}

	public isBarUser(): boolean {
		return this.hasRole(this.roles.BAR);
	}

	public isInternalUser(): boolean {
		return (this.hasRole(this.roles.BAR) || this.hasRole(this.roles.BVW) || this.hasRole(this.roles.AS));
	}

	public isExternalUser(): boolean {
		return (this.hasRole(this.roles.Oe1) || this.hasRole(this.roles.Oe2) || this.hasRole(this.roles.Oe3));
	}

	public hasMoreThenOe2Rights() {
		return this.isInternalUser() || this.hasRole(this.roles.Oe3);
	}

	public verifyCaptcha(token: string): Promise<any> {
		const apiPublicUrl = this._options.serverUrl + this._options.publicPort + '/api/Public';
		const url = `${apiPublicUrl}/verifyCaptcha`;
		return this._http.post<any>(url, {token: token}, this._http.noCaching)
			.toPromise();
	}
}
