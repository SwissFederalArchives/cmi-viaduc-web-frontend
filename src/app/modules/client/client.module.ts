import {NgModule, ModuleWithProviders } from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ALL_COMPONENTS} from './components/_all';
import {ALL_DIRECTIVES} from './directives/_all';
import {ALL_PIPES} from './pipes/_all';
import {ALL_SERVICES} from './services/_all';
import {ALL_GUARDS} from './routing/_all';
import {ALL_RESOLVERS} from './routing/_all';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule, WijmoModule} from '@cmi/viaduc-web-core';

@NgModule({
	declarations: [
		...ALL_COMPONENTS,
		...ALL_DIRECTIVES,
		...ALL_PIPES
	],
	exports: [
		...ALL_COMPONENTS,
		...ALL_DIRECTIVES,
		...ALL_PIPES,
		CommonModule,
		RouterModule,
		FormsModule,
		BrowserAnimationsModule,
		WijmoModule
	],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		ReactiveFormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		CoreModule,
		WijmoModule
	]
})

export class ClientModule {

	constructor() {
	}

	public static forRoot(): ModuleWithProviders<ClientModule> {
		return {
			ngModule: ClientModule,
			providers: [
				...ALL_SERVICES,
				...ALL_GUARDS,
				...ALL_RESOLVERS
			]
		};
	}
}
