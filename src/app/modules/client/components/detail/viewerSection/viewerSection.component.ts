import {Component, Input, OnInit} from '@angular/core';
import { TranslationService} from '@cmi/viaduc-web-core';
import {DownloadTokenService} from '../../../services/downloadToken.service';

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

	@Input()
	public archiveRecordId: string

	public viewerText: string;
	public link: string;

	constructor(private _txt: TranslationService,
				private _fileTokenService: DownloadTokenService) {
	}

	public ngOnInit(): void {
		this.viewerText = this._txt.translate('Konsultieren Sie die Unterlagen', 'onlineViewer.infoText');
		this.link = this.viewerLink + this.manifestLink;
	}

	public logViewerClick() {
		this._fileTokenService.logViewerClick(this.archiveRecordId).subscribe();
	}
}
