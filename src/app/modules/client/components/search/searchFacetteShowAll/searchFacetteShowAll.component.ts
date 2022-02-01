import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TranslationService} from '@cmi/viaduc-web-core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SearchFacetteComponent} from '../searchFacette/searchFacette.component';

@Component({
	selector: 'cmi-search-facette-show-all',
	templateUrl: './searchFacetteShowAll.component.html',
	styleUrls: ['./searchFacetteShowAll.component.less']
})
export class SearchFacetteShowAllComponent implements OnInit {
	@Input()
	public facette: SearchFacetteComponent;

	@Input()
	public collapsed: boolean;

	@Output()
	public onFacetteShowAll = new EventEmitter<string>();

	public displayText: SafeHtml;

	constructor(private _txt: TranslationService, private sanitizer: DomSanitizer) {
	}

	public ngOnInit(): void {
		this.displayText = this._getTranslated();
	}

	private _getTranslated(): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(this._txt.get('search.facetteEntry.weitereLaden', 'Weitere Laden'));
	}

	public loadAll() {
		this.onFacetteShowAll.emit(this.facette.key);
	}
}
