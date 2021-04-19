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

		let value = this.agg.key;
		let valueString = this.agg.keyAsString;
		if (valueString === 'true') {
			return this._txt.get('search.facetteEntry.ja', 'Ja');
		} else if (valueString === 'false') {
			return this._txt.get('search.facetteEntry.nein', 'Nein');
		} else {
			const key = value;
			let parts = value.split('.');
			let text = parts[parts.length - 1];

			if (text.indexOf('-') > 0) {
				// - für screenreader durch 'bis' ersetzen..
				const bis = this._txt.get('search.facetteEntry.bis', 'bis');
				text =  text.replace('-', '<span class="sr-only">' + bis + '</span><span aria-hidden="true"> - </span>');
			}
			const translated = (this._txt.has(key) || (key.indexOf('.') > 0)) ? this._txt.get(key, text) : text;
			return this.sanitizer.bypassSecurityTrustHtml(translated);
		}
	}
}
