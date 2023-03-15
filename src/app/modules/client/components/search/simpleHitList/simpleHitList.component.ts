import {Component, Input} from '@angular/core';
import {AuthorizationService, UserService} from '../../../services';
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
	public loading = false;
	@Input()
	public enableExplanations = false;

	public isBarUser = false;
	private _userSettings: UserUiSettings;

	constructor(public _context: ClientContext,
				private _config: ConfigService,
				private _usr: UserService,
				private _authorization: AuthorizationService,
				private _txt: TranslationService) {
		this._userSettings = this._config.getUserSettings();
	}

	public ngOnInit(): void {
		this.isBarUser = this._authorization.isBarUser();
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
		let linkArchivaddrSchweiz = 'https://vsa-aas.ch/archive-schweiz/die-schweizer-archivlandschaft/';
		const archivportalEuropa = 'https://www.archivesportaleurope.net/' + this.language +   '/home';
		const archivesonline =  'https://www.archives-online.org/Home/ParticipatingArchives';
		switch (this.language) {
			case 'fr':
				linkArchivaddrSchweiz = 'https://vsa-aas.ch/fr/archives-suisses/le-paysage-archivistique-suisse/';
					break;
			case 'it':
				linkArchivaddrSchweiz = 'https://vsa-aas.ch/it/archivi-svizzeri/il-paesaggio-archivistico-svizzero/';
				break;
		}

		return this._txt.get('simpleHit.noHitsInfo.reason4',
			'Es gibt im Bundesarchiv tatsächlich keine Unterlagen zu Ihrem Thema. Weitere Archive finden Sie in der ' +
			'<a href="{0}">Datenbank Archivadressen der Schweiz</a> ' +
			'dem Rechercheportal <a href="{1}">archivesonline.org</a> ' +
			'oder auf dem ' +
			'<a href="{2}">Archivportal Europa</a>.',
			linkArchivaddrSchweiz, archivesonline, archivportalEuropa);
	}
}
