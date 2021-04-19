import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientContext, ConfigService, Entity, TranslationService } from '@cmi/viaduc-web-core';
import { EntityService, SeoService, UrlService } from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-archivplane-page',
	templateUrl: 'archivplanPage.component.html',
	styleUrls: ['./archivplanPage.component.less']
})
export class ArchivplanPageComponent implements OnInit {

	public crumbs: any[] = [];
	public nodes: Entity[];
	public nodesToOpen: string[] = [];
	public loading: boolean = true;
	public init: boolean = true;
	public error: boolean = false;
	public param: string;

	private _crumbsLoaded: boolean = false;

	public get crumbsLoaded(): boolean {
		return this._crumbsLoaded === true || !this.param;
	}

	constructor(private _txt: TranslationService,
		private _url: UrlService,
		private _cfg: ConfigService,
		private _route: ActivatedRoute,
		private _entityService: EntityService,
		private _seoService: SeoService,
		private _context: ClientContext) {
		this._route.params.subscribe(params => this._openNode(params['id']));
	}

	private async _openNode(id: string) {
		this.loading = true;
		this.param = id;
		this.nodes = this._cfg.getSetting('archivplan.entryNodes');
		if (id) {
			try {
				let entity = await this._entityService.get(id);
				if (entity) {
					this.nodesToOpen = this._getNodesToOpen(entity);
				} else {
					this.error = true;
					this.loading = false;
					return;
				}
			} catch (err) {
				this.error = true;
				this.loading = false;
				return;
			}
		}
		this.init = false;
		this.loading = false;
	}

	private _getNodesToOpen(e: Entity): string[] {
		let ids: string[] = [];
		if (e._context && e._context.ancestors) {
			e._context.ancestors.forEach(function (i) {
				ids.push(i.archiveRecordId);
			});
		}
		ids.push(e.archiveRecordId);
		return ids;
	}

	private _buildCrumbs(): void {
		let crumbs: any[] = this.crumbs = [];
		crumbs.push({
			iconClasses: 'glyphicon glyphicon-home',
			url: this._url.getHomeUrl(),
			screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
		});
		if (this.param) {
			this._entityService.get(this.param).then(entity => {
				if (entity) {
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
						crumbs.push({
							label: entity.title,
							url: this._url.getDetailUrl(entity.archiveRecordId)
						});
						crumbs.push({ label: this._txt.get('breadcrumb.archivplan', 'Archivplan') });
					} else {
						crumbs.push({ label: this._txt.get('breadcrumb.archivplan', 'Archivplan') });
						crumbs.push({
							label: entity.title,
							url: this._url.getDetailUrl(entity.archiveRecordId)
						});
					}
					this._crumbsLoaded = true;
				} else {
					crumbs.push({ label: this._txt.get('breadcrumb.archivplan', 'Archivplan') });
				}
				this._crumbsLoaded = true;
			}).catch(err => {
				crumbs.push({ label: this._txt.get('breadcrumb.archivplan', 'Archivplan') });
				this._crumbsLoaded = true;
			});
		} else {
			crumbs.push({ label: this._txt.get('breadcrumb.archivplan', 'Archivplan') });
		}
	}

	public ngOnInit(): void {
		this._seoService.setTitle(this._txt.translate('Archivplan', 'archivplanPageComponent.pageTitle'));
		this._buildCrumbs();
	}

	public handleLoadChange(value: boolean) {
		setTimeout(() => {
			this.loading = value;
		}, 0);
	}

	public getErrorTitel(): string {
		return this._txt.get('detail.notFound', 'Die gewünschte Seite kann nicht angezeigt werden');
	}

	public getErrorMessage(): string {
		let details1 = this._txt.get('detail.notFoundMessage',
				'Womöglich verfügen Sie nicht über die nötige Berechtigung, um die Seite aufzurufen (siehe <a href="#{0}">Anmelden und Identifizieren</a>).</br></br>',
				this._url.getRegisterAndIdentifyInfo());

		let details2 = this._txt.get('detail.notFoundMessage2',
			'Bei Fragen zur Zugänglichkeit der Unterlagen im Bundesarchiv wenden Sie sich bitte an die Beratung oder per E-Mail an ' +
			'<a href="mailto:bundesarchiv@bar.admin.ch">bundesarchiv@bar.admin.ch</a>.');

		return details1 + details2;
	}
}
