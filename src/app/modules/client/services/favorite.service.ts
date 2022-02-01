import {Injectable} from '@angular/core';
import {FavoriteList} from '../model/favorite/favoriteList';
import {
	Favorite,
	FavoriteKind,
	PendingMigrationCheckResult,
	SearchFavorite,
	VeFavorite
} from '../model/favorite/favorite';
import {CoreOptions, HttpService, TranslationService} from '@cmi/viaduc-web-core';
import {tap} from 'rxjs/operators';

@Injectable()
export class FavoriteService {

	private _apiUrl: string;
	private _totalFavorites: number = 0;

	constructor(private _options: CoreOptions,
				private _http: HttpService,
				private _txt: TranslationService) {
		this._apiUrl = this._options.serverUrl + this._options.privatePort + '/api/Favorites';
	}

	public getAllFavoriteLists(): Promise<FavoriteList[]> {
		const url = `${this._apiUrl}/GetAllLists`;
		return this._http.get<FavoriteList[]>(url, this._http.noCaching).pipe(tap((lists) => {
			this._totalFavorites = lists.reduce((count: number, l: FavoriteList) => count + l.numberOfItems, 0);
		})).toPromise();
	}

	public refreshItemsCount(): void {
		this.getTotalFavoritesCountFromServer().then((count) => {
			this._totalFavorites = count;
		});
	}

	public createDefaultFavoriteList(): Promise<FavoriteList> {
		let newListName = this._txt.get('favorites.defaultNewName', 'Favoritenliste 1');
		return this.addFavoriteList(newListName);
	}

	public totalFavoritesCount(): number {
		return (this._totalFavorites || 0);
	}

	public getTotalFavoritesCountFromServer(): Promise<number> {
		const url = `${this._apiUrl}/GetFavoriteCount`;
		return this._http.get<number>(url, this._http.noCaching).toPromise();
	}

	public getFavoritesContainedOnList(listId: number): Promise<Favorite[]> {
		const queryString = `?listId=${listId}`;
		const url = `${this._apiUrl}/GetFavoritesContainedOnList${queryString}`;
		return this._http.get<Favorite[]>(url, this._http.noCaching).toPromise();
	}

	public getAllFavoriteListsForEntity(veId: string): Promise<FavoriteList[]> {
		const queryString = `?veId=${veId}`;
		const url = `${this._apiUrl}/GetAllListsForVe${queryString}`;
		return this._http.get<FavoriteList[]>(url, this._http.noCaching).toPromise();
	}

	public getAllFavoriteListsForSearch(urlSearch: string): Promise<FavoriteList[]> {
		urlSearch = encodeURIComponent(urlSearch);
		const queryString = `?url=${urlSearch}`;
		const url = `${this._apiUrl}/GetAllListsForUrl${queryString}`;
		return this._http.get<FavoriteList[]>(url, this._http.noCaching).toPromise();
	}

	public getFavoriteList(listId: number): Promise<FavoriteList> {
		const queryString = `?listId=${listId}`;
		const url = `${this._apiUrl}/GetList${queryString}`;
		return this._http.get<FavoriteList>(url, this._http.noCaching).toPromise();
	}

	public addFavoriteList(name: string): Promise<FavoriteList> {
		name = encodeURIComponent(name);
		const queryString = `?listName=${name}`;
		const url = `${this._apiUrl}/AddList${queryString}`;
		return this._http.post<FavoriteList>(url, {}, this._http.noCaching).toPromise();
	}

	public removeFavoriteList(listId: number): Promise<void> {
		const queryString = `?listId=${listId}`;
		const url = `${this._apiUrl}/RemoveList${queryString}`;
		return this._http.post<void>(url, {}, this._http.noCaching).toPromise();
	}

	public renameFavoriteList(listId: number, newName: string): Promise<void> {
		newName = encodeURIComponent(newName);
		const queryString = `?listId=${listId}&newName=${newName}`;
		const url = `${this._apiUrl}/RenameList${queryString}`;
		return this._http.post<void>(url, {}, this._http.noCaching).toPromise();
	}

	public exportFavoriteList(listId: number): any {
		const queryString = `?listId=${listId}`;
		const url = `${this._apiUrl}/ExportList${queryString}`;
		return this._http.download(url);
	}

	public addFavorite(listId: number, favorite: Favorite): Promise<Favorite> {
		if (favorite.kind === FavoriteKind.Ve) {
			const url = `${this._apiUrl}/AddVeFavorite?listId=${listId}`;
			return this._http.post<VeFavorite>(url,  <VeFavorite>favorite, this._http.noCaching)
				.pipe(tap(() => { this._totalFavorites++; }))
				.toPromise<VeFavorite>();
		} else {
			const url = `${this._apiUrl}/AddSearchFavorite?listId=${listId}`;
			return this._http.post<SearchFavorite>(url,  <SearchFavorite> favorite, this._http.noCaching)
				.pipe(tap(() => { this._totalFavorites++; }))
				.toPromise<SearchFavorite>();
		}
	}

	public removeFavorite(listId: number, id: number): Promise<void> {
		const queryString = `?id=${id}&listId=${listId}`;
		const url = `${this._apiUrl}/RemoveFavorite${queryString}`;
		return this._http.post<void>(url, {}, this._http.noCaching).pipe(tap(() => { this._totalFavorites--; })).toPromise();
	}

	public currentUserHasPendingMigrations(): Promise<PendingMigrationCheckResult> {
		const url = `${this._apiUrl}/CurrentUserHasPendingMigrations`;
		return this._http.get<PendingMigrationCheckResult>(url, this._http.noCaching).toPromise();
	}

	public migrateFavorites(source: string): Promise<any> {
		const queryString = `?source=${source}`;
		const url = `${this._apiUrl}/MigrateFavorites${queryString}`;
		return this._http.post<any>(url, {}, this._http.noCaching).toPromise();
	}
}
