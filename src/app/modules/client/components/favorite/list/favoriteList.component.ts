import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UrlService} from '../../../services/url.service';
import {Favorite, FavoriteKind, SearchFavorite, VeFavorite} from '../../../model/favorite/favorite';
import moment from 'moment';
import {FavoriteService} from '../../../services/favorite.service';
import {FavoriteList} from '../../../model/favorite/favoriteList';
import {ConfigService, Entity, Utilities as _util} from '@cmi/viaduc-web-core';
import {ShoppingCartService} from '../../../services/shoppingCart.service';
@Component({
	selector: 'cmi-viaduc-favorite-list',
	templateUrl: 'favoriteList.component.html',
	styleUrls: ['./favoriteList.component.less']
})
export class FavoriteListComponent implements OnInit, AfterViewInit {

	@Input()
	public list: FavoriteList;

	public veItems: VeFavorite[];
	public searchItems: SearchFavorite[];
	public hasActions: boolean;

	@Output()
	public onFavoriteRemoved: EventEmitter<void> = new EventEmitter<void>();

	@Output()
	public onExportFavorite: EventEmitter<void> = new EventEmitter<void>();

	public error: any;
	public viewerLinkBase: string;
	private readonly _elem: any;

	constructor(private _url: UrlService,
				private _favService: FavoriteService,
				private _scs: ShoppingCartService,
				public _config: ConfigService,
				private _elemRef: ElementRef) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this._groupList();
		this.viewerLinkBase = this._config.getSetting('viewer.url', '');
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	private _groupList(): void {
		this.veItems = [];
		this.searchItems = [];

		if (this.list && this.list.items) {
			this.list.items.forEach((f) => {
				if (f.kind === FavoriteKind.Ve) {
					this.veItems.push(<VeFavorite>f);
				} else {
					this.searchItems.push(<SearchFavorite>f);
				}
			});
		}
		this.hasActions = this._hasActions();
	}

	public getFormattedDate(dt: string) {
		return moment(dt).format('DD.MM.YYYY');
	}

	public async addToCart(item: VeFavorite) {
		const ve = <Entity> {
			archiveRecordId: item.veId,
			title: item.title,
		};

		await this._scs.addToCart(ve).subscribe();
	}

	public removeItem(item: Favorite) {
		this.error = undefined;

		this._favService.removeFavorite(this.list.id, item.id).then(() => {
			this.onFavoriteRemoved.emit();
		}, (e) => {
			this.error = e;
		});
	}

	// eslint-disable-next-line
	public exportItem(item: Favorite) {
		this.error = undefined;

		this._favService.exportFavoriteList(this.list.id).then(() => {
			this.onExportFavorite.emit();
		}, (e) => {
			this.error = e;
		});
	}

	private _hasActions(): boolean {
		return this.veItems && this.veItems.filter(i => i.canBeOrdered || i.hasPrimaryLink).length > 0;
	}

	public allListsAreEmpty(): boolean {
		return !this.list || _util.isEmpty(this.list.items);
	}

	public goToVe(item: VeFavorite): string {
		return this._url.getDetailUrl(item.veId);
	}
}
