import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AggregationEntry, Facet, FacetteAction, FacetteFilterItem, Utilities as _util} from '@cmi/viaduc-web-core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
	selector: 'cmi-viaduc-facette',
	templateUrl: 'searchFacette.component.html',
	styleUrls: ['./searchFacette.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('collapsedState', [
			state('collapsed', style({ height: 0 })),
			state('expanded', style({ height: '*' })),
			transition('void => expanded', [
				style({ height: 0 }),
				animate('250ms ease-in-out', style({ height: '*' }))
			]),
			transition('* => expanded', [
				style({ height: 0 }),
				animate('250ms ease-in-out', style({ height: '*' }))
			]),
			transition('expanded => collapsed', [
				style({ height: '*' }),
				animate('250ms ease-in-out', style({ height: 0 }))]),
		])
	]
})
export class SearchFacetteComponent implements OnInit {
	private _elem: any;

	@Input()
	public facette: Facet;

	@Input()
	public key: string = '';

	@Input()
	public facetteTitle: string = '';

	@Input()
	public collapsed: boolean = true;

	@Output()
	public onFilter = new EventEmitter<FacetteFilterItem>();

	@Output()
	public onFacetteShowAll = new EventEmitter<string>();

	@Input()
	public activeFilterStrings: string[] = [];

	public buttonCss: string;
	public ulCss: string;

	constructor(private _elemRef: ElementRef) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		_util.initJQForElement(this._elem);
		this._setCssClasses();
	}

	public isActive(filterString: string): boolean {
		return this.activeFilterStrings.filter((value) => value === filterString)[0] != null;
	}

	public applyFilter(agg: AggregationEntry): void {
		let ff = new FacetteFilterItem();
		ff.key = this.key;
		ff.chosenFilter = agg;
		ff.facette = this.facette;

		let filter = ff.chosenFilter.filter;
		let i = this.activeFilterStrings.findIndex((value) => value === filter);
		if (i !== -1) {
			ff.action = FacetteAction.Remove;
		} else {
			ff.action = FacetteAction.Add;
		}

		this.onFilter.emit(ff);
	}

	public showAll(facetteKey: string) {
		this.onFacetteShowAll.emit(facetteKey);
	}

	public toggle() {
		this.collapsed = !this.collapsed;
		this._setCssClasses();
	}

	private _setCssClasses(): void {
		this.buttonCss = this.getButtonCss();
		this.ulCss = this.getUlCss();
	}

	public getButtonCss(): string {
		return this.collapsed ? 'icon icon--before icon--root' : 'icon icon--before icon--greater active';
	}

	public getUlCss(): string {
		return this.collapsed ? 'limited' : 'in limited';
	}

	public get normalizedId(): string {
		return _util.toIdentifier(this.facetteTitle, true);
	}
}
