import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShoppingCartService} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {OrderItem, Reason, StammdatenService} from '@cmi/viaduc-web-core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ReasonValidator} from '../../../model/reasonValidator';

@Component({
	selector: 'cmi-viaduc-reasons-step',
	templateUrl: 'checkoutReasonsStep.component.html',
	styleUrls: ['./checkoutReasonsStep.component.less']
})
export class CheckoutReasonsStepComponent implements OnInit {

	@Input()
	public inputItems: OrderItem[] = [];

	public everyItemContainsPersonData: boolean = true;
	public reasons: Reason[] = [];
	public form: FormGroup;

	@Output()
	public onGoBackClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();
	public nextClicked: boolean = false;

	constructor(private _scs: ShoppingCartService,
				private _stm: StammdatenService,
				private _toastr: ToastrService,
				private _formBuilder: FormBuilder) {
	}

	public ngOnInit(): void {
		let order = this._scs.getActiveOrder();
		if (order.begruendungAngegebenFallsNoeting) {
			this.inputItems = order.items || this.inputItems;
		}

		this.form = this._formBuilder.group({
			items: this._formBuilder.array(this.inputItems.map(i => this._buildFormGroup(i)))
		});

		if (order.begruendungAngegebenFallsNoeting) {
			this.everyItemContainsPersonData = this.doesEveryItemContainPersonData();
		} else {
			this.setFlagForAllItems(true);
		}

		this._stm.getReasons().subscribe(data => {
			this.reasons = data;
		}, error2 => {
			this._toastr.error(error2);
		});
	}

	private _buildFormGroup(item: OrderItem) {
		let group = new FormGroup({
			id: new FormControl(item.id),
			hasPersonendaten: new FormControl(item.hasPersonendaten),
			reason: new FormControl({value: item.reason, disabled: !item.hasPersonendaten}),
			referenceCode: new FormControl(item.referenceCode),
			title: new FormControl(item.title),
			period: new FormControl(item.period)
		}, [ReasonValidator.missingFlag, ReasonValidator.missingReason]);

		group.get('hasPersonendaten').valueChanges.subscribe((val) => {
			this.everyItemContainsPersonData = this.doesEveryItemContainPersonData();
			if (!val) {
				group.get('reason').setValue(undefined);
				group.get('reason').disable( { onlySelf: true, emitEvent: false});
			} else {
				group.get('reason').enable({ onlySelf: true, emitEvent: false});
			}
		});

		return group;
	}

	public setFlagForAllItems(val: boolean) {
		this.everyItemContainsPersonData = val;
		let items = (this.form.get('items') as FormArray);

		for (let i = 0; i < items.controls.length; i++) {
			items.at(i).get('hasPersonendaten').setValue(val);
		}
	}

	public get formItems(): OrderItem[] {
		if (!this.form || !this.form.get('items')) {
			return [];
		}
		return this.form.get('items').value.map(ctrl => <OrderItem> {
			id: ctrl.id,
			hasPersonendaten: ctrl.hasPersonendaten,
			reason: ctrl.reason,
			referenceCode: ctrl.referenceCode,
			title: ctrl.title,
			period: ctrl.period
		});
	}

	private async saveReasons(): Promise<void> {
		for (let item of this.formItems) {
			if (item.hasPersonendaten) {
				await this._scs.setReason(item, item.reason).toPromise();
			} else {
				await this._scs.setReason(item, null).toPromise();
			}
		}
	}

	private async _saveActiveOrder(saveReasons = true): Promise<void> {
		let order = this._scs.getActiveOrder();

		if (saveReasons) {
			await this.saveReasons();
		}

		order.begruendungAngegebenFallsNoeting = true;
		order.items = this.formItems;
		this._scs.setActiveOrder(order);
	}

	public async validateFields(): Promise<void> {
		this.nextClicked = true;
		if (this.form.invalid || this.form.get('items').invalid) {
			console.log(this.form.invalid);
			this._validateAllFields(this.form);
			return;
		}

		console.log(this.form.invalid, this.form.errors);
		await this._saveActiveOrder();
		this.onNextClicked.emit();
	}

	private _validateAllFields(formGroup: FormGroup) {
		Object.keys(formGroup.controls).forEach(field => {
			const control = formGroup.get(field);
			if (control instanceof FormControl) {
				control.markAsTouched({onlySelf: true});
			} else if (control instanceof FormGroup) {
				this._validateAllFields(control);
			}
		});
	}

	public async goBack(): Promise<void> {
		await this._saveActiveOrder(false);
		this.onGoBackClicked.emit();
	}

	private doesEveryItemContainPersonData() {
		let items = (this.form.get('items') as FormArray);
		let found = false;
		for (let i = 0; i < items.length; i++) {
			if (!items.at(i).get('hasPersonendaten').value) {
				found = true;
				return;
			}
		}

		return !found;
	}
}
