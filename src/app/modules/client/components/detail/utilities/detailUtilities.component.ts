import {Component, ElementRef, Input} from '@angular/core';
import {ShoppingCartService} from '../../../services/shoppingCart.service';
import {Entity, UiService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-detail-utilities',
	templateUrl: 'detailUtilities.component.html',
	styleUrls: ['./detailUtilities.component.less'],
	host: {
		'(document:click)': 'checkOutsideClick($event)'
	}
})
export class DetailUtilitiesComponent {

	@Input()
	public entity: Entity;

	public showMenu: string = '';

	constructor(private _ui: UiService, private _elemRef: ElementRef, private _scs: ShoppingCartService) {
	}

	public toggleMenu(menu = ''): void {
		this.showMenu = this.isShown(menu) ? '' : menu;
	}

	public isShown(menu: string): boolean {
		return this.showMenu === menu;
	}

	public addToCart(): void {
		this._scs.addToCart(this.entity).subscribe();
	}

	public checkOutsideClick(event: any) {
		if (!this._ui.detectInsideClick(event, this._elemRef.nativeElement)) {
			this.showMenu = '';
		}
	}

	public printPage(): void {
		window.print();
	}
}
