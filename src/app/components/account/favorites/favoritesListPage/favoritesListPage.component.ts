import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslationService, Utilities as _util } from '@cmi/viaduc-web-core';
import { FavoriteListsComponent } from '../../../../modules/client/components';
import { FavoriteService, SeoService, UrlService } from '../../../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-account-favorites-page',
	templateUrl: 'favoritesListPage.component.html',
	styleUrls: ['./favoritesListPage.component.less']
})
export class AccountFavoritesListPageComponent implements OnInit {
	public crumbs: any[] = [];
	public showAddNewModal: boolean = false;
	public newListName: string;
	public error: any;

	@ViewChild('favoriteList')
	public favoriteList: FavoriteListsComponent;

	constructor(private _txt: TranslationService,
		private _fav: FavoriteService,
		private _url: UrlService,
		private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Online-Zugang zum Bundesarchiv Favoritenliste', 'accountFavoritesListPageComponent.pageTitle'));
		this._buildCrumbs();
	}

	private _buildCrumbs(): void {
		let crumbs: any[] = this.crumbs = [];
		crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		crumbs.push({ url: this._url.getAccountUrl(), label: this._txt.get('breadcrumb.account', 'Konto') });
		crumbs.push({
			url: this._url.getAccountFavoritesUrl(),
			label: this._txt.get('breadcrumb.favorites', 'Favoriten')
		});
	}

	public toggleModal(): void {
		this.showAddNewModal = !this.showAddNewModal;
	}

	public createNewList(): void {
		this.error = undefined;

		this._fav.addFavoriteList(this.newListName).then(() => {
			this.favoriteList.refresh().then(() => {
				this.toggleModal();
				this.newListName = undefined;
			}, (e) => {
				this.error = e;
			});
		}, (err) => {
			this.error = err;
		});
	}

	public listNameIsNullOrEmpty(): boolean {
		return _util.isEmpty(this.newListName);
	}

	public refreshList() {
		this.favoriteList.refresh().then(() => {});
	}
}
