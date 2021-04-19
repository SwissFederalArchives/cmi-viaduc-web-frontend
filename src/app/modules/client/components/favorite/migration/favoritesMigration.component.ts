import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ClientContext, TranslationService } from '@cmi/viaduc-web-core';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
	selector: 'cmi-viaduc-favorites-migration',
	templateUrl: 'favoritesMigration.component.html',
	styleUrls: ['./favoritesMigration.component.less']
})
export class FavoritesMigrationComponent implements OnInit {
	@Output() public migrationFinished = new EventEmitter();
	private authenticated: boolean;
	public hasPendingPublic: boolean;
	public hasPendingLocal: boolean;
	public successMessage: string;
	public error: string;
	public loading: boolean;

	constructor(private _context: ClientContext,
		private _fav: FavoriteService,
		private _txt: TranslationService) {
	}

	public ngOnInit(): void {
		this.authenticated = this._context.authenticated;

		if (this.authenticated) {
			this.checkPendingMigrations();
		}
	}

	private checkPendingMigrations() {
		this._fav.currentUserHasPendingMigrations().then(
			result => {
				this.hasPendingLocal = result.pendingLocal > 0;
				this.hasPendingPublic = result.pendingPublic > 0;
			},
			err => {
				this.error = err.statusText;
			}
		);
	}

	public startMigration(source: string) {
		this.loading = true;
		try {
			this._fav.migrateFavorites(source).then(
				() => {
					this.successMessage = this._txt.get('favorites.migrationSuccess', 'Arbeitsmappen erfolgreich migriert');
					this.error = '';
					this.finishMigration();
				}, (e) => {
					this.error = this._txt.get('favorites.migrationFailure', 'Migration der Arbeitsmappen gescheitert! \nSollte das Problem weiterhin auftreten, wenden Sie sich bitte an das Bundesarchiv.');
					this.finishMigration();
				});
		} catch (err) {
			this.error = (<Error>err).message;
		}
	}

	private finishMigration() {
		this.checkPendingMigrations();
		this.migrationFinished.emit();
		this.loading = false;
	}
}
