import {Component, Input, OnInit} from '@angular/core';
import {CoreOptions, Entity, HttpService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-access-token',
	templateUrl: 'accessTokenSection.component.html',
	styleUrls: ['./accessTokenSection.component.less']
})
export class AccessTokenComponent implements OnInit {

	@Input()
	public entity: Entity;
	@Input()
	public hasAccess: boolean;
	public permission: PermissionInfo;

	constructor(private _http: HttpService,
		private _options: CoreOptions) {
	}

	public ngOnInit(): void {
		this._loadPermissions().then(value => {
			this.permission = value;
		});
	}

	private _loadPermissions(): Promise<PermissionInfo> {
		if (this.hasAccess !== true) {
			return null;
		}
		const apiDataUrl = this._options.serverUrl + this._options.publicPort + '/api/Data';
		const url = `${apiDataUrl}/GetPermissions?entityId=${this.entity.archiveRecordId}`;
		return this._http.get<PermissionInfo>(url).toPromise();
	}
}

export class PermissionInfo {
	public metadataAccessToken: string[];
	public primaryDataFulltextAccessTokens: string[];
	public primaryDataDownloadAccessTokens: string[];
}
