import {Component, Input, ElementRef, EventEmitter, Output} from '@angular/core';
import {ShoppingCartService} from '../../../services';
import {ClientContext, OrderItem, Utilities as _util} from '@cmi/viaduc-web-core';
import {FlatPickrOutputOptions} from 'angularx-flatpickr/lib/flatpickr.directive';
import flatpickr from 'flatpickr';
import {German} from 'flatpickr/dist/l10n/de';
import {French} from 'flatpickr/dist/l10n/fr';
import {Italian} from 'flatpickr/dist/l10n/it';

@Component({
	selector: 'cmi-viaduc-shoppingcart-list',
	templateUrl: 'shoppingCartItemList.component.html',
	styleUrls: ['./shoppingCartItemList.component.less']
})
export class ShoppingCartItemList {

	@Input()
	public items: OrderItem[] = [];

	@Input()
	public einsichtsGesuche = false;

	@Output()
	public refreshRequested: EventEmitter<void> = new EventEmitter<void>();

	public bewilligungModalOpen = false;
	public chosenBewilligungsItem: OrderItem = null;
	public invalidDateError = false;
	public updateError = false;

	private _elem: ElementRef;
	constructor(private _scs: ShoppingCartService, private _context: ClientContext, elemRef: ElementRef) {
		this._elem = elemRef.nativeElement;
		const lang = this._context.language;
		switch (lang) {
			case 'de' :
				flatpickr.localize(German);
				break;
			case 'fr' :
				flatpickr.localize(French);
				break;
			case 'it' :
				flatpickr.localize(Italian);
				break;
		}
	}

	public updateComment(item: OrderItem) {
		this._scs.setComment(item).subscribe(() => { return
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

	public checkDate($event: FlatPickrOutputOptions) {
		const isValid = $event.dateString !== '';
		if (isValid) {
			this.chosenBewilligungsItem.bewilligungsDatum = $event.selectedDates[0];
		}
		this.invalidDateError = !isValid;
	}

	private removeItem(item: any) {
		const index = this.items.indexOf(item, 0);
		if (index > -1) {
			this.items.splice(index, 1);
		}
	}
}
