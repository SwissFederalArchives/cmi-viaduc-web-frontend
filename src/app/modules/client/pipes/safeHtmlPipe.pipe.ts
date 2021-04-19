import {PipeTransform, Pipe} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
	name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
	constructor(private _sanitizer: DomSanitizer) {
	}

	public transform(value) {
		return this._sanitizer.bypassSecurityTrustHtml(value);
	}
}
