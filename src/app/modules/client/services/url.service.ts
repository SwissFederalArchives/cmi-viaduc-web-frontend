import {Injectable} from '@angular/core';
import {ClientContext, Routing, SearchRequest, Utilities as _util} from '@cmi/viaduc-web-core';
import {Params, Router, UrlTree} from '@angular/router';

const externalLinkPart = 'link';
const referenceDelimiter = '--';

@Injectable()
export class UrlService {
	constructor(private _context: ClientContext, private _router: Router) {
	}

	public getDetailIdFromReference(reference: string): string {
		let id = reference;
		let i = reference.indexOf(referenceDelimiter);
		if (i > 0) {
			id = id.substring(0, i);
		}
		return id;
	}

	public localizeUrl(lang: string, url: string): string {
		let localized = url;
		if (lang !== Routing.defaultLanguage) {
			localized = Routing.localizePath(lang, localized);
		}
		if (Routing.languagePrefixMatcher.test(localized)) {
			localized = localized.substring(Routing.languagePrefixLength);
		}
		return _util.addToString('/' + lang, '/', localized);
	}

	public normalizeUrl(lang: string, url: string): string {
		let normalized = url;
		if (lang !== Routing.defaultLanguage) {
			normalized = Routing.normalizePath(lang, normalized);
		}
		if (Routing.languagePrefixMatcher.test(normalized)) {
			normalized = normalized.substring(Routing.languagePrefixLength);
		}
		return _util.addToString('/' + Routing.defaultLanguage, '/', normalized);
	}

	public getHomeUrl(): string {
		return this.localizeUrl(this._context.language, '/suche/einfach');
	}

	public getSearchUrl(): string {
		return this.localizeUrl(this._context.language, '/suche/resultat');
	}

	public getSimpleSearchUrl(): string {
		return this.localizeUrl(this._context.language, '/suche/einfach');
	}

