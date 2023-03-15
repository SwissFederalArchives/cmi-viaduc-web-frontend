import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ArchiveModel, ClientContext, ConfigService, Entity, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {
	AuthorizationService,
	EntityRenderService,
	EntityService,
	SeoService,
	ShoppingCartService,
	UrlService
} from '../../modules/client/services';
import {AnonymizedResult} from './anonymizedResult';

@Component({
	selector: 'cmi-viaduc-detail-page',
	templateUrl: 'detailPage.component.html',
	styleUrls: ['./detailPage.component.less']
})
export class DetailPageComponent implements OnInit, AfterViewInit {
	public loading: boolean;
	public entity: Entity;
	public crumbs: any[] = [];
	public sections: any[] = [];
	public deepLinkUrl: string;
	public showDownloadSection = false;
	public showViewerSection = false;
	public showOrderSection = false;
	public items: Entity[] = [];
	public isBarUser = false;
	public hasPermission = false;
	public fields: Map<string, any> = new Map<string, any>();

	private _error: any;
	private readonly _elem: any;

	constructor(private _archive: ArchiveModel,
				private _context: ClientContext,
				private _entityService: EntityService,
				private _renderService: EntityRenderService,
				private _txt: TranslationService,
				private _url: UrlService,
				private _route: ActivatedRoute,
				private _authorization: AuthorizationService,
				private _scs: ShoppingCartService,
				private _seoService: SeoService,
				private _elemRef: ElementRef,
				public _config: ConfigService) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this._buildCrumbs();
		this._seoService.setTitle(this._txt.translate('Detailansicht', 'detailPageComponent.pageTitle'));
		this._route.params.subscribe(params => this._loadEntity(params['id']));
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	private _buildCrumbs(entity?: Entity): void {
		const rootId = this._archive.ROOT_ID;
		const lang = this._context.language;
		this.crumbs = [];
		this.crumbs.push(
			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			});

		const searchState = this._context.search;
		const browseState = searchState ? searchState.browse : undefined;
		if (browseState) {
			if (searchState.advancedSearch === true) {
				this.crumbs.push({
					label: this._txt.get('breadcrumb.erweiterteSuche', 'Erweiterte Suche'),
					url: this._url.getAdvancedSearchUrl()
				});
			} else {
				this.crumbs.push({
					label: this._txt.get('breadcrumb.einfacheSuche', 'Einfache Suche'),
					url: this._url.getSimpleSearchUrl()
				});
			}
			this.crumbs.push({
				label: this._txt.get('breadcrumb.backToSearch', 'Resultat'),
				url: this._url.getSearchResultUrl()
			});
		} else {
			this.crumbs.push({
				label: this._txt.get('breadcrumb.archiveHome', 'Gesamtbestand'),
				url: '/' + lang + '/archiv/einheit/' + rootId
			});
		}

		if (entity && entity.archiveRecordId !== rootId) {
			this.crumbs.push({label: entity.title, itemClasses: 'active'});
		}
	}

	private async _loadEntity(idOrReference: string): Promise<void> {
		this.loading = true;
		this._error = undefined;

		try {
			const id = this._url.getDetailIdFromReference(idOrReference);
			this.entity = await this._entityService.get(id);
			this.hasPermission = this.entity.fieldAccessTokens ? this._authorization.hasAnyAccessToken(this.entity.fieldAccessTokens) : true;
			this.isBarUser = this._authorization.isBarUser();

			if (this.entity.isAnonymized && this.isBarUser === true ) {
				const result: AnonymizedResult = await this._entityService.getAnonymized(id);
				this.fields = new Map(Object.entries(result));
			}

			this.items = [];

			if (!_util.isEmpty(this.entity)) {
				this._buildCrumbs(this.entity);

				this.sections = [];
				if (this.entity._context) {
					const ctx = this.entity._context;
					const items = [];
					if (ctx.ancestors) {
						Array.prototype.push.apply(items, ctx.ancestors);
					}
					this.entity.itemClasses = 'selected';
					items.push(this.entity);
					if (ctx.children) {
						Array.prototype.push.apply(items, ctx.children);
					}

					this.items = items;
				}

				if (this.entity._metadata) {
					for (const key in this.entity._metadata) {
						if (this.entity._metadata.hasOwnProperty(key)) {
							const sec = this._renderService.renderSection(this.entity, key);
							if (sec) {
								this.sections.push(sec);
							}
						}
					}
				}

				this.showViewerSection = this.entity.manifestLink && (this._authorization.isBarUser() ||
					(this.entity?.primaryDataDownloadAccessTokens.filter(a => a === 'Ö2').length === 1
					&& this.entity?.primaryDataFulltextAccessTokens.filter(a => a === 'Ö2').length === 1));

				this.showDownloadSection = this._scs.canDownload(this.entity);
				// Download wird NICHT angezeigt UND die VE ist bestellbar ODER
				// Download wird NICHT angezeigt UND es gibt einen PrimarydataLink
				this.showOrderSection = (!this.showDownloadSection && this.entity.canBeOrdered)  || (!this.showDownloadSection && this.entity.primaryDataLink !== null);
				this.deepLinkUrl = this._url.getExternalDetailUrl(this.entity.archiveRecordId, this.entity.title);

			} else {
				this._error = this.createErrorMessage();
			}

		} catch (err) {
			this._error = this.createErrorMessage();
		} finally {
			this.loading = false;
		}
	}

	private createErrorMessage(): any {
		// Creating "safe" error message without exposing details
		const details1 = this._txt.get('detail.notFoundMessage',
				'Womöglich verfügen Sie nicht über die nötige Berechtigung, um die Seite aufzurufen (siehe <a href="#{0}">Anmelden und Identifizieren</a>).</br></br>',
				this._url.getRegisterAndIdentifyInfo());

		const details2 = this._txt.get('detail.notFoundMessage2',
			'Bei Fragen zur Zugänglichkeit der Unterlagen im Bundesarchiv wenden Sie sich bitte an die Beratung oder per E-Mail an ' +
			'<a href="mailto:bundesarchiv@bar.admin.ch">bundesarchiv@bar.admin.ch</a>.');

		return {
			message: this._txt.get('detail.notFound', 'Die gewünschte Seite kann nicht angezeigt werden'),
			details: details1 + details2
		};
	}

	public get showSearchBrowser(): boolean {
		return !_util.isEmpty(this._context.search) && !_util.isEmpty(this._context.search.result);
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
}
