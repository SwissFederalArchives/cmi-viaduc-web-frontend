import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ClientContext, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {FavoriteList} from '../../../model';
import {AuthenticationService} from '../../../services';
import {FavoriteService} from '../../../services';
import {VeFavorite} from '../../../model';
import {ToastrService} from 'ngx-toastr';

@Component({
	selector: 'cmi-viaduc-favorite-menu',
	templateUrl: 'favoriteMenu.component.html',
	styleUrls: ['./favoriteMenu.component.less']
})
export class FavoriteMenuComponent {

	@Input()
	public entityId: string;
	@Output()
	public closeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

	public error: any = undefined;
	public lists: FavoriteList[];
	private _changes: Change[] = [];

	public loading: boolean = false;
	public addingNew: boolean = false;
	public authenticated: boolean = false;
	public addNewClicked: boolean = false;

	public formData: any = {
		listName: ''
	};

	constructor(private _context: ClientContext,
				private _authentication: AuthenticationService,
				private _favoriteService: FavoriteService,
				private _txt: TranslationService,
				private _toastr: ToastrService) {
	}

	private async _loadLists(entityId: string): Promise<void> {
		this.loading = true;

		this.error = undefined;
		try {
			this.lists = (await this._favoriteService.getAllFavoriteListsForEntity(entityId) || []);

			if (this.lists.length === 0) {
				// Benutzer hat noch keine Liste, daher automatisch eine erste erstellen
				let l = await this._favoriteService.createDefaultFavoriteList();
				this.lists.push(l);
			}
		} catch (err) {
			console.error(err);
			this.error = err;
		} finally {
			this.loading = false;
		}
	}

	public async ngOnInit(): Promise<void> {
		this.authenticated = this._context.authenticated;

		if (this.authenticated) {
			await this._loadLists(this.entityId);
		}
	}

	private async _reload(): Promise<void> {
		this.showHideAddNew(false);
		await this._loadLists(this.entityId);
	}

	public isEnabled(): boolean {
		return this.authenticated && !this.error;
	}

	public login(event?: any): void {
		if (event) {
			event.stopPropagation();
		}
		this._authentication.login();
	}

	public toggleOn(event: any, list: FavoriteList): void {
		let value = event;
		let change = new Change();
		change.id = list.id;
		change.value = value.target.checked;

		if (this._changes.findIndex(c => c.id === list.id) < 0) {
			this._changes.push(change);
		} else {
			_util.remove(this._changes, (c  => c.id === list.id));
			this._changes.push(change);
		}

	}

	public getToggleTooltip(list: FavoriteList): string {
		let remove = (list && list.included === true);
		return remove
			? this._txt.get('favorites.removeFavoriteFromList', 'Aus der Liste {0} entfernen', list.name)
			: this._txt.get('favorites.addFavoriteToList', 'Zu Liste {0} hinzufügen', list.name);
	}

	public showHideAddNew(state: boolean, event?: any): void {
		if (event) {
			event.stopPropagation();
		}
		this.addingNew = state;
	}

	public async addNew(event): Promise<void> {
		if (event) {
			event.stopPropagation();
		}
		this.addNewClicked = true;

		if (_util.isEmpty(this.formData.newListName)) {
			return;
		}

		let l = await this._createList(this.formData.newListName);

		const veFavorite = new VeFavorite();
		veFavorite.veId = this.entityId;
		veFavorite.listId = l.id;

		await this._favoriteService.addFavorite(l.id, veFavorite);
		await this._reload();
		this.formData.newListName = '';
		this.addNewClicked = false;
	}

	private async _createList(listName: string): Promise<FavoriteList> {
		return await this._favoriteService.addFavoriteList(listName);
	}

	public gotNewListName(): boolean {
		return !_util.isEmpty(this.formData.newListName);
	}

	public saveDialog() {
		if (_util.isEmpty(this._changes) && this.lists.filter(l => l.included).length === 0) {
			this._toastr.warning(
				this._txt.get('favorites.emptyListWarn', 'Bitte wählen Sie eine Favoritenliste, um die Verzeichnungseinheit den Favoriten hinzuzufügen.'),
				this._txt.get('favorites.emptyListWarnTitle', 'Keine Liste ausgewählt'));
			return;
		}

		let ids:any[] = [];
		for (let change of this._changes.reverse()) {
			if (ids.indexOf(change.id) === -1) {
				if (change.value) {
					const veFavorite = new VeFavorite();
					veFavorite.veId = this.entityId;
					veFavorite.listId = change.id;
					this._favoriteService.addFavorite(change.id, veFavorite).then(
						() => this._toastr.success(this._txt.get('favorites.saveSuccessfull', 'Favoriten erfolgreich mutiert.'))
					);
				} else {
					let list = this.lists.filter(l => l.id === change.id)[0];
					this._favoriteService.getFavoritesContainedOnList(list.id).then(items => {
						// not all are VeFavorite there are also SearchFavorite,therefore check to null
						let item = items.filter(i => (<VeFavorite>i)?.veId?.toString() === this.entityId);
						this._favoriteService.removeFavorite(change.id, item[0].id).then(
							() => this._toastr.success(this._txt.get('favorites.saveSuccessfull', 'Favoriten erfolgreich mutiert.'))
						);
					});
				}
				ids.push(change.id);
			}
		}
		this._changes = [];
		this.closeEvent.emit(true);
	}

	public cancelDialog() {
		this.closeEvent.emit(false);
	}
}

class Change {
	public id: number;
	public value: any;
}
