import {Component, ElementRef, AfterViewInit, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {ClientContext, ConfigService, PreloadService, Utilities as _util} from '@cmi/viaduc-web-core';
import {NavigationStart, Router} from '@angular/router';
import {ShoppingCartService, UrlService, AuthenticationService} from '../../../services';
import {UnbluService} from '../../../services/unblu.service';
import {ChatBotService} from '../../../services';

@Component({
	selector: 'cmi-viaduc-nav-content',
	templateUrl: 'navigationContent.component.html',
	styleUrls: ['./navigationContent.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class NavigationContentComponent implements AfterViewInit {
	private _elem: any;
	public mobileMainNavOpen = false;
	public mobileUserNavOpen = false;

	constructor(private _context: ClientContext,
				private _elemRef: ElementRef,
				private _url: UrlService,
				private _bot: ChatBotService,
				private _cfg: ConfigService,
				private _unblu: UnbluService,
				private _pre: PreloadService,
				private _scs: ShoppingCartService,
				private _authentication: AuthenticationService,
				private _router: Router) {
		this._elem = this._elemRef.nativeElement;

		this._router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (this.mobileMainNavOpen) {
					this.toggleMainMobileNav();
				}
				if (this.mobileUserNavOpen) {
					this.toggleUserMobileNav();
				}
			}
		});
	}

	@Output()
	public onMobileNavOpen: EventEmitter<boolean> = new EventEmitter<boolean>();

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public get chatBotEnabled(): boolean {
		if (!this._pre.isPreloaded) {
			return false;
		}

		const supportedLanguages = this._cfg.getSetting('chatbot.supportedLanguagesForChatBot', 'de').split(';');
		return supportedLanguages.filter(l => l === this._context.language).length > 0;
	}

	public get lastSearchResult(): string {
		return this._context.lastSearchLink;
	}

	public get language(): string {
		return this._context.language;
	}

	public get cartItemsCount(): number {
		return this._scs.totalItemsInCart;
	}

	public toggleMainMobileNav(): void {
		this.mobileMainNavOpen = !this.mobileMainNavOpen;
		if (this.mobileUserNavOpen) {
			this.mobileUserNavOpen = false;
			this.onMobileNavOpen.emit(this.mobileUserNavOpen);
		}

		this.onMobileNavOpen.emit(this.mobileMainNavOpen);
	}

	public getMainMobileNavCss(): string {
		return (this.mobileMainNavOpen || this.mobileUserNavOpen) ? 'nav-mobile nav-open' : 'nav-mobile nav';
	}

	public getMainTableNavCss(): string {
		return this.mobileMainNavOpen ? 'table-row nav-open' : 'table-row nav';
	}

	public getMainTableCellNavCss(): string {
		return this.mobileMainNavOpen ? 'table-cell dropdown open' : 'table-cell dropdown';
	}

	public toggleUserMobileNav(): void {
		this.mobileUserNavOpen = !this.mobileUserNavOpen;
		if (this.mobileMainNavOpen) {
			this.mobileMainNavOpen = false;
			this.onMobileNavOpen.emit(this.mobileMainNavOpen);
		}

		this.onMobileNavOpen.emit(this.mobileUserNavOpen);
	}

	public getUserTableCellNavCss(): string {
		return this.mobileUserNavOpen ? 'table-cell dropdown open' : 'table-cell dropdown';
	}

	public get drillDownCointainerHeight(): string {
		let dropdownHeight = (window.screen.height) - 91;
		return (this.mobileUserNavOpen || this.mobileMainNavOpen) ? dropdownHeight + 'px' : 'auto';
	}

	public get authenticated(): boolean {
		return this._context.authenticated;
	}

	public login(): void {
		this._authentication.login();
	}

	public register(): void {
		this._router.navigate([this._url.getRegisterInfo()]);
	}

	public logout(): void {
		this._authentication.logout();
	}

	public goToAccount(): void {
		this._router.navigate([this._url.getAccountUrl()]);
	}

	public goToAccountUserData(): void {
		this._router.navigate([this._url.getAccountUserDataUrl()]);
	}

	public goToFavourites(): void {
		this._router.navigate([this._url.getAccountFavoritesUrl()]);
	}

	public goToBestelluebersichtAendern(): void {
		this._router.navigate([this._url.getBestellungenUrl()]);
	}

	public goToEinstellungen(): void {
		this._router.navigate([this._url.getKontoBenutzeroberflaecheUrl()]);
	}

	public openChat() {
		this._unblu.openChat();
		this.toggleMainMobileNav();
	}

	public openBot() {
		if (this.chatBotEnabled) {
			this._bot.openChatBot();
			this.toggleMainMobileNav();
		}
	}

	private _executeMenuItem(id: string) {
		switch (id) {
			case 'openchat':
				this.openChat();
				break;
			case 'openchatbot':
				this.openBot();
				break;
			case 'closeNav':
				this.toggleMainMobileNav();
				break;
			default:
				console.log('unknown menu id', id);
				break;
		}
	}

	public nullifyClick(event: any): void {
		let senderElementName = event.target.tagName.toLowerCase();
		if (senderElementName !== 'a' && senderElementName !== 'button') {
			event.stopPropagation();
		} else {
			// something from ci/cd removes click handler of some mobile-nav-items, so execute it this way
			let id = event.target.getAttribute('menuid');
			if (id) {
				this._executeMenuItem(id);
				event.stopPropagation();
			}
		}
	}
}
