import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewEncapsulation
} from '@angular/core';
import {EntityService} from '../../services';
import {ConfigService, TranslationService} from '@cmi/viaduc-web-core';
import {Router} from '@angular/router';
import {UrlService} from '../../services/url.service';

@Component({
	selector: 'cmi-viaduc-tree-node',
	templateUrl: 'treeNode.component.html',
	styleUrls: ['./treeNode.component.less'],
	encapsulation: ViewEncapsulation.None
})
export class TreeNodeComponent implements OnInit, AfterViewInit {
	@Input()
	public nodesToLoad: string[];
	@Output()
	public loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	public rootNode: string = '';
	public isExpanded: boolean;

	private get _toExpand(): boolean {
		return this.nodesToLoad.length > 1;
	}

	constructor(private _entityService: EntityService,
				private _cfg: ConfigService,
				private _router: Router,
				private _url: UrlService,
				private _txt: TranslationService) {
	}

	public async getRootNode(id: string) {
		this.rootNode = await this._entityService.getArchivplanHtml(id);
	}

	public async getNodesAsync() {
		for (let id of this.nodesToLoad) {
			await this.loadOrCollapseNode(id);
		}
		if (this._toExpand === true) {
			let nodes = this.nodesToLoad;
			let elem = (document.getElementById(nodes.reverse()[0]) || <any>{});
			let parent = elem.parentElement || {};
			let grandparent = parent.parentElement;

			if (grandparent) {
				grandparent.className += ' highlighted';
				elem.scrollIntoView();
			}
		}
	}

	public async loadOrCollapseNode(id: string) {
		let expandElem = document.getElementById(id);
		let childElem = document.getElementById('children' + id);
		let notOnlineRecherchableDossiersElem = document.getElementById('notOnlineRecherchableVe' + id);

		if (childElem !== null) {
			if (expandElem.className.endsWith('tree-collapse icon icon--before icon--greater') === true) {
				await this._expandNode(expandElem, childElem, notOnlineRecherchableDossiersElem, id);
			} else if (expandElem.className.endsWith('tree-collapse icon icon--before icon--root') === true) {
				await this._closeNode(expandElem, childElem, notOnlineRecherchableDossiersElem);
			}
		}
	}

	private async _expandNode(expandElem: HTMLElement, childElem: HTMLElement, notOnlineRecherchableDossiersElem: HTMLElement, id: string) {
		this.loadingChange.emit(true);
		expandElem.className = 'tree-collapse icon icon--before icon--root';
		expandElem.setAttribute('aria-label', this._txt.translate('einklappen', 'archivplan.treeNode.collapse'));
		childElem.innerHTML =  await this._entityService.getChildHtml(id);
		if (notOnlineRecherchableDossiersElem) {
			notOnlineRecherchableDossiersElem.style.cssText = '';
		}
		this.loadingChange.emit(false);
		this.isExpanded = true;
	}

	private async _closeNode(expandElem: HTMLElement, childElem: HTMLElement, notOnlineRecherchableDossiersElem: HTMLElement) {
		expandElem.className = 'tree-collapse icon icon--before icon--greater';
		expandElem.setAttribute('aria-label', this._txt.translate('aufklappen', 'archivplan.treeNode.expand'));
		childElem.innerHTML = '';
		if (notOnlineRecherchableDossiersElem) {
			notOnlineRecherchableDossiersElem.style.cssText = 'display:none';
		}
		this.isExpanded = false;
	}

	public ngOnInit(): void {
		if (!(this.nodesToLoad && this.nodesToLoad.length > 0)) {
			this.nodesToLoad = this._cfg.getSetting('archivplan.entryNodes').map(e => e.archiveRecordId);
		}
	}

	public ngAfterViewInit(): void {
		this.getRootNode(this.nodesToLoad[0]).then(() => {
			if (this.nodesToLoad.length > 0) {
				setTimeout(() => this.getNodesAsync(), 1);
			}
		});
	}

	public async innerHtmlClicked($event: any) {
		let id = $event.target.id.toString();
		if (id.startsWith('Node')) {
			id = id.slice(4);
		}
		this.loadOrCollapseNode(id);
	}

	public goToDetailPage($event: any) {
		let id = $event.target.id.toString();
		if (id.startsWith('Node')) {
			id = id.slice(4);
		}
		const url = this._url.getDetailUrl(id);
		this._router.navigateByUrl(url);
	}
}
