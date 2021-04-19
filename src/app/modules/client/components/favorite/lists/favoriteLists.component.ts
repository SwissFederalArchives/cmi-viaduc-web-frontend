import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FavoriteList} from '../../../../client/model/favorite/favoriteList';
import {FavoriteService} from '../../../services/favorite.service';
import {UrlService} from '../../../services/url.service';

@Component({
	selector: 'cmi-viaduc-favorite-lists',
	templateUrl: 'favoriteLists.component.html',
	styleUrls: ['./favoriteLists.component.less']
})
export class FavoriteListsComponent implements OnInit {
	public loading: boolean;
	public error: any;

	public crumbs: any[] = [];
	public lists: FavoriteList[];

	constructor(private _favoriteService: FavoriteService, private _url: UrlService, private _router: Router, private _route: ActivatedRoute) {
	}

	public async refresh(): Promise<void> {
		await this._loadLists();
	}

	private async _loadLists(): Promise<void> {
		this.loading = true;

		this.error = undefined;
		try {
			this._favoriteService.getAllFavoriteLists().then(
				lists => {
					this.lists = lists;
					this._route.params.subscribe(params => this.setActiveMenuItem(parseInt(params['id'], 10)));
				},
				err => {
					this.error = err;
				}
			);
		} catch (err) {
			this.error = err;
		} finally {
			this.loading = false;
		}
	}

	public ngOnInit(): void {
		this._loadLists();
	}

	public goTo(list: FavoriteList): void {
		this._router.navigate([this._url.getAccountFavoritesUrl('' + list.id)]);
	}

	public getFavoritesLink(): string {
		return this._url.getAccountFavoritesUrl();
	}

	private setActiveMenuItem(id: number) {
		// Mark all inactive
		this.lists.forEach(s => s.active = false);

		const activeItem = this.lists.find(s => s.id === id);
		if (activeItem) {
			activeItem.active = true;
		}
	}
}
