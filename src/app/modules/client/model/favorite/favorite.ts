// Keep in sync with API
export enum FavoriteKind {
	Ve = 1,
	Search = 2
}

export interface Favorite {
	id: number;
	title: string;
	createdAt: string;
	kind: FavoriteKind;
}

export class VeFavorite implements Favorite {
	public listId: number;
	public veId: string;
	public referenceCode: string;
	public title: string = this.referenceCode;
	public creationPeriod: string;
	public level: string;
	public createdAt: string;
	public canBeOrdered: boolean;
	public canBeDownloaded: boolean;
	public kind: FavoriteKind = FavoriteKind.Ve;
	public id: number;
}

export class SearchFavorite implements Favorite {
	public id: number;
	public title: string;
	public createdAt: string;
	public kind: FavoriteKind = FavoriteKind.Search;
	public url: string;
	public searchId: string;
}

export class PendingMigrationCheckResult {
	public pendingLocal: number;
	public pendingPublic: number;
}
