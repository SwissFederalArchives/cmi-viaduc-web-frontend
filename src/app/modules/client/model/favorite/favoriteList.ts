import {Favorite} from './favorite';

export interface FavoriteList {
	id: number;
	name: string;
	numberOfItems?: number;

	items: Favorite[];

	included?: boolean;
	dirty: boolean;

	active: boolean; // For indicating active menu item
}
