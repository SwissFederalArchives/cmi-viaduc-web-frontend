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
	public nextClicked = false;
	public loading = false;
	public checkingKontingent = false;
	public willexceedKontingent = false;
	public isDroppedDown: boolean = false;

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

		const order = this._scs.getActiveOrder();
		const currentUserId = (this._ctx.currentSession || <any>{}).userid;
		const orderIsForMe = !(order.userId && currentUserId !== order.userId);

		this.form.patchValue({
			orderIsForMe: orderIsForMe,
			userId: order.userId
		});
		this.loading = false;

		setTimeout(() => {
			this.autoComplete.selectedIndex = -1;
		}, 0);

	}

	private 	_prepareUserList(userList: User[]): User[] {
		const list: User[] = [];
		// Alphabetisch sortieren nach Nachnamen
		const sortedUserList = userList.sort((a, b) => {
			if (a && a.familyName && b && b.familyName) {
				if (a.familyName < b.familyName) {
					return -1;
				} else if (a.familyName === b.familyName) {
					return 0;
				}
			}
			return 1;
		});
		for (const user of sortedUserList ) {
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
		const order = this._scs.getActiveOrder();
		if (!this._orderIsForMe && order.type === ShippingType.Digitalisierungsauftrag) {
			this.checkingKontingent = true;
			this.willexceedKontingent = false;
			const userId = this.form.controls['userId'].value;

			this._scs.getKontingent(userId).subscribe(res => {
				if (res.bestellkontingent > 0) {
					this._scs.getOrderableItems().subscribe(ordableItems => {
							this.willexceedKontingent = res.bestellkontingent - ordableItems.length < 0;
						},
						() => {return
						},
						() => {
							this.checkingKontingent = false;
						});
				} else {
					this.willexceedKontingent = true;
					this.checkingKontingent = false;
				}
			},
				() => { this.checkingKontingent = false; },
				() => {return});
		}

	}

	private get _orderIsForMe() {
		return this.form.controls['orderIsForMe'].value;
	}

	private _setUserId() {
		let userId = null;
		if (!this._orderIsForMe) {
			userId = this.autoComplete?.selectedItem?.id;
		}
		this.form.controls['userId'].setValue(userId);
	}

	private _saveActiveOrder() {
		const order = this._scs.getActiveOrder();

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

	// eslint-disable-next-line
	public async onTextChanged(event) {
		if (this.autoComplete.text.length > 2) {
			let alreadySelected = false;
			// Wenn ein Benutzer ausgewählt ist/wird, dann keine neue suche.
			this.userList?.forEach((userName) => {
				if (this.autoComplete.text === userName.displayName) {
					alreadySelected = true;
				}
			});
			if (!alreadySelected) {
				const text = this.autoComplete.text;
				this.loading = true;
				await this._userService.getUsers(text).then((users) => {
					this.loading = false;
					if (users?.length > 0) {
						this.userList = this._prepareUserList(users);
						setTimeout(() => {
							this.autoComplete.selectedIndex = 0;
							this.isDroppedDown = true;
						}, 0);


					} else {
							this.userList = undefined;
						setTimeout(() => {
							this.autoComplete.selectedIndex = -1;
						}, 0);
					}
				});
			}


		}
	}
}
