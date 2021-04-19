import {AfterViewInit, Component, ElementRef, Input, OnInit} from '@angular/core';
import {EntityImage, Paging, Utilities as _util} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-detail-images',
	templateUrl: 'detailImages.component.html',
	styleUrls: ['./detailImages.component.less']
})
export class DetailImagesComponent implements OnInit, AfterViewInit {
	private _elem: any;

	@Input()
	public images: EntityImage[];

	public modalTitle: string;
	public modalAltText: string;
	public modalImage: string;
	public showCaption: boolean = false;

	public get items(): EntityImage[] {
		let p = this.paging;
		return this.images.length <= p.take ? this.images : this.images.slice(p.skip, Math.min(p.total, p.skip + p.take));
	}

	public paging: Paging = <Paging>{skip: 0, take: 4};

	constructor(private _elemRef: ElementRef) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this.paging.total = this.images.length;
		this.showCaption = false;
		this.images.forEach(item => {
			this.showCaption = (this.showCaption || !_util.isEmpty(item.caption));
		});
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public onPaged(paging: Paging): void {

	}

	public onModalFadeIn(item: EntityImage): void {
		this.modalTitle = item.caption;
		this.modalAltText = item.description || item.caption;
		this.modalImage = item.largeImageAsBase64;
	}

	public onModalFadeOut(): void {
		this.modalTitle = null;
		this.modalAltText = null;
		this.modalImage = null;
	}
}
