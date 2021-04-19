import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'cmi-viaduc-account-type-info-list',
	templateUrl: 'accountTypeInfoList.component.html',
	styleUrls: ['accountTypeInfoList.component.less']
})
export class AccountTypeInfoListComponent implements OnInit {
	@Input()
	public isRegistered: boolean = true;
	@Input()
	public isIdentified: boolean = false;
	@Input()
	public canCollapse: boolean = false;

	constructor() {
	}

	public ngOnInit(): void {
	}
}
