import {Component, OnInit, Input, ElementRef, EventEmitter, Output} from '@angular/core';
import {ShoppingCartService} from '../../../services';
import {OrderItem, Utilities as _util} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-shoppingcart-list',
	templateUrl: 'shoppingCartItemList.component.html',
	styleUrls: ['./shoppingCartItemList.component.less']
})
export class ShoppingCartItemList implements OnInit {

	@Input()
	public items: OrderItem[] = [];

	@Input()
	public einsichtsGesuche: boolean = false;

	@Output()
	public refreshRequested: EventEmitter<void> = new EventEmitter<void>();

	public bewilligungModalOpen: boolean = false;
	public chosenBewilligungsItem: OrderItem = null;
	public invalidDateError: boolean = false;
	public updateError: boolean = false;

	private _elem: ElementRef;
	constructor(private _scs: ShoppingCartService, elemRef: ElementRef) {
		this._elem = elemRef.nativeElement;
	}

	public ngOnInit(): void {
	}

	public updateComment(item: OrderItem) {
		this._scs.setComment(item).subscribe(() => {
		});
	}

	public removeFromCart(item: OrderItem) {
		this._scs.removeFromCart(item.id).subscribe(() => {
			this.removeItem(item);
		});
	}
	public ngAfterViewInit(): void {
		_util.initJQForElement(this._elem);
	}

	public showModal(item: any) {
		this.bewilligungModalOpen = true;
		this.chosenBewilligungsItem = Object.assign({}, item);
	}

	public onModalOpenedChange(state: boolean) {
		this.bewilligungModalOpen = state;
		this.updateError = false;
		this.invalidDateError = false;

		if (!state) {
			this.chosenBewilligungsItem = null;
		}
	}

	public updateBewilligung() {
		this.updateError = false;
		this._scs.updateBewilligungsDatum(this.chosenBewilligungsItem).subscribe(() => {
			this.onModalOpenedChange(false);
			this.refreshRequested.emit();
		}, (e) => {
			this.updateError = true;
			console.error(e);
		});
	}

	public checkDate(isValid: boolean) {
		this.invalidDateError = !isValid;
		if (_util.isEmpty(this.chosenBewilligungsItem.bewilligungsDatum)) {
			return;
		}
	}

	private removeItem(item: any) {
		let index = this.items.indexOf(item, 0);
		if (index > -1) {
			this.items.splice(index, 1);
		}
	}
}
