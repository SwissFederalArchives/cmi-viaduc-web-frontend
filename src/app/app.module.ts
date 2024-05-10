import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Router, RouterModule} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {ALL_COMPONENTS} from './components/_all';
import {ROUTES, initRoutes} from './routes';
import {CoreModule, OrdersModule, PreloadService, ClientContext} from '@cmi/viaduc-web-core';
import {AuthenticationService, ClientModule, ContextService} from './modules/client';
import {MarkdownModule} from 'ngx-markdown';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './modules/client/routing/authInterceptor';
import {ToastrModule} from 'ngx-toastr';
import { FlatpickrModule} from 'angularx-flatpickr';

initRoutes(ROUTES);

export const toastrOptions = {
	timeOut: 3000,
	positionClass: 'toast-top-center', // PVW-92
	preventDuplicates: true
};

 export function preloadServiceFactory(preloadService: PreloadService, ctx: ContextService) {
	const context = ctx.context.getValue();
	const language = context.loadingLanguage || context.language;
	return () => preloadService.preload(language);
}

@NgModule({

	imports: [
		BrowserModule,
		CoreModule.forRoot(),
		OrdersModule,
		ClientModule.forRoot(),
		RouterModule.forRoot(ROUTES, { useHash: true }),
		ToastrModule.forRoot(toastrOptions),
		MarkdownModule.forRoot(),
		/* eslint-disable */
		FlatpickrModule.forRoot({
			prevArrow: "<svg version='1.1\' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z'></path></svg>",
			nextArrow: "<svg version='1.1\' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z'></path></svg>"
		})
	],
	bootstrap: [RootComponent],
	declarations: [
		...ALL_COMPONENTS
	],
	providers: [
		{
			provide: APP_INITIALIZER,
			useFactory: preloadServiceFactory,
			deps: [PreloadService, ContextService],
			multi: true
		},
		{
			provide: HTTP_INTERCEPTORS,
			useFactory: function(auth: AuthenticationService, context: ClientContext) {
				return new AuthInterceptor(auth, context);
			},
			multi: true,
			deps: [AuthenticationService, ClientContext]
		}
	]

})
export class AppModule {
	constructor(_router: Router) {
		_router.resetConfig(ROUTES);
	}

}

