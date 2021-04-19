import {
	ChangeDetectionStrategy,
	Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';

import {
	ClientContext, Facet, FacetteAction, FacetteFilter, FacetteFilterItem,
	Utilities as _util
} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-facette-list',
	templateUrl: 'searchFacetteList.component.html',
	styleUrls: ['./searchFacetteList.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchFacetteListComponent implements OnInit, OnChanges {
	get collapsed(): boolean {
		return this._collapsed;
	}
	@Input()
	set collapsed(value: boolean) {
		this._collapsed = value;
		this.collapsedChange.emit(this._collapsed);
	}

	@Output()
	public collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	public facetts: Facet[] = [];

	@Output()
	public onToggle = new EventEmitter<boolean>();

	@Output()
	public onFilter = new EventEmitter<FacetteFilter[]>();

	public activeFacets: FacetteFilter[] = [];

	private _elem: any;
	private _collapsed: boolean = false;
	private _existingWidth: number = 0;

	constructor(private _elemRef: ElementRef, private _context: ClientContext) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		_util.initJQForElement(this._elem);
		this._existingWidth = window.innerWidth;
		if (!this.activeFacets) {
			this.activeFacets = [];
		}

		if (this._context.search &&
			this._context.search.request &&
			this._context.search.request.query &&
			this._context.search.request.facetsFilters) {
			for (let af of this._context.search.request.facetsFilters) {
				let aa = <FacetteFilter> {filters: []};
				aa.facet = af.facet;

				for (let f of aa.filters) {
					aa.filters.push(f);
				}

				this.activeFacets.push(af);
			}
		}
	}

	public ngOnChanges(changes: SimpleChanges): void {
		this.RemoveOutdatedFacetts();
	}

	@HostListener('window:resize', ['$event'])
	public onResize(event: any) {
		let width = event.target.innerWidth;

		if (this._existingWidth === width) {
			// "Bug" in Safari, height changes on first scroll and triggers window.resize
			// so we react to a resize only when width changes
			// https://stackoverflow.com/a/29940941/6057338
			return;
		}

		this._existingWidth = window.innerWidth;

		if (width <= 1200) {
			if (!this._collapsed) {
				this.toggleStatus();
			}
		}
		if (width > 1200) {
			if (this._collapsed) {
				this.toggleStatus();
			}
		}
	}

	public hasItems(fac: Facet): boolean {
		return ((fac != null &&
			fac.items != null &&
			fac.items.length > 0)
			||
			(fac != null &&
				fac.aggregations != null &&
				fac.aggregations.length > 0 &&
				fac.aggregations[0].items != null &&
				fac.aggregations[0].items.length > 0));

	}

	public toggleStatus(): void {
		this._collapsed = !this._collapsed;
		this.onToggle.emit(this._collapsed);
	}

	public resetFilters(emitSearch: boolean = true): void {
		this.activeFacets = [];
		if (emitSearch) {
			this.onFilter.emit(this.activeFacets);
		}
	}

	public getActiveFacetCount(): number {
		let facets = [];
		for (let f of this.activeFacets) {
			for (let filter of f.filters) {
				facets.push(filter);
			}
		}
		return facets.length;
	}

	public getActiveFilterStringsForFacette(key: string) {
		let fac = this.activeFacets.filter(f => f.facet === key)[0];
		if (fac) {
			return fac.filters;
		}
		return [];
	}
	public onFilterApplied(ff: FacetteFilterItem) {
		let fac = this.activeFacets.filter((value) => value.facet === ff.key)[0];
		if (!fac) {
			fac = <FacetteFilter> {filters: []};
			fac.facet = ff.key;
			this.activeFacets.push(fac);
		}
		let filter = fac.filters.filter((value) => value === ff.chosenFilter.filter)[0];
		if (!filter && ff.action === FacetteAction.Add) {
			this.activeFacets.filter((value) => value.facet === ff.key)[0].filters.push(ff.chosenFilter.filter);
		} else if (ff.action === FacetteAction.Remove) {
			this.deleteFacetteFilter(fac, ff.chosenFilter.filter);
		}

		this.onFilter.emit(this.activeFacets);
	}
	public deleteFacetteFilter(ff: FacetteFilter, filterstring: string) {
		// remove filter string from facetgroup
		let index: number = this.activeFacets.filter((value2) => value2.facet === ff.facet)[0].filters.findIndex((value, i, obj) => value === filterstring);
		if (index !== -1) {
			this.activeFacets.filter((value) => value.facet === ff.facet)[0].filters.splice(index, 1);
		}
		// remove facetgroup if it has no filterstrings
		let hasItems = this.activeFacets.filter((value) => value.facet === ff.facet)[0].filters.length > 0;
		if (!hasItems) {
			let i = this.activeFacets.findIndex((value) => value.facet === ff.facet);
			if (i !== -1) {
				this.activeFacets.splice(i, 1);
			}
		}
	}

	public RemoveOutdatedFacetts() {
		for (let activeFacette of this.activeFacets) {
			const matchedFacette = this.facetts[activeFacette.facet];
			if (matchedFacette == null) {
				for (let originalFilterName of activeFacette.filters) {
					activeFacette.filters.splice(activeFacette.filters.findIndex(value => value === originalFilterName), 1);
				}
			} else {
				for (let filterName of activeFacette.filters) {
					const filterKeyIndex = matchedFacette.items.findIndex(value => value.filter === filterName);
					if (filterKeyIndex === -1) {
						activeFacette.filters.splice(activeFacette.filters.findIndex(value => value === filterName), 1);
					}
				}
			}
		}
	}
}
