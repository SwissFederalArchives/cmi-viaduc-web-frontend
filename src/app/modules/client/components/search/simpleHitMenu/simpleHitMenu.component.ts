import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {ConfigService, Entity, UiService, Utilities as _util} from '@cmi/viaduc-web-core';
import {ShoppingCartService, UrlService} from '../../../services';
import {Router} from '@angular/router';

@Component({
	selector: 'cmi-viaduc-simple-hit-menu',
	templateUrl: 'simpleHitMenu.component.html',
	styleUrls: ['./simpleHitMenu.component.less'],
	host: {
		'(document:click)': 'checkOutsideClick($event)'
	},
	changeDetection: ChangeDetectionStrategy.Default,
	encapsulation: ViewEncapsulation.None
})
export class SimpleHitMenuComponent implements AfterViewInit, OnInit {
	@Input()
	public entity: Entity;

	@Input()
	public searchTerm: string;

	@Output()
	public menuClicked: EventEmitter<string> = new EventEmitter<string>();

	@ViewChild('favoriteMenu', {read: ElementRef, static: true})
	public favoriteMenu: ElementRef;

	public hasAccess: boolean;
	public showFavoritesMenu = false;
	public viewerLink: string;

	private _elem: any;

	constructor(private _elemRef: ElementRef,
				private _ui: UiService,
				private _scs: ShoppingCartService,
				private _router: Router,
				public _config: ConfigService,
				private _url: UrlService) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this.hasAccess = this._scs.canDownload(this.entity);
		const viewerLinkBase = this._config.getSetting('viewer.url', '');
		if (this.entity.manifestLink) {
			this.viewerLink = viewerLinkBase + this.entity.manifestLink;
			if (this.searchTerm != null && this.searchTerm  && this.searchTerm.length > 0) {
				this.viewerLink = this.viewerLink + '&q=' + this.searchTerm;
			}
		} else {
			this.viewerLink = null;
		}
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public callMenuAction(id: string) {
		this.menuClicked.emit(id);
	}

	public toggleFavoritesMenu(): void {
		this.showFavoritesMenu = !this.showFavoritesMenu;
	}

	public checkOutsideClick(event: any) {
		if (this.showFavoritesMenu
			&& this.favoriteMenu
			&& this.favoriteMenu.nativeElement
			&& this.favoriteMenu.nativeElement.parentNode
			&& !this._ui.detectInsideClick(event, this.favoriteMenu.nativeElement.parentNode)) {
			this.showFavoritesMenu = false;
		}
	}
	public handleFavoriteMenuClose() {
		this.showFavoritesMenu = false;
	}
	public goToDetailDownload() {
		this._router.navigate([this._url.getDetailUrl(this.entity.archiveRecordId)], {fragment: 'downloadSection'});
	}
}
