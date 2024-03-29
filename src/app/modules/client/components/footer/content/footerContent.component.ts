import {Component, ElementRef, AfterViewInit} from '@angular/core';
import {Utilities as _util} from '@cmi/viaduc-web-core';
import {ClientContext} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-footer-content',
	templateUrl: 'footerContent.component.html'
})
export class FooterContentComponent implements AfterViewInit {
	private _elem: any;

	constructor(private _context: ClientContext,
				private _elemRef: ElementRef) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public get language(): string {
		return this._context.language;
	}

}
