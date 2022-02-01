import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ShoppingCartService, UserService} from '../../../services';
import {ClientContext, ShippingType, Utilities as _util} from '@cmi/viaduc-web-core';
import {User} from '../../../model';
import {WjAutoComplete} from '@grapecity/wijmo.angular2.input';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'cmi-viaduc-user-select-step',
	templateUrl: 'checkOutUserSelectStep.component.html',
	styleUrls: ['./checkOutUserSelectStep.component.less']
})
export class CheckoutUserSelectStepComponent implements OnInit {
	@ViewChild('autoComplete', { static: false})
	public autoComplete: WjAutoComplete;
	public userList: User[];
	public form: FormGroup;

	@Output()
	public onGoBackClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();
	public nextClicked: boolean = false;
	public loading: boolean = false;
	public checkingKontingent: boolean = false;
	public willexceedKontingent: boolean = false;

	constructor(private _scs: ShoppingCartService,
				private _userService: UserService,
				private _formBuilder: FormBuilder,
				private _ctx: ClientContext) {
	}

	public async ngOnInit(): Promise<void> {
		this.loading = true;
		this.form = this._formBuilder.group({
			orderIsForMe: new FormControl(null, [Validators.required]),
			userId: new FormControl(null)
		});

		this.form.controls['orderIsForMe'].valueChanges.subscribe(val => {
			this.onOrderIsForMeChanged(val);
		});

		let order = this._scs.getActiveOrder();
		let currentUserId = (this._ctx.currentSession || <any>{}).userid;
		let orderIsForMe = !(order.userId && currentUserId !== order.userId);

		this.form.patchValue({
			orderIsForMe: orderIsForMe,
			userId: order.userId
		});

		// possible long operation (all users are fetched)
		let users = await this._userService.getUsers();
		this.userList = this._prepareUserList(users);
		this.loading = false;

		if (!orderIsForMe) {
			setTimeout(() => {
				this.autoComplete.selectedIndex = this.userList.findIndex(u => u.id === order.userId);
			}, 0);
		} else {
			setTimeout(() => {
				this.autoComplete.selectedIndex = -1;
			}, 0);
		}

	}

	private _prepareUserList(userList: User[]): User[] {
		const list: User[] = [];
		list.push(new User());
		// Alphabetisch sortieren nach Nachnamen
		let sortedUserList = userList.sort((a, b) => {
			if (a && a.familyName && b && b.familyName) {
				if (a.familyName < b.familyName) {
					return -1;
				} else if (a.familyName === b.familyName) {
					return 0;
				}
			}
			return 1;
		});
		for (let user of sortedUserList ) {
			if (!_util.isEmpty(user.familyName) || !_util.isEmpty(user.firstName)) {
				user.displayName = (user.familyName + ' ' + user.firstName + ' (' + user.userExtId + ')').trim();
				list.push(user);
			}
		}
		return list;
	}

	public onOrderIsForMeChanged(val: boolean): void {
		if (val) {
			this.willexceedKontingent = false;
		}
		this.form.get('userId').setValidators(val ? [] : [Validators.required]);
	}

	public onSelectedIndexChanged(): void {
		this._setUserId();

		let order = this._scs.getActiveOrder();
		if (!this._orderIsForMe && order.type === ShippingType.Digitalisierungsauftrag) {
			this.checkingKontingent = true;
			this.willexceedKontingent = false;
			let userId = this.form.controls['userId'].value;

			this._scs.getKontingent(userId).subscribe(res => {
				if (res.bestellkontingent > 0) {
					this._scs.getOrderableItems().subscribe(ordableItems => {
							this.willexceedKontingent = res.bestellkontingent - ordableItems.length < 0;
						},
						() => {},
						() => {
							this.checkingKontingent = false;
						});
				} else {
					this.willexceedKontingent = true;
					this.checkingKontingent = false;
				}
			},
				() => { this.checkingKontingent = false; },
				() => {});
		}

	}

	private get _orderIsForMe() {
		return this.form.controls['orderIsForMe'].value;
	}

	private _setUserId() {
		let userId = null;
		if (!this._orderIsForMe) {
			userId = (this.autoComplete.selectedItem || {}).id;
		}
		this.form.controls['userId'].setValue(userId);
	}

	private _saveActiveOrder() {
		let order = this._scs.getActiveOrder();

		let userId = this.form.controls['userId'].value;
		if (this._orderIsForMe) {
			userId = (this._ctx.currentSession || <any>{}).userid;
		}
		order.userId = userId;
		this._scs.setActiveOrder(order);
	}

	public validateFields() {
		this.nextClicked = true;
		if (this.isNextButtonDisabled) {
			return;
		}

		if (this.form.invalid) {
			Object.keys(this.form.controls).forEach(field => {
				const control = this.form.controls[field];
				control.markAsTouched({ onlySelf: true });
			});
			return;
		}

		this._saveActiveOrder();
		this.onNextClicked.emit();
	}

	public get isNextButtonDisabled() {
		if (this.willexceedKontingent) {
			return true;
		}

		return this.checkingKontingent === true;
	}

	public goBack() {
		this._saveActiveOrder();
		this.onGoBackClicked.emit();
	}
}
