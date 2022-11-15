import {Injectable} from '@angular/core';
import {User} from '../model/account/user';
import {Subject, Observable} from 'rxjs';
import {ConfigService, CoreOptions, HttpService} from '@cmi/viaduc-web-core';
import {OnboardingModel} from '../model/account/onboardingModel';

@Injectable()
export class UserService {
	private _userSettingsLoaded = false;
	private _isLoadingUserSettings = false;

	public userSettingsLoaded: Subject<boolean>;

	constructor(private _options: CoreOptions,
				private _http: HttpService,
				private _cfg: ConfigService) {
		this.userSettingsLoaded = new Subject<boolean>();
	}

	public async getUser(): Promise<User> {
		const url = this._createBaseUrl() + 'getuser';
		return this._http.get<User>(url, this._http.noCaching).toPromise();
	}

	public async getUserSettings(): Promise<any> {
		const url = this._createBaseUrl() + 'getUserSettings';
		return this._http.get<any>(url, this._http.noCaching).toPromise();
	}

	public updateUser(user: User): Observable<User> {
		const url = this._createUrl('UpdateUserProfile');
		return this._http.post<User>(url, user, this._http.noCaching);
	}

	public get hasUserSettingsLoaded(): boolean {
		return this._userSettingsLoaded;
	}

	public get isLoadingUserSettings(): boolean {
		return this._isLoadingUserSettings;
	}

	public async initUserSettings(): Promise<void> {
		if (this._userSettingsLoaded) {
			return;
		}

		this._isLoadingUserSettings = true;

		const settings = await this.getUserSettings();
		if (settings) {
			this._cfg.setSetting('user.settings', settings);
			this._userSettingsLoaded = true;
			this._isLoadingUserSettings = false;
			this.userSettingsLoaded.next(true);
			this.userSettingsLoaded.complete();
		} else {
			this.userSettingsLoaded.complete();
		}
	}

	public async updateUserSettings(settings: any): Promise<void> {
		const url = this._createUrl('UpdateUserSettings');
		await this._http.post<string>(url, settings, this._http.noCaching).toPromise();
	}

	public getUsers(): Promise<Array<User>> {
		const url = this._createUrl('GetUsers');
		return this._http.get<Array<User>>(url, this._http.noCaching).toPromise();
	}

	public startOnboardingProcess(model:OnboardingModel): Promise<string> {
		const url = this._options.serverUrl + this._options.publicPort + '/api/Onboarding/StartProcess';
		return this._http.post<string>(url, model).toPromise();
	}

	private _createUrl(methodName: string): string {
		return this._createBaseUrl() + methodName;
	}

	private _createBaseUrl(): string {
		return this._options.serverUrl + this._options.publicPort + '/api/User/';
	}

	public async insertUser(user: User) {
		const url = this._createBaseUrl() + 'InsertUser';
		await this._http.post<string>(url, user, this._http.noCaching).toPromise();
	}

	public getUserDataFromClaims(): Promise<User> {
		const url = this._createBaseUrl() + 'GetUserDataFromClaims';
		return this._http.get<User>(url, this._http.noCaching).toPromise();
	}
}
