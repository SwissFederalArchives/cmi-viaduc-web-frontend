import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ClientContext, SearchRequest, TranslationService} from '@cmi/viaduc-web-core';
import {SeoService, UrlService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-simple-search-page',
	templateUrl: 'simpleSearchPage.component.html'
})
export class SimpleSearchPageComponent implements OnInit {
	constructor(private _context: ClientContext,
				private _url: UrlService,
				private _router: Router,
				private _txt: TranslationService,
				private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Einfache Suche', 'simpleSearchPageComponent.pageTitle'));
	}

	public onSearch(request: SearchRequest): void {
		this._context.search.request = request;
		this._context.search.request.advancedSearch = false;
		this._router.navigate([this._url.getSearchResultUrl()]);
	}
}
