import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {CollectionService} from '../../../modules/client/services/collection.service';
import {switchMap} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {CollectionDto, TranslationService} from '@cmi/viaduc-web-core';
import {SeoService, UrlService} from '../../../modules/client';

@Component({
	selector: 'cmi-collection-page',
	templateUrl: './collection-page.component.html',
	styleUrls: ['./collection-page.component.less']
})
export class CollectionPageComponent implements OnInit {
	public detailItem: CollectionDto;
	public isValid: boolean;
	public breadCrumb: { [p: number]: string };
	public showImageModal: boolean;
	private isInternalLink: boolean;
	public loading: boolean;
	public internalLink: string;

	constructor(private _url: UrlService,
				private _txt: TranslationService,
				private _collectionService: CollectionService,
				private _seoService: SeoService,
				private _route: ActivatedRoute,
				private _router: Router) {
	}

	public ngOnInit(): void {
		this.isValid = false;
		this.loading = true;
		const collection$ = this._route.paramMap.pipe(switchMap((params: ParamMap) => {
			let id = Number(params.get('id'));
			return this._collectionService.get(id);
		}));

		combineLatest([collection$])
			.subscribe(([collection]) => {
				if (collection?.item) {
					this.detailItem = collection.item;
					this.breadCrumb = collection.breadcrumb;
					this.isValid = this.detailItem.collectionId !== undefined;
					if (this.isValid) {
						this._seoService.setTitle(this.detailItem.title);
						this._seoService.setMeta('description', this.detailItem.descriptionShort);
						if (this.detailItem.link) {
							this.isInternalLink = !(this.detailItem.link.startsWith('https://') || this.detailItem.link.includes('http://'));
							if (this.isInternalLink) {
								this.internalLink = this._collectionService.getBaseUrl + this.detailItem.link;
							}
						}
						this.loading = false;
					} else {
						this._router.navigate([this._url.getHomeUrl()]);
					}
				} else {
					this._router.navigate([this._url.getHomeUrl()]);
				}
			});
	}

	public getBreadCrumb(): any[] {
		let breadCrumb = new Array();
		breadCrumb.push(			{
				iconClasses: 'glyphicon glyphicon-home',
				url: this._url.getHomeUrl(),
				screenReaderLabel: this._txt.get('breadcrumb.startseite', 'Startseite')
			}
		);

		for (let breadCrumbKey in this.breadCrumb) {
			if (this.breadCrumb.hasOwnProperty(breadCrumbKey)) {
				breadCrumb.push(
					{
						url: this._url.getCollectionUrl(breadCrumbKey),
						label: this.breadCrumb[breadCrumbKey]
					}
				);
			}
		}
		return breadCrumb;
	}

	public modalImg() {
		this.showImageModal = !this.showImageModal;
	}
}
