import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {DownloadAssetResult, AssetDownloadStatus} from '../../../model';
import * as moment from 'moment';
import {
	ClientContext,
	CoreOptions,
	Entity,
	HttpService,
	Reason,
	StammdatenService,
	TranslationService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {UrlService, AuthenticationService, AuthorizationService, ShoppingCartService} from '../../../services';
import {DownloadTokenService} from '../../../services/downloadToken.service';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';

declare const jQuery: any;

@Component({
	selector: 'cmi-viaduc-download-section',
	templateUrl: 'downloadSection.component.html',
	styleUrls: ['./downloadSection.component.less']
})
export class DownloadSectionComponent implements OnInit, OnDestroy, AfterViewInit {
	public get entity(): Entity {
		return this._entity;
	}
	@Input()
	public set entity(val: Entity) {
		if (val !== this._entity) {
			this._entity = val;
			this.ngOnDestroy();
			this.ngOnInit();
		}
	}

	public downloadPossible: boolean = false;
	public needReason: boolean = true;
	public innerhalbSchutzfrist: boolean = true;
	public showExclamation: boolean = false;

	public actionName: string = '';
	public readonly downloadActionName: string = 'download';
	public readonly viewActionName: string = 'view';

	public reasons: Reason[] = [];
	public selectedReason: Reason = null;
	public termsAccepted: boolean = false;

	public downloadDone: boolean = false;
	public downloadPending: boolean = false;
	public downloadError: string;

	public assetInfo: DownloadAssetResult;
	public isLoading: boolean = false;
	public downloadRequested: boolean = false;
	public proceedDownloadRequested: boolean = false;

	public preparationRequiredText: string;
	public pleaseLoginText: string;

	private _refreshInterval: any;
	private _entity: Entity;
	private _ueberfaelligText: string;

	constructor(private _context: ClientContext,
				private _elemRef: ElementRef,
				private _authentication: AuthenticationService,
				private _authorization: AuthorizationService,
				private _http: HttpService,
				private _stm: StammdatenService,
				private _options: CoreOptions,
				private _url: UrlService,
				private _fileTokenService: DownloadTokenService,
				public _txt: TranslationService,
				private _route: ActivatedRoute,
				private _toastr: ToastrService,
				private _scs: ShoppingCartService) {
	}

	public get authenticated(): boolean {
		return this._context.authenticated;
	}

	public get downloadReady(): boolean {
		return this.assetInfo && this.assetInfo.status === AssetDownloadStatus.InCache;
	}

	public get preparationPending(): boolean {
		return this.assetInfo && this.assetInfo.status === AssetDownloadStatus.InPreparationQueue;
	}

	public get protectedDownloadRequested(): boolean {
		return this.couldNeedAReason() && this.showExclamation;
	}

	public get humanReadablePreperationEndTime(): string {
		let estimatedEndDate = this.assetInfo.estimatedPreparationEnd;
		if (!estimatedEndDate || moment(estimatedEndDate).year() === 1) {
			return this._txt.get('downloadSection.unknown', 'unbekannt');
		}

		const timeLeft = moment(estimatedEndDate).toNow(true);

		if (moment(estimatedEndDate).isBefore(moment())) {
			// Zeitschätzung ist überschritten, Anzeige: ca. ein paar Sekunden (eine Minute überfällig)
			const einigeSekunden = moment().add(5, 'seconds').toNow(true);
			return `${einigeSekunden} (${timeLeft} ${this._ueberfaelligText})`;
		}

		return timeLeft;
	}

	public get humanReadablePreperationDurationTime(): string {
		let estimatedPreparationDuration = this.assetInfo.estimatedPreparationDuration;
		if (!estimatedPreparationDuration || estimatedPreparationDuration === '00:00:00') {
			return this._txt.get('downloadSection.unknown', 'unbekannt');
		}

		return moment.duration(estimatedPreparationDuration).humanize();
	}

	public get canViewOrDownload(): boolean {
		return this.termsAccepted;
	}

	public ngOnInit(): void {
		this._initTranslatedTexts();
		this.downloadPossible = this._scs.canDownload(this.entity);

		if (this.authenticated && this.downloadPossible) {
			this.isLoading = true;
			this._refreshAssetInfo();
			this._refreshInterval = setInterval(() => {
				this._refreshAssetInfo();
			}, 15000);
		}

		this.innerhalbSchutzfrist = (this.entity
			&& this.entity.customFields['zugänglichkeitGemässBga']
			&& (this.entity.customFields['zugänglichkeitGemässBga'] === 'In Schutzfrist'
				|| this.entity.customFields['zugänglichkeitGemässBga'] === 'Prüfung nötig'));

		this._stm.getReasons().subscribe(data => {
			this.reasons = data;
		});
	}

	public ngAfterViewInit(): void {
		this._route.fragment.subscribe((fragment: string) => {
			if (fragment === 'downloadSection') {
				this._elemRef.nativeElement.scrollIntoView();
			}
		});
	}

	public ngOnDestroy(): void {
		if (this._refreshInterval) {
			clearInterval(this._refreshInterval);
		}
	}

	private _initTranslatedTexts() {
		this._translatePreparationRequiredText();
		this._translatePleaseLoginText();
		this._ueberfaelligText = this._txt.get('downloadSection.XSecondsOverdue', 'überfällig');
	}

	private _translatePleaseLoginText() {
		let textA = this._txt.translate('Bitte melden Sie sich an, um die Unterlagen zu bestellen', 'downloadSection.pleaseLogin');
		let textB = this._txt.translate('Details unter', 'downloadSection.pleaseLoginDetailsAt');
		let registerPart = this._txt.translate('Registrieren und Identifizieren', 'downloadSection.registerAndIdentify');
		let url = this._url.getExternalRegisterAndIdentifyUrl();

		let linkPart = '<a href="' + url + '" target="_blank" rel="noopener">' + registerPart + '</a>';
		this.pleaseLoginText = `${textA} (${textB} ${linkPart})`;
	}

	private _translatePreparationRequiredText() {
		let firstPart = this._txt.get('downloadSection.preparationRequired',
			'Diese Unterlagen sind bereits digital vorhanden, müssen für den Download aber zuerst aufbereitet werden.');
		let secondPart = this._txt.get('downloadSection.estimatedPrepTime', 'Die Aufbereitung dauert ca.');
		this.preparationRequiredText = firstPart + '\n' + secondPart;
	}

	public downloadFileToken() {
		// Link holen
		this._fileTokenService.getOneTimeToken(this.entity.archiveRecordId)
			.subscribe(linkWithToken => this.downloadFileWithToken(linkWithToken), error => {
				this._downloadError(error);
				this.downloadPending = false;
				this.downloadDone = true;
				this.showExclamation = false;
			});
	}

	private downloadFileWithToken(token:any): void {
		let form = [];
		form.push(
			'<form action="',
			this._options.serverUrl + this._options.privatePort + '/api/File/DownloadFile' ,
			'" ' ,
			'method="get">',
			this._createHtmlHiddenField('id', this.entity.archiveRecordId),
			this.needReason && !_util.isEmpty(this.selectedReason) ? this._createHtmlHiddenField('reason', this.selectedReason.id) : '' ,
			this._createHtmlHiddenField('token', token),
			'</form>'
		);

		jQuery(form.join('')).appendTo('body').submit().remove();
		this.downloadPending = false;
		this.downloadDone = true;
		this.showExclamation = false;
		this._showDownloadSuccess();
		if (this._refreshInterval) {
			clearInterval(this._refreshInterval);
		}
	}

	private _showDownloadSuccess() {
		let msg = this._txt.translate('Der Download wurde erfolgreich ausgelöst.', 'downloadSection.downloadSuccess');
		let title = this._txt.translate('Download erfolgreich', 'downloadSection.downloadSuccessTitle');
		this._toastr.success(msg, title);
	}

	private _getErrorMessage(e: any): string {
		const httpError = e as HttpErrorResponse;
		const defaultMsg = this._txt.get('file.downloadErrorDefaultMessage', 'Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut');

		if (httpError) {
			const error = httpError.error;
			let msg = error || defaultMsg;

			if (_util.isObject(error)) {
				msg = httpError.error.exceptionMessage;
				msg = msg || httpError.message;
			}

			const index = msg.indexOf('faulted:');
			if (index > 0) {
				msg = msg.substr(index + 'faulted:'.length);
			}
			return msg;
		}

		if (e) {
			return e.message || defaultMsg;
		}

		return defaultMsg;
	}

	private _downloadError(error: any): void {
		this.downloadError = this._getErrorMessage(error);
	}

	private _createHtmlHiddenField(parameter:string, value: any): string {
		return `<input type="hidden" name="${parameter}" value="${value}" />`;
	}

	public prepareFileForUsageNow(): void {
		this._prepareAssetInfo();
	}

	public cancelAction(): void {
		this.selectedReason = null;
		this.showExclamation = false;
		this.actionName = '';
	}

	public downloadVeToken(): void {
		this.downloadRequested = true;
		if (!this.canViewOrDownload) {
			return;
		}

		if (this.couldNeedAReason()) {
			this.showExclamation = !this.showExclamation;
			this.actionName = this.downloadActionName;
		} else {
			this.downloadRequested = false;
			this.needReason = false;
			this.proceedDownloadToken();
		}
	}

	public proceedDownloadToken(): void {
		this.proceedDownloadRequested = true;

		if (!this.needReason || (this.needReason && this.selectedReason)) {
			if (!this.authenticated) {
				this.login();
				return;
			}
		} else {
			// keinen Grund angegeben
			return;
		}

		this.proceedDownloadRequested = false;
		this.downloadPending = true;
		this.downloadFileToken();
	}

	public login(event: any = null) {
		if (event) {
			event.preventDefault();
		}
		this._authentication.login();
	}

	public wasDownloadClicked() {
		return this.actionName === this.downloadActionName;
	}

	public getNutzungsbestimmungenUrl(): string {
		return this._txt.translate('Ich habe die <a href="#/{0}" target="_blank" rel="noopener">Nutzungsbestimmungen</a> gelesen und erkläre mich damit einverstanden',
			'file.termsofUse',
			this._url.getNutzungsbestimmungenUrl());
	}

	private _createAssetInfoUrl(methodName: string): string {
		let fileApiUrl = this._options.serverUrl
			+ this._options.privatePort
			+ methodName
			+ '?id='
			+ this.entity.archiveRecordId
			+ '&link='
			+ this._url.getExternalDetailUrl(this.entity.archiveRecordId, this.entity.title)
			+ '&lang='
			+ this._context.language;

		return fileApiUrl;
	}

	private _prepareAssetInfo() {
		if (this.assetInfo) {
			this.assetInfo.status = AssetDownloadStatus.InPreparationQueue;
		}

		this._http
			.post(this._createAssetInfoUrl('/api/File/PrepareAsset'), {})
			.toPromise()
			.then(() => {
				this._refreshAssetInfo();
			},
			(e) => {
				this._downloadError(e);
			});
	}

	private _refreshAssetInfo(): void {
		let url = this._createAssetInfoUrl('/api/File/GetAssetInfo');

		this._http.get<DownloadAssetResult>(url)
			.subscribe((data) => {
				this.assetInfo = data;
				if (this.isLoading) {
					this.isLoading = false;
				}
			}, (error) => {
				this._downloadError(error);
				this.assetInfo = null;
				if (this.isLoading) {
					this.isLoading = false;
				}
			});
	}

	private couldNeedAReason(): boolean	{
		// Liefert true wenn bei «Zugänglichkeit gem. BGA» der Wert «In Schutzfrist» oder «Prüfung nötig» eingetragen ist
		// UND
		// wo gemäss Behördenmapping (PrimaryDataDownloadAccessTokens AS_yyy) auf diesen Benutzer gemappt sind
		let hasASToken = this._authorization.hasAnyAccessToken(this.entity.primaryDataDownloadAccessTokens.filter(t => t.indexOf('AS_') === 0));
		return this.innerhalbSchutzfrist && this._authorization.isAsUser() && hasASToken;
	}
}
