import {Injectable, NgModule} from '@angular/core';
import {IndividualConfig, ToastPackage, ToastRef, ToastrModule, ToastrService} from 'ngx-toastr';
import {ParamMap} from '@angular/router';
@Injectable()
class Mocks extends ToastPackage {
	constructor() {
		const toastConfig = { toastClass: 'custom-toast' };
		super(1, <IndividualConfig>toastConfig, 'test message', 'test title', 'show', new ToastRef(null));
	}
}

export class MockUserSettingsParamMap implements ParamMap {
	public readonly keys: string[];

	public get(name: string): string | null {
		return 'new';
	}

	public getAll(name: string): string[] {
		return [];
	}

	public has(name: string): boolean {
		return false;
	}
}

@NgModule({
	providers: [
		{ provide: ToastPackage, useClass: Mocks },
		{ provide: ToastrService, useClass: ToastrService }
	],
	imports: [
		ToastrModule.forRoot(),
	],
	exports: [
		ToastrModule
	]
})
export class ToastrTestingModule {
}