	public getCheckutUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/bestellkorb/bestellung');
	}

	public getCheckoutEinsichtUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/bestellkorb/einsichtsgesuch');
	}

	public getContactUrl(): string {
		return this.localizeUrl(this._context.language, '/kontakt');
	}

	public getBestellkorbUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/bestellkorb');
	}

	public getBestellungenUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/bestellungen');
	}

	public getKontoBenutzeroberflaecheUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/benutzeroberflaeche');
	}

	public getAdvancedSearchUrl(): string {
		return this.localizeUrl(this._context.language, '/suche/erweitert');
	}

	public getArchiveTreeUrl(): string {
		return this.localizeUrl(this._context.language, '/suche/archivplan');
	}

	public getNutzungsbestimmungenUrl(): string {
		return this.localizeUrl(this._context.language, '/nutzungsbestimmungen-und-datenschutz');
	}

	public getErrorUrl(): string {
		return this.localizeUrl(this._context.language, '/error');
	}

	public getErrorSmartcardUrl(): string {
		return this.localizeUrl(this._context.language, '/error-smartcard');
	}

	public getSearchResultUrl(search?: string): string {
		let url: string = this.localizeUrl(this._context.language, '/suche/resultat');
		if (!_util.isEmpty(search)) {
			url += '?' + search;
		}
		return url;
	}

	public getSearchRequestFromQueryParams(qp: Params): SearchRequest {
		if (qp && qp.q) {
			let sq = new SearchRequest();
			sq.query = JSON.parse(qp.q);

			if (qp.pf) {
				sq.facetsFilters = JSON.parse(qp.pf);
			}
			if (qp.op) {
				sq.options = JSON.parse(qp.op);
			}
			if (qp.qs) {
				sq.paging = JSON.parse(qp.qs);
			}
			if (qp.as) {
				sq.advancedSearch = JSON.parse(qp.as);
			}

			return sq;
		} else {
			return null;
		}
	}

	public getUrlTreeFromSearchRequest(r: SearchRequest): UrlTree {
		let q = r.query ? JSON.stringify(r.query, undefined, 0) : undefined;
		let pf = r.facetsFilters ? JSON.stringify(r.facetsFilters, undefined, 0) : undefined;
		let op = r.options ? JSON.stringify(r.options, undefined, 0) : undefined;
		let qs = r.paging ? JSON.stringify(r.paging, undefined, 0) : undefined;
		let as = r.advancedSearch ? JSON.stringify(r.advancedSearch, undefined, 0) : undefined;
		let params: Params = <Params> {};

		if (q) {
			params.q = q;
		}
		if (pf) {
			params.pf = pf;
		}
		if (op) {
			params.op = op;
		}
		if (qs) {
			params.qs = qs;
		}
		if (as) {
			params.as = as;
		}
		params.eof = null;

		return this._router.createUrlTree([this.getSearchResultUrl()], { queryParams: params });
	}

	public getDetailUrl(id: string, title?: string): string {
		let url = this.localizeUrl(this._context.language, '/archiv/einheit/' + id);
		return url;
	}

	public getAccountUrl(): string {
		return this.localizeUrl(this._context.language, '/konto');
	}

	public getAccountUserDataUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/benutzerangaben');
	}

	public getRegisterInfo(): string {
		return this.localizeUrl(this._context.language, '/konto/kontoeroeffnung');
	}

	public getRegister(): string {
		return this.localizeUrl(this._context.language, '/konto/registrieren');
	}

	public getRegisterAndIdentifyInfo() {
		return this.localizeUrl(this._context.language, '/informationen/registrieren-und-identifizieren');
	}

	public getAccountFavoritesUrl(listId?: any): string {
		let url = this.localizeUrl(this._context.language, '/konto/favoriten');
		if (!_util.isEmpty(listId)) {
			url = _util.addToString(url, '/', listId);
		}
		return url;
	}

	public getOrderCheckoutUrl(): string {
		return this.localizeUrl(this._context.language, '/konto/bestellkorb/bestellung');
	}

	public getOrderingsUrl(listId?: any): string {
		let url = this.localizeUrl(this._context.language, '/konto/bestellungen');
		if (!_util.isEmpty(listId)) {
			url = _util.addToString(url, '/', listId);
		}
		return url;
	}

	public getExternalHostUrl(): string {
		const scheme = window.location.protocol;
		let url = scheme + '//' + window.location.hostname;
		if (scheme === 'http:' && window.location.port !== '80' || scheme === 'https:' && window.location.port !== '443') {
			url = _util.addToString(url, ':', window.location.port);
		}
		return url;
	}

	public getExternalBaseUrl(): string {
		return _util.addToString(this.getExternalHostUrl(), '/', window.location.pathname);
	}

	public getLastSearchUrl(search: SearchRequest): string {
		return this.getUrlTreeFromSearchRequest(search).toString();
	}

	public getExternalSearchUrl(search: SearchRequest): string {
		let url = this.getExternalBaseUrl();
		url = _util.addToString(url, '/', externalLinkPart, '/', this.getUrlTreeFromSearchRequest(search).toString());
		return url;
	}

	public getExternalDetailUrl(id: string, title?: string): string {
		let url = this.getExternalBaseUrl();
		url = _util.addToString(url, '/', externalLinkPart, '/', this.getDetailUrl(id, title));
		return url;
	}

	public getExternalRegisterAndIdentifyUrl(): string {
		let url = this.getExternalBaseUrl();
		url = _util.addToString(url, '#', this.getRegisterAndIdentifyInfo());
		return url;
	}

	public getExternalArchiveTreeUrl(): string {
		let url = this.getExternalBaseUrl();
		url = _util.addToString(url, '/', this.getArchiveTreeUrl());
		return url;
	}

	public setQuery(qs: string): void {
		let h = window.location.hash.split('?');
		window.location.hash = h[0] + '?' + qs;
	}
}
