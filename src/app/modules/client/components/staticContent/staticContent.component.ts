import {Component, Input, SimpleChange, OnChanges, ViewEncapsulation} from '@angular/core';
import {ClientContext, CoreOptions, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {StaticContentService} from '../../services';
import {SeoService} from '../../services';

@Component({
	selector: 'cmi-static-content',
	templateUrl: 'staticContent.component.html',
	styleUrls: ['./staticContent.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class StaticContentComponent implements OnChanges {
	@Input()
	public url: string;

	@Input()
	public editMode: boolean;

	get language(): string {
		return this._context.language;
	}

	public loadedHtml: string;
	public loading: boolean;
	private _error: any;

	constructor(
		private _options: CoreOptions,
		private _context: ClientContext,
		private _static: StaticContentService,
		private _txt: TranslationService,
		private _seoService: SeoService	) {
	}

	public ngOnInit(): void {
		this._loadContent();
	}

	public ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
		if (changes['url'] && this.url !== undefined) {
			const oldRoute = this._static.getStaticRouteInfo(changes['url']['previousValue']);
			const newRoute = this._static.getStaticRouteInfo(changes['url']['currentValue']);
			
			if (oldRoute.route !== newRoute.route || oldRoute.query !== newRoute.query) {
				this._loadContent();
			} else {
				this._showAnchor(newRoute.hash);
			}
		}
	}

	private _loadContent() {
		const routeInfo = this._static.getStaticRouteInfo(this.url);

		this.editMode = false;
		this._error = undefined;
		this.loading = true;
		const subscription = this._static.getContent(routeInfo.route)
			.subscribe(
				html => {
					this.loadedHtml = html;
					this.setTitle();

					this.editMode = this._static.hasWebAuthoringFeature();
					subscription.unsubscribe();
					this.loading = false;
					this._showAnchor(routeInfo.hash);
				},
				error => {
					this.loadedHtml = null;
					this._error = this._createErrorMessage(error);
					subscription.unsubscribe();
					this.loading = false;
				}
			);
	}

	private _showAnchor(anchor: string) {
		if (_util.isEmpty(anchor)) {
			return;
		}

		window.setTimeout(() => {
				let element = document.getElementById(anchor);
				if (!element) {
					const elements = document.getElementsByName(anchor);
					if (_util.isArray(elements) && elements.length > 0) {
						element = elements[0];
					}
				}
				if (element) {
					element.scrollIntoView(true);
				} else if (anchor === 'top') {
					window.scrollTo(0, 0);
				}
			}, 10
		);
	}

	private _createErrorMessage(error: any): any {
		return {
			message: this._txt.get('staticContent.errorMessage', 'Die gewünschte Seite kann nicht angezeigt werden'),
			details: this._txt.get('staticContent.errorTitle', 'Es trat ein Fehler beim Laden der Seite auf. System-Meldung: {0}', error.toString())
		};
	}

	public get hasError(): boolean {
		return !_util.isEmpty(this._error);
	}

	public get errorMessage(): string {
		const error = this._error || {};
		return error.message;
	}

	public get errorDetails(): string {
		const error = this._error || {};
		return error.details;
	}

	public openEditor() {
		const webContentUrl = this._options.serverUrl;
		const url = `${webContentUrl}${this.url}`;
		window.open(url, '_blank');
	}

	private setTitle() {
		let h1s = document.getElementById('loadedHtml').getElementsByTagName('h1');
		if (h1s && h1s[0]) {
			this._seoService.setTitle(h1s[0].innerHTML);
		}
	}
}
