import {
	Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnInit, ViewChild
} from '@angular/core';
import {
	AdvancedSearchField, SearchField, FieldType, SearchFieldDefinition, TranslationService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {AdvancedSearchService} from '../../../../services/advancedSearch.service';
import {SearchSynonymeIconComponent} from '../../searchSynonyme/searchSynonymeIcon/searchSynonymeIcon.component';

@Component({
	selector: 'cmi-viaduc-advanced-search-field',
	templateUrl: 'advancedSearchField.component.html',
	styleUrls: ['./advancedSearchField.component.less']
})
export class AdvancedSearchFieldComponent implements OnInit, AfterViewInit {

	@ViewChild(SearchSynonymeIconComponent, { static: false })
	private searchSynonymeIconComponent: SearchSynonymeIconComponent;

	@Input()
	public selectedField: AdvancedSearchField;
	@Output()
	public changeSearchField = new EventEmitter<SearchField>();
	@Output()
	public deleteSearchField = new EventEmitter<SearchField>();

	public selectedDefinition: SearchFieldDefinition;
	public FieldType = FieldType;

	private _definitions: any[];
	private _elem: any;

	constructor(private _elemRef: ElementRef,
				private _adv: AdvancedSearchService,
				private _translationService: TranslationService) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this._definitions = this._adv.getPossibleSearchFields();
		this.selectedDefinition = this._definitions.filter(d => d.key === this.selectedField.key)[0];
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem, {translationService: this._translationService});
	}

	public deleteField(): void {
		this.deleteSearchField.emit(this.selectedField);
	}

	public getAvailableDefinitions(): any[] {
		return this._definitions;
	}

	public getUniqueTextboxName(): string {
		return this.selectedDefinition.key + '_' + this.selectedField.id;
	}

	public onSelectedChanged() {
		// nur Text/Fulltext-Felder können den Wert behalten
		const valueTypeIsSame = (this.selectedField.type === FieldType.Text || this.selectedField.type === FieldType.Fulltext)
			&& (this.selectedDefinition.type === FieldType.Text || this.selectedDefinition.type === FieldType.Fulltext);
		if (valueTypeIsSame) {
			this.selectedField.key = this.selectedDefinition.key;
		} else {
			this.selectedField = this._adv.createNewSearchField(this.selectedField.id, this.selectedDefinition);
			this.changeSearchField.emit(this.selectedField);
		}
	}

	public onDateRangeFieldValidate(valid: boolean) {
		this.selectedField.containsValidationErrors = !valid;
	}

	public onKeydownSearch (event: any) {
		this.searchSynonymeIconComponent.setSynonymSearchTimer();
	}

	public onAddSynonymToSearchClicked(searchString: string): void {
		// Gewählte Synonyme aus dem Dialog abfüllen
		this.selectedField.value = searchString;
	}

	public translateSearchFieldValue(searchField: any) {
		return this._translationService.get('metadata.searchFields.' + searchField.key, searchField.displayName);
	}
}
