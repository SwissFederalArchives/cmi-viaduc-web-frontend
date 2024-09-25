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
	public searchTerm: string

	@Input()
	public archiveRecordId: string

	@Input('manifestLink') set _manifestLink(value: string)	{
		this.manifestLink = value;
		this.setLink();
	}

	@Input('viewerLink') set _viewerLink(value: string)	{
		this.viewerLink = value;
		this.setLink();
	}

	@Input('searchTerm') set _searchTerm(value: string)	{
		this.searchTerm = value;
		this.setLink();
	}

	public viewerText: string;
	public link: string;

	constructor(private _txt: TranslationService,
				private _fileTokenService: DownloadTokenService) {
	}

	public ngOnInit(): void {
		this.viewerText = this._txt.translate('Konsultieren Sie die Unterlagen', 'onlineViewer.infoText');
		this.setLink();
	}

	private setLink() {
		if (this.searchTerm?.length > 3) {
			this.link = this.viewerLink + this.manifestLink + this.searchTerm;
		} else {
			this.link = this.viewerLink + this.manifestLink;
		}
	}

	public logViewerClick() {
		this._fileTokenService.logViewerClick(this.archiveRecordId).subscribe();
	}
}
