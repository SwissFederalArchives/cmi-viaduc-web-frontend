import { Component, Input } from '@angular/core';

@Component({
	selector: 'cmi-viaduc-account-type-info-list',
	templateUrl: 'accountTypeInfoList.component.html',
	styleUrls: ['accountTypeInfoList.component.less']
})
export class AccountTypeInfoListComponent {
	@Input()
	public isRegistered = true;
	@Input()
	public isIdentified = false;
	@Input()
	public canCollapse = false;
}
