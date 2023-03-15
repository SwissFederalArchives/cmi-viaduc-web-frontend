import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SearchFacetteComponent} from '../searchFacette/searchFacette.component';
import {AggregationEntry, TranslationService} from '@cmi/viaduc-web-core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
	selector: 'cmi-viaduc-facette-entry',
	templateUrl: 'searchFacetteEntry.component.html',
	styleUrls: ['./searchFacetteEntry.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFacetteEntryComponent implements OnInit {

	@Input()
	public agg: AggregationEntry;

	public displayText: SafeHtml;

	@Input()
	public active = false;

	@Input()
	public facette: SearchFacetteComponent;

	@Input()
	public collapsed: boolean;

	public liCss: string;

	constructor(private _txt: TranslationService, private sanitizer: DomSanitizer) {
	}

	public ngOnInit(): void {
		this.displayText = this._getTranslated();
		this.liCss = this._getLiCss();
	}

	public toggleActive(): void {
		this.facette.applyFilter(this.agg);
		this.active = !this.active;
		this.liCss = this._getLiCss();
	}

	private _getLiCss(): string {
		return this.active ? 'active' : '';
	}

	private _getTranslated(): SafeHtml {
		if (!this.agg) {
			return '';
		}

		const valueString = this.agg.keyAsString;
		if (valueString === 'true') {
			return this._txt.get('search.facetteEntry.ja', 'Ja');
		} else if (valueString === 'false') {
			return this._txt.get('search.facetteEntry.nein', 'Nein');
		} else {
			const key = this.agg.key;
			// The key is usually the keyword for the translation if there is no translation for the facet, it is the German text.
			let translated = (this._txt.has(key) ) ? this._txt.get(key) : key;
			if (this.facette.key === 'aggregationFields.creationPeriodYears' && translated.indexOf('-') > 0 ) {
				// - für screenreader durch 'bis' ersetzen..
				const bis = this._txt.get('search.facetteEntry.bis', 'bis');
				translated =  translated.replace('-', '<span class="sr-only">' + bis + '</span><span aria-hidden="true"> - </span>');
			}
			return this.sanitizer.bypassSecurityTrustHtml(translated);
		}
	}
}
