import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Router, RouterModule} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {ALL_COMPONENTS} from './components/_all';
import {ROUTES, initRoutes} from './routes';
import {CoreModule, OrdersModule, PreloadService, ClientContext} from '@cmi/viaduc-web-core';
import {AuthenticationService, ClientModule, ContextService} from './modules/client';
import { MatomoModule } from 'ngx-matomo';
import {MarkdownModule} from 'ngx-markdown';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './modules/client/routing/authInterceptor';
import {ToastrModule} from 'ngx-toastr';

initRoutes(ROUTES);

export const toastrOptions = {
	timeOut: 3000,
	positionClass: 'toast-top-center', // PVW-92
	preventDuplicates: true
};

export function preloadServiceFactory(preloadService: PreloadService, ctx: ContextService) {
	let context = ctx.context.getValue();
	let language = context.loadingLanguage || context.language;
	return () => preloadService.preload(language);
}

@NgModule({
	imports: [
		BrowserModule,
		CoreModule.forRoot(),
		OrdersModule,
		ClientModule.forRoot(),
		RouterModule.forRoot(ROUTES, { useHash: true, relativeLinkResolution: 'legacy' }),
		ToastrModule.forRoot(toastrOptions),
		MatomoModule,
		MarkdownModule.forRoot()
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
