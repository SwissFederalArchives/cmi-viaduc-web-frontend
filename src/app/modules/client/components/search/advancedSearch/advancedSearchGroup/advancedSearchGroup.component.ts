import {Component, Input, Output, EventEmitter, ElementRef, AfterViewInit} from '@angular/core';
import {AdvancedSearchGroup, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {AdvancedSearchService} from '../../../../services/advancedSearch.service';

@Component({
	selector: 'cmi-viaduc-advanced-search-group',
	templateUrl: 'advancedSearchGroup.component.html',
	styleUrls: ['./advancedSearchGroup.component.less']
})
export class AdvancedSearchGroupComponent implements AfterViewInit {

	@Input()
	public viewModel: AdvancedSearchGroup;

	@Output()
	public deleteSearchGroup = new EventEmitter<AdvancedSearchGroup>();

	private _elem: any;

	constructor(private _elemRef: ElementRef,
				private _adv: AdvancedSearchService,
				private _translationService: TranslationService) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem, {translationService: this._translationService});
	}

	public deleteGroup(): void {
		this.deleteSearchGroup.emit(this.viewModel);
	}

	public addField(): void {
		let field = this._adv.addNewSearchField(this.viewModel);
		this.viewModel.searchFields.push(field);
	}

	public getUniqueNameForAndOption(): string {
		return 'AND_' + this.viewModel.id;
	}

	public getUniqueNameForOrOption(): string {
		return 'OR_' + this.viewModel.id;
	}

	public getUniqueNameForNotOption(): string {
		return 'NOT_' + this.viewModel.id;
	}
}
