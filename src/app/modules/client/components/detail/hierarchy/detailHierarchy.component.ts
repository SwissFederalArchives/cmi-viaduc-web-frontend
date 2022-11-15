import {AfterViewInit, Component, ElementRef, Input} from '@angular/core';
import {Router} from '@angular/router';
import {UrlService} from '../../../services/url.service';
import {Entity, Utilities as _util} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-detail-hierarchy',
	templateUrl: 'detailHierarchy.component.html',
	styleUrls: ['./detailHierarchy.component.less']
})
export class DetailHierarchyComponent implements AfterViewInit {
	@Input()
	public items: Entity[];

	@Input()
	public isBarUser: boolean;

	public inset: number = 1;
	private readonly _elem: any;

	constructor(private _elemRef: ElementRef,
				private _url: UrlService,
				private _router: Router) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public open(item: Entity): void {
		this._router.navigate([this._url.getDetailUrl(item.archiveRecordId, item.title)]);
	}
}
