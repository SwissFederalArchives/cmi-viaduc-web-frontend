import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ArchiveModel, ClientContext, Entity, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {
	AuthorizationService,
	EntityRenderService,
	EntityService,
	SeoService,
	ShoppingCartService,
	UrlService
} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-detail-page',
	templateUrl: 'detailPage.component.html',
	styleUrls: ['./detailPage.component.less']
})
export class DetailPageComponent implements OnInit {
	public loading: boolean;

	public entity: Entity;

	public crumbs: any[] = [];
	public sections: any[] = [];
	public deepLinkUrl: string;
	public showDownloadSection = false;
	public showOrderSection = false;
	public items: Entity[] = [];
	public isBarUser: boolean = false;

	private _error: any;

	constructor(private _archive: ArchiveModel,
				private _context: ClientContext,
				private _entityService: EntityService,
				private _renderService: EntityRenderService,
				private _txt: TranslationService,
				private _url: UrlService,
				private _route: ActivatedRoute,
				private _authorization: AuthorizationService,
				private _scs: ShoppingCartService,
				private _seoService: SeoService) {
	}

	public ngOnInit(): void {
		this._buildCrumbs();
		this._seoService.setTitle(this._txt.translate('Detailansicht', 'detailPageComponent.pageTitle'));
		this._route.params.subscribe(params => this._loadEntity(params['id']));
		this.isBarUser = this._authorization.isBarUser();
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
			let entity = this.entity = await this._entityService.get(id);
			this.items = [];

			if (!_util.isEmpty(entity)) {
				this._buildCrumbs(entity);

				this.sections = [];
				if (entity._context) {
					let ctx = entity._context;
					let items = [];
					if (ctx.ancestors) {
						Array.prototype.push.apply(items, ctx.ancestors);
					}
					entity.itemClasses = 'selected';
					items.push(entity);
					if (ctx.children) {
						Array.prototype.push.apply(items, ctx.children);
					}

					this.items = items;
				}

				if (entity._metadata) {
					for (let key in entity._metadata) {
						if (entity._metadata.hasOwnProperty(key)) {
							let sec = this._renderService.renderSection(entity, key);
							if (sec) {
								this.sections.push(sec);
							}
						}
					}
				}

				this.showDownloadSection = this._scs.canDownload(this.entity);
				this.showOrderSection = !this.showDownloadSection && this.entity.canBeOrdered;
				this.deepLinkUrl = this._url.getExternalDetailUrl(entity.archiveRecordId, entity.title);

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
		let details1 = this._txt.get('detail.notFoundMessage',
				'Womöglich verfügen Sie nicht über die nötige Berechtigung, um die Seite aufzurufen (siehe <a href="#{0}">Anmelden und Identifizieren</a>).</br></br>',
				this._url.getRegisterAndIdentifyInfo());

		let details2 = this._txt.get('detail.notFoundMessage2',
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
