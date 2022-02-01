import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ClientContext, TranslationService, Utilities as _util, CookieService} from '@cmi/viaduc-web-core';
import {AuthorizationService, FavoriteService, ShoppingCartService} from '../../../services';
import {UrlService} from '../../../services';
import {AuthenticationService} from '../../../services';

@Component({
	selector: 'cmi-viaduc-header-content',
	templateUrl: 'headerContent.component.html',
	styleUrls: ['./headerContent.component.less'],
})
export class HeaderContentComponent implements OnInit, AfterViewInit {
	private _elem: any;
	private _languages: any[];

	constructor(private _context: ClientContext,
				private _txt: TranslationService,
				private _url: UrlService,
				private _cookieService: CookieService,
				private _router: Router,
				private _elemRef: ElementRef,
				private _scs: ShoppingCartService,
				private _fav: FavoriteService,
				private _authentication: AuthenticationService,
				private _authorization: AuthorizationService) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public get shoppingCartItemsCount(): number {
		return this._scs.totalItemsInCart;
	}

	public get favoritesItemCount(): number {
		return (this._fav.totalFavoritesCount() || 0);
	}

	public getAdminUrlTranslated(): string {
		switch (this.language) {
			case 'fr':
				return 'https://www.admin.ch/gov/fr/accueil.html';
			case 'en':
				return 'https://www.admin.ch/gov/it/pagina-iniziale.html';
			case 'it':
				return 'https://www.admin.ch/gov/en/start.html';
			default:
				return 'https://www.admin.ch/gov/de/start.html';
		}
	}

	private refresh(): void {
		let ls = this._languages = (this._languages || []);
		if (_util.isEmpty(ls)) {
			for (let i = 0; i < this._txt.supportedLanguages.length; i += 1) {
				let l = {...this._txt.supportedLanguages[i]};
				ls.push(l);
			}
		}
		for (let i = 0; i < this._languages.length; i += 1) {
			let l = this._languages[i];
			l.active = (l.key === this._context.language);
			l.label = l.name;
		}
	}

	public get versionInfo(): string {
		let v = this._context.client.version;
		return v ? `${v.major}.${v.minor}.${v.revision}.${v.build}` : void 0;
	}

	public get languages(): any[] {
		this.refresh();
		return this._languages;
	}

	public get language(): string {
		return this._context.language;
	}

	public isActive(lang: any): boolean {
		return lang.key === this._context.language;
	}

	public setLanguage(lang: any): void {
		const parts = this._router.url.split('?');
		let path: string = parts[0];
		let params = '';
		if (parts.length > 1) {
			params = '?' + parts.filter(p => p !== parts[0]).join();
		}
		path = this._url.normalizeUrl(this.language, path);

		// hier wird neu mittels hard-refresh die ganze SPA neu geladen, damit die externen JS-Libraries (unblu) die Sprachfiles nachladen...
		window.location.hash = this._url.localizeUrl(lang.key, path) +  params;

		// altes cookie korrigieren, damit Sprachwechsel wirksam ist
		this._cookieService.put('viaduc_language', lang.key);

		window.location.reload();
	}

	public login(): void {
		this._authentication.login();
	}

	public logout(): void {
		this._authentication.logout();
	}

	public accountUrl(): string {
		return '#/' + this._url.getAccountUrl();
	}

	public favoriteUrl(): string {
		return '#/' + this._url.getAccountFavoritesUrl();
	}

	public bestelluebersichtAendernUrl(): string {
		return '#/' + this._url.getBestellungenUrl();
	}

	public einstellungenUrl(): string {
		return '#/' + this._url.getKontoBenutzeroberflaecheUrl();
	}

	public benutzerDatenUrl(): string {
		return '#/' + this._url.getAccountUserDataUrl();
	}

	public get authenticated(): boolean {
		return this._context.authenticated;
	}

	public get username(): string {
		return this._context.currentSession.username;
	}

	public getRegisterInfoUrl(): string {
		return '#/' + this._url.getRegisterInfo();
	}

	public getLangTitle(lang: any): string {
		let  title = lang.label;
		if (lang.active) {
			title += ` ${this._txt.translate('Aktiv', 'headerContent.component.aktiv')}`;
		}
		return title;
	}

	public hasRoles(...roles: string[]): boolean {
		return !!roles.find(r => this._authorization.hasRole(r));
	}

	public getTooltippLoggedIn(): string {
		return this._txt.translate('Weitere Informationen zu Ihrem Benutzerstatus finden Sie auf der Seite "Registrieren & Identifizieren" ' +
			'unter dem Menü "Informationen".', 'headerContent.component.toolTippLoggedIn');
	}

	public getTooltippRegisteredUser(): string {
		return this._txt.translate('Als registrierte/r Benutzer/in haben Sie Zugriff auf die öffentlich zugänglichen Daten im Bundesarchiv. ' +
			'Um sämtliche Daten nutzen zu können, müssen Sie sich vorgängig identifizieren (siehe Seite "Benutzerstatus" im "Benutzerkonto")', 'headerContent.component.toolTippLoggedInAsRegisteredUser');
	}
}
