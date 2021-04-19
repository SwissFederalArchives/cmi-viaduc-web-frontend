import {Component, EventEmitter, Input, Output, AfterViewInit} from '@angular/core';
import {ClientContext, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {FavoriteService, AuthenticationService} from '../../../services';
import {FavoriteList, FavoriteKind, SearchFavorite} from '../../../model';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'cmi-viaduc-search-favorite-menu',
	templateUrl: 'searchFavoriteMenu.component.html',
	styleUrls: ['./searchFavoriteMenu.component.less']
})
export class SearchFavoriteMenuComponent implements AfterViewInit {

	@Input()
	public deepLinkUrl: string;

	@Output()
	public onClose: EventEmitter<void> = new EventEmitter<void>();

	public error: any = undefined;
	public lists: FavoriteList[];
	private _changes: Change[] = [];

	public searchTitle: string;

	public loading: boolean = false;
	public authenticated: boolean = false;
	public success: boolean = false;

	public addNewHeaderCss = 'collapsed';
	public addNewContentCss = 'collapse';

	public existingListsHeaderCss = 'active icon--root';
	public existingListsContentCss = 'collapse in';
	public showExistingLists = true;

	public form: FormGroup;
	public addNewListClicked = false;
	public addFavoriteClicked = false;
	public showAddNewListGroup = false;
	public isExistingFavorite = false;

	constructor(private _context: ClientContext,
				private _authentication: AuthenticationService,
				private _favoriteService: FavoriteService,
				private _txt: TranslationService,
				private _formBuilder: FormBuilder,
				private _toastr: ToastrService) {
	}

	public async ngOnInit(): Promise<void> {
		this.form = this._formBuilder.group({
			newListName: [null, Validators.required]
		});

		this.authenticated = this._context.authenticated;

		if (this.authenticated) {
			await this._loadLists();
		}
	}

	public ngAfterViewInit(): void {
		if (this.isExistingFavorite) {
			return;
		}

		let inputField: HTMLElement = <HTMLElement>document.querySelector('#newSearchTitle');
		if (inputField) {
			setTimeout(() => {
				inputField.focus();
			}, 0);
		}
	}

	private async _loadLists(): Promise<void> {
		this.loading = true;
		this.error = undefined;

		try {
			this.lists = await this._favoriteService.getAllFavoriteListsForSearch(this.deepLinkUrl);

			if (this.lists.length === 0) {
				// Benutzer hat noch keine Liste, daher automatisch eine erste erstellen
				let l = await this._favoriteService.createDefaultFavoriteList();
				this.lists.push(l);
			} else {
				let includedOnList = (this.lists.find(l => l.included));
				if (includedOnList) {
					let listDetail = await this._favoriteService.getFavoriteList(includedOnList.id);
					let item = listDetail.items.find((i: SearchFavorite) => i.url === this.deepLinkUrl) as SearchFavorite || <SearchFavorite>{};
					this.searchTitle = item.title;
					this.isExistingFavorite = true;
				}
			}
		} catch (err) {
			this.error = err;
		} finally {
			this.loading = false;
		}
	}

	public isEnabled(): boolean {
		return this.authenticated && !this.error && !this.success;
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
		this._changes.push(change);
	}

	public getToggleTooltip(list: FavoriteList): string {
		let remove = (list && list.included === true);
		return remove
			? this._txt.get('favorites.removeFavoriteFromList', 'Aus der Liste {0} entfernen', list.name)
			: this._txt.get('favorites.addFavoriteToList', 'Zu Liste {0} hinzufügen', list.name);
	}

	public showHideExistingLists(state: boolean, event?:any) {
		if (event) {
			event.stopPropagation();
		}
		this.showExistingLists = state;
		this.existingListsHeaderCss = (state) ? 'active icon--root' : 'collapsed';
		this.existingListsContentCss = (state) ? 'collapse in' : 'collapse';
	}

	public showHideAddNew(state: boolean, event?: any): void {
		if (event) {
			event.stopPropagation();
		}

		this.showAddNewListGroup = state;
		this.addNewHeaderCss = (state) ? 'active icon--root' : 'collapsed';
		this.addNewContentCss = (state) ? 'collapse in' : 'collapse';
	}

	public async addNewList(): Promise<void> {
		this.addNewListClicked = true;
		if (this.form.invalid) {
			console.log(this.form.controls.newListName.value, this.form.controls.newListName.errors);
			return;
		}

		try {
			let l = await this._favoriteService.addFavoriteList(this.form.controls.newListName.value);
			await this._loadLists();
			this.lists.find(list => list.id === l.id).included = true;
			this.toggleOn({ target: { checked: true }}, l);
		} catch (err) {
			this.error = err;
		} finally {
			this.showAddNewListGroup = false;
			this.addNewListClicked = false;
			this.showExistingLists = true;
			this.form.reset();
		}
	}

	public saveDialog() {
		this.addFavoriteClicked = true;
		if (_util.isEmpty(this.searchTitle)) {
			return;
		}

		if (_util.isEmpty(this._changes) && this.lists.filter(l => l.included).length === 0) {
			this._toastr.warning(
				this._txt.get('favorites.emptyListWarn', 'Bitte wählen Sie eine Favoritenliste, um die Suche den Favoriten hinzuzufügen.'),
				this._txt.get('favorites.emptyListWarnTitle', 'Keine Liste ausgewählt'));
			return;
		}

		let ids:any[] = [];
		for (let change of this._changes.reverse()) {
			if (ids.indexOf(change.id) === -1) {
				if (change.value) {
					let list = this.lists.filter(l => l.id === change.id)[0];
					const searchFavorite = new SearchFavorite();
					searchFavorite.url = this.deepLinkUrl;
					searchFavorite.kind = FavoriteKind.Search;
					searchFavorite.title = this.searchTitle;
					this._favoriteService.addFavorite(list.id, searchFavorite).then(() =>
						this._toastr.success(this._txt.get('favorites.saveSuccessfull', 'Favoriten erfolgreich mutiert.'))
					);
				} else {
					let list = this.lists.filter(l => l.id === change.id)[0];
					this._favoriteService.getFavoritesContainedOnList(list.id).then(items => {
						let containedList = items.filter(i => (<SearchFavorite>i).url === this.deepLinkUrl);
						let item = _util.isEmpty(containedList) ? null : containedList[0];
						if (item) {
							this._favoriteService.removeFavorite(change.id, item.id).then(() =>
								this._toastr.success(this._txt.get('favorites.saveSuccessfull', 'Favoriten erfolgreich mutiert.'))
							);
						}
					});
				}
				ids.push(change.id);
			}
		}
		this._changes = [];
		this.success = !this.error;
		if (this.success) {
			this.searchTitle = '';
			this.success = false;
			this.addFavoriteClicked = false;
			this.cancelDialog();
		}
	}

	public cancelDialog() {
		this.onClose.emit();
	}
}

class Change {
	public id: number;
	public value: any;
}
