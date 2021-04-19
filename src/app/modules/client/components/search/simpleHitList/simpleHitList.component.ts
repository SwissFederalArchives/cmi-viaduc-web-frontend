import {Component, Input} from '@angular/core';
import {UserService} from '../../../services';
import {UserUiSettings} from '../../../model';
import {ClientContext, ConfigService, Entity, TranslationService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-simple-hitlist',
	templateUrl: 'simpleHitList.component.html',
	styleUrls: ['./simpleHitList.component.less']
})
export class SimpleHitListComponent {
	@Input()
	public entityResult: Entity[];
	@Input()
	public loading: boolean = false;
	@Input()
	public enableExplanations: boolean = false;

	private _userSettings: UserUiSettings;

	constructor(public _context: ClientContext,
				private _config: ConfigService,
				private _usr: UserService,
				private _txt: TranslationService) {
		this._userSettings = this._config.getUserSettings();
	}

	public get language(): string {
		return this._context.language;
	}

	public onHideInfoChanged(change: any) {
		if (change.target.checked !== null && change.target.checked !== undefined) {
			this._userSettings.showInfoWhenEmptySearchResult = !change.target.checked;
			this._config.setUserSettings(this._userSettings);
			this._usr.updateUserSettings(this._userSettings);
		}
	}

	get showInfoWhenEmptySearchResult(): boolean {
		if (!this._userSettings) {
			return false;
		} else {
			return this._userSettings.showInfoWhenEmptySearchResult === true;
		}
	}

	get isLoggedIn(): boolean {
		return this._context.authenticated;
	}

	public GetReason4() {
		const linkDbArchivaddrSchweiz = 'http://vsa-aas.ch/die-archive/archivadressen/archivadressen-schweiz/';
		const archivportalEuropa = 'https://www.archivesportaleurope.net/de/home';

		return this._txt.get('simpleHit.reason4',
			'Es gibt im Bundesarchiv tatsächlich keine Unterlagen zu Ihrem Thema. Weitere Archive finden Sie in der ' +
			'<a href="{0}">Datenbank Archivadressen der Schweiz</a> ' +
			'oder auf dem ' +
			'<a href="{1}">Archivportal Europa</a>.',
			linkDbArchivaddrSchweiz, archivportalEuropa);
	}
}
