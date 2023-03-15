import {Component, Input, OnInit} from '@angular/core';
import { TranslationService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-viewer-section',
	templateUrl: './viewerSection.component.html',
	styleUrls: ['./viewerSection.component.less']
})
export class ViewerSectionComponent implements OnInit {
	@Input()
	public manifestLink: string;

	@Input()
	public viewerLink: string

	public viewerText: string;
	public link: string;

	constructor(private _txt: TranslationService) {
	}

	public ngOnInit(): void {
		this.viewerText = this._txt.translate('Konsultieren Sie die Unterlagen', 'onlineViewer.infoText');
		this.link = this.viewerLink + this.manifestLink;
	}
}
