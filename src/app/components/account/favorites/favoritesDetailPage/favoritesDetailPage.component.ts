import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FileSaverService, TranslationService} from '@cmi/viaduc-web-core';
import {FavoriteList} from '../../../../modules/client/model';
import {FavoriteListsComponent} from '../../../../modules/client/components';
import {FavoriteService, SeoService, UrlService} from '../../../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-account-favorites-detail-page',
	templateUrl: 'favoritesDetailPage.component.html',
	styleUrls: ['./favoritesDetailPage.component.less']
})
export class AccountFavoritesDetailPageComponent implements OnInit {
	public loading: boolean;
	public error: any;

	public crumbs: any[] = [];
	public list: FavoriteList;

	public showRenameField = false;
	public newListName = '';
	public showDeleteModal = false;

	@ViewChild('leftNavFavorites', { static: true})
	public leftNavFavorites: FavoriteListsComponent;

	constructor(private _favoriteService: FavoriteService,
				private _txt: TranslationService,
				private _url: UrlService,
				private _router: Router,
				private _route: ActivatedRoute,
				private _seoService: SeoService,
				private _fileSaver: FileSaverService) {

	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Favoritenliste', 'accountFavoritesDetailPageComponent.pageTitle'));
		this._buildCrumbs();
		this._route.params.subscribe(params => this._loadList(params['id']));
	}

	private _buildCrumbs(): void {
		const crumbs: any[] = this.crumbs = [];
		crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});
		crumbs.push({url: this._url.getAccountUrl(), label: this._txt.get('breadcrumb.account', 'Konto')});
		crumbs.push({
			url: this._url.getAccountFavoritesUrl(),
			label: this._txt.get('breadcrumb.favorites', 'Favoriten')
		});
		if (this.list) {
			crumbs.push({label: this.list.name});
		}
	}

	private async _loadList(listId: number): Promise<void> {
		this.loading = true;
		this.list = undefined;
		this.error = undefined;

		try {
			this._favoriteService.getFavoriteList(listId).then(
				list => {
					this.list = list;
					if (this.list) {
						this.newListName = this.list.name;
					}

					this._buildCrumbs();
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

	public toggleRenameField(): void {
		this.showRenameField = !this.showRenameField;
	}

	public async onFavoriteRemoved(): Promise<void> {
		this._loadList(this.list.id);
		this.leftNavFavorites.refresh().then(() => {
			return;});
	}

	public doRename(): void {
		this._favoriteService.renameFavoriteList(this.list.id, this.newListName)
			.then(() => {
				this.list.name = this.newListName;
				this._buildCrumbs();
				this.toggleRenameField();
				this.leftNavFavorites.refresh().then(() => {
					return
				});
			}, (e) => {
				this.error = e;
				this.newListName = this.list.name;
			});
	}

	public toggleDeleteModal() {
		this.showDeleteModal = !this.showDeleteModal;
	}

	public removeList(): void {
		this._favoriteService.removeFavoriteList(this.list.id).then(() => {
			this.leftNavFavorites.refresh().then(() => {
				this._router.navigate([this._url.getAccountFavoritesUrl()]);
			});
		}, (e) => {
			this.error = e;
		});
	}

	public exportList(): void {
		this._favoriteService.exportFavoriteList(this.list.id).subscribe(
			event => {
				this._fileSaver.saveDownloadResponseToFile(event);
			},
			(e) => {
				this.loading = false;
				this.error = e;
			},
			() => {
				this.loading = false;
			});
	}
}
