import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {ClientContext, Entity, Utilities as _util} from '@cmi/viaduc-web-core';
import {UrlService} from '../../../services/url.service';
import {EntityService} from '../../../services/entity.service';
import {ShoppingCartService} from '../../../services/shoppingCart.service';

@Component({
	selector: 'cmi-viaduc-simple-hit',
	templateUrl: 'simpleHit.component.html',
	styleUrls: ['./simpleHit.component.less'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class SimpleHitComponent implements AfterViewInit, OnInit {
	@Input()
	public entity: Entity;
	@Input()
	public enableExplanations: boolean = false;

	public htmlForTitle: string;
	public htmlForText: string;
	public displayArchivplanContext: boolean = false;

	public displayExplanation: boolean = false;
	public score: string;

	private _elem: any;

	constructor(private _elemRef: ElementRef,
				private _context: ClientContext,
				private _url: UrlService,
				private _scs: ShoppingCartService,
				private _entityService: EntityService,
				private _router: Router ) {
		this._elem = this._elemRef.nativeElement;
	}

	public ngOnInit(): void {
		this.score = (this.entity  && this.entity.explanation && _util.isObject(this.entity.explanation))
			? this.entity.explanation.value
			: '';

		this._replaceHighlightHtml();
	}

	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public open(entity: Entity): void {
		if (this._context.search && this._context.search.browse && this._context.search.result && this._context.search.result.items) {
			this._context.search.browse.offset = this._context.search.result.items.indexOf(entity);
		}
		this._router.navigate([this._url.getDetailUrl(entity.archiveRecordId, entity.title)]);
	}

	public async onMenuClicked(id: string) {
		switch (id) {
			case 'archivplancontext':
				this._toggleArchivplanContext();
				document.getElementById('archivePlanTitle' + this.entity.archiveRecordId).focus();
				break;
			case 'gotoarchivplan':
				this._goToArchivplan();
				break;
			case 'addtocart':
				this._addToCart();
				break;
			default:
				alert('not implemented yet');
		}
	}

	private async _toggleArchivplanContext() {
		if (this.displayArchivplanContext) {
			this.displayArchivplanContext = false;
		} else {
			if (!this.entity._context) {
				this.entity = await this._entityService.get(this.entity.archiveRecordId);
			}
			this.displayArchivplanContext = true;
		}
	}

	public toggleDisplayExplanation(): void {
		this.displayExplanation = !this.displayExplanation;
	}

	private _goToArchivplan() {
		let url = '/suche/archivplan/' + this.entity.archiveRecordId;
		this._router.navigate([this._url.localizeUrl(this._context.language, url)]);
	}

	private _addToCart() {
		this._scs.addToCart(this.entity).subscribe();
	}

	private _replaceHighlightHtml() {
		if (this.entity) {

			if (this.entity.highlight) {
				this.htmlForTitle = this.entity.highlight.title[0]
					.replace(new RegExp('<h1l1ght>', 'g'), '<span class=\"highlight\">')
					.replace(new RegExp('</h1l1ght>', 'g'), '</span>');
			} else if (this.entity.title) {
				this.htmlForTitle = this.entity.title;
			}

			if (this.entity.highlight &&  this.entity.highlight.mostRelevantVektor) {
				this.htmlForText = this.entity.highlight.mostRelevantVektor.join('&#13;');
				this.htmlForText = this.htmlForText
					.replace(new RegExp('<h1l1ght>', 'g'), '<span class=\"highlight\">')
					.replace(new RegExp('</h1l1ght>', 'g'), '</span>');
			}
		}
	}

	public getPictureAsBase64(): string {
		if (!this.entity || !this.entity.customFields['bildAnsicht']) {
			return null;
		}
		let img = this.entity.customFields['bildAnsicht'];
		return `data:${img['mimeType']};base64,${img['value']}`;
	}
}
