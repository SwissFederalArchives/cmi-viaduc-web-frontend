import {SimpleSearchPageComponent} from './components/simpleSearchPage/simpleSearchPage.component';
import {SearchResultPageComponent} from './components/searchResultPage/searchResultPage.component';
import {AdvancedSearchPageComponent} from './components/advancedSearchPage/advancedSearchPage.component';
import {DetailPageComponent} from './components/detailPage/detailPage.component';
import {AccountPageComponent} from './components/account/accountPage.component';
import {AccountFavoritesDetailPageComponent} from './components/account/favorites/favoritesDetailPage/favoritesDetailPage.component';
import {AuthPageComponent} from './components/authPage/authPage.component';
import {StaticPageComponent} from './components/staticPage/staticPage.component';
import {ArchivplanPageComponent} from './components/archivplanPage/archivplanPage.component';
import {ContactDetailPageComponent} from './components/account/contactDetailPage/contactDetailPage.component';
import {AccountSettingsPageComponent} from './components/account/accountSettingsPage/accountSettingsPage.component';
import {ShoppingCartPageComponent} from './components/shoppingCartPage/shoppingCartPage.component';
import {OrderCheckoutPageComponent} from './components/orderCheckoutPage/orderCheckoutPage.component';
import {OrderOverviewPage} from './components/account/orderOverviewPage/orderOverviewPage.component';
import {Routing, Utilities as _util, CountriesResolver, CanDeactivateGuard} from '@cmi/viaduc-web-core';
import {Route, UrlMatchResult, UrlSegment} from '@angular/router';
import {AccountFavoritesListPageComponent} from './components/account/favorites/favoritesListPage/favoritesListPage.component';
import {AuthGuard, DefaultContextGuard, DefaultRedirectGuard, DetailContextGuard} from './modules/client/routing';
import {PreloadedResolver, TranslationsLoadedResolver, UserSettingsResolver} from './modules/client/routing';
import {OrderEinsichtCheckoutPageComponent} from './components/orderEinsichtCheckoutPage/orderEinsichtCheckoutPage.component';
import {RegisterPageInfoComponent} from './components/register/registerPageInfo/registerPageInfo.component';
import {RegisterPageComponent} from './components/register/registerPage/registerPage.component';
import {ErrorPageComponent} from './components/errorPage/errorPage.component';
import {ErrorSmartcardPageComponent} from './components/errorPage/errorSmartcardPage.component';

// region Template for localizable routes.
export const defaultRouteChildren: any = [
	{
		path: '',
		redirectTo: 'suche',
		pathMatch: 'full'
	},
	{
		path: 'archiv',
		_localize: {'fr': 'archive', 'it': 'archivio', 'en': 'archive'},
		children: [
			{
				path: '',
				redirectTo: 'einheit',
				pathMatch: 'full'
			},
			{
				path: 'einheit/:id',
				_localize: {'fr': 'unite', 'it': 'unita', 'en': 'unit'},
				component: DetailPageComponent
			}
		]
	},
	{
		path: 'beratung',
		_localize: {'fr': 'conseil', 'it': 'consulenza', 'en': 'advice'},
		component: StaticPageComponent
	},
	{
		path: 'informationen',
		_localize: {'fr': 'informations', 'it': 'informazioni', 'en': 'information'},
		children: [
			{
				path: 'bestaende',
				_localize: {'fr': 'fonds', 'it': 'fondi', 'en': 'fonds'},
				component: StaticPageComponent
			},
			{
				path: 'suchen',
				_localize: {'fr': 'recherch', 'it': 'ricercare', 'en': 'searching'},
				component: StaticPageComponent
			},
			{
				path: 'api',
				_localize: {'fr': 'api', 'it': 'api', 'en': 'api'},
				component: StaticPageComponent
			},
			{
				path: 'registrieren-und-identifizieren',
				_localize: {
					'fr': 'inscription-et-identification',
					'it': 'registrazione-e-identificazione',
					'en': 'login-and-identification'
				},
				component: StaticPageComponent
			},
			{
				path: 'bestellen-und-konsultieren',
				_localize: {
					'fr': 'commande-et-consultation',
					'it': 'ordinazione-e-consultazione',
					'en': 'ordering-and-consulting'
				},
				component: StaticPageComponent
			},
			{
				path: 'schutzfristen-und-einsichtsgesuche',
				_localize: {
					'fr': 'delais-de-protection-et-demandes-de-consultation',
					'it': 'termini-di-protezione-e-domande-di-consultazione',
					'en': 'closure-periods-and-requests-to-consult-records'
				},
				component: StaticPageComponent
			},
			{
				path: 'zitieren-und-publizieren',
				_localize: {
					'fr': 'citer-et-publier',
					'it': 'citazione-e-pubblicazione',
					'en': 'citing-and-publishing'
				},
				component: StaticPageComponent
			}
		]
	},
	{
		path: 'kontakt',
		_localize: {'fr': 'contact', 'it': 'contatto', 'en': 'contact'},
		component: StaticPageComponent
	},
	{
		path: 'konto',
		_localize: {'fr': 'compte', 'it': 'conto', 'en': 'account'},
		children: [
			{
				path: '',
				component: AccountPageComponent,
				canActivate: [AuthGuard],
				resolve: {preLoaded: PreloadedResolver}
			},
			{
				path: 'favoriten',
				_localize: {'fr': 'favoris', 'it': 'preferiti', 'en': 'favorites'},
				component: AccountFavoritesListPageComponent,
				canActivate: [AuthGuard]
			},
			{
				path: 'favoriten/:id',
				_localize: {'fr': 'favoris', 'it': 'preferiti', 'en': 'favorites'},
				component: AccountFavoritesDetailPageComponent,
				canActivate: [AuthGuard]
			},
			{
				path: 'bestellkorb',
				_localize: {'fr': 'ordini', 'it': 'carrello', 'en': 'cart'},
				children: [
					{
						path: '',
						component: ShoppingCartPageComponent,
						canActivate: [AuthGuard],
						resolve: {error: PreloadedResolver},
					},
					{
						path: 'bestellung',
						_localize: {'fr': 'commande', 'it': 'ordinazione', 'en': 'order'},
						component: OrderCheckoutPageComponent,
						canActivate: [AuthGuard],
						resolve: {preLoaded: PreloadedResolver}
					},
					{
						path: 'einsichtsgesuch',
						_localize: {'fr': 'demande-de-consultation', 'it': 'domanda-di-consultazione', 'en': 'consultation-request'},
						component: OrderEinsichtCheckoutPageComponent,
						canActivate: [AuthGuard],
						resolve: {preLoaded: PreloadedResolver}
					},
				]
			},
			{
				path: 'bestellungen',
				_localize: {'fr': 'ordres', 'it': 'ordini', 'en': 'orders'},
				component: OrderOverviewPage,
				canActivate: [AuthGuard],
				resolve: {preLoaded: PreloadedResolver}
			},
			{
				path: 'benutzerangaben',
				_localize: {'fr': 'donnes-d-utilisateur', 'it': 'dati-utente', 'en': 'userdata'},
				component: ContactDetailPageComponent,
				canActivate: [AuthGuard],
				resolve: {preLoaded: PreloadedResolver, countries: CountriesResolver }
			},
			{
				path: 'benutzeroberflaeche',
				_localize: {'fr': 'interface-utilisateur', 'it': 'interfaccia-utente', 'en': 'userinterface'},
				component: AccountSettingsPageComponent,
				canActivate: [AuthGuard],
				resolve: {
					userSettingsLoaded: UserSettingsResolver
				}
			},
			{
				path: 'kontoeroeffnung',
				_localize: {'fr': 'creation-d-un-compte', 'it': 'apertura-di-un-conto', 'en': 'opening-an-account'},
				component: RegisterPageInfoComponent
			},
			{
				path: 'registrieren',
				_localize: {'fr': 'enregistrement', 'it': 'registrazione', 'en': 'registration'},
				component: RegisterPageComponent,
				canActivate: [AuthGuard],
				canDeactivate: [CanDeactivateGuard ],
				resolve: {
					preLoaded: PreloadedResolver
				}
			}
		]
	},
	{
		path: 'nutzungsbestimmungen-und-datenschutz',
		_localize: {'fr': 'conditions-d-utilisation-et-protection-des-donnees', 'it': 'condizioni-di-utilizzazione-e-protezione-dei-dati', 'en': 'conditions-of-use-and-data-protection'},
		component: StaticPageComponent
	},
	{
		path: 'rechtliches',
		_localize: {'fr': 'informations-juridiques', 'it': 'basi-legali', 'en': 'terms-and-conditions'},
		component: StaticPageComponent
	},
	{
		path: 'suche',
		_localize: {'fr': 'recherche', 'it': 'ricerca', 'en': 'search'},
		children: [
			{
				path: '',
				redirectTo: 'einfach',
				pathMatch: 'full'
			},
			{
				path: 'einfach',
				_localize: {'fr': 'simple', 'it': 'semplice', 'en': 'simple'},
				component: SimpleSearchPageComponent,
				resolve: {translationsLoaded: TranslationsLoadedResolver, preloaded: UserSettingsResolver}
			},
			{
				path: 'erweitert',
				_localize: {'fr': 'avancee', 'it': 'avanzate', 'en': 'advanced'},
				component: AdvancedSearchPageComponent,
				resolve: {preloaded: PreloadedResolver, countries: CountriesResolver}
			},
			{
				path: 'resultat',
				_localize: {'fr': 'resultat', 'it': 'risultato', 'en': 'result'},
				component: SearchResultPageComponent,
				resolve: {userSettingsLoaded: UserSettingsResolver}
			},
			{
				path: 'bestaendeuebersicht',
				_localize: {
					'fr': 'apercu-par-theme',
					'it': 'sommario-dei-fondi',
					'en': 'thematic-overview'
				},
				component: StaticPageComponent
			},
			{
				path: 'archivplan',
				_localize: {'fr': 'plan-d-archivage', 'it': 'piano-di-archivio', 'en': 'archive-plan'},
				component: ArchivplanPageComponent,
				resolve: {preloaded: PreloadedResolver}
			},
			{
				path: 'archivplan/:id',
				_localize: {'fr': 'plan-d-archivage', 'it': 'piano-di-archivio', 'en': 'archive-plan'},
				component: ArchivplanPageComponent,
				resolve: {preloaded: PreloadedResolver},
			},
		]
	},
	{
		path:'ueber',
		_localize:{'fr': 'a-propos', 'it': 'chi-siamo', 'en': 'about'},
		children: [
			{
				path:'ueber',
				_localize:{'fr': 'a-propos', 'it': 'chi-siamo', 'en': 'about'},
				component: StaticPageComponent
			}
		]
	},
	{
		path:'error',
		_localize: {'fr': 'erreur', 'it': 'errore', 'en': 'error'},
		component: ErrorPageComponent
	},
	{
		path:'error-smartcard',
		_localize: {'fr': 'erreur-smartcard', 'it': 'errore-smartcard', 'en': 'error-smartcard'},
		component: ErrorSmartcardPageComponent
	},
];

// endregion

const langMatcher = /^(de|fr|it|en)$/;

export function LanguageMatcher(url: UrlSegment[]): UrlMatchResult {
	if (url.length !== 1) {
		return null;
	}
	const lang = url[0].toString();
	if (lang.match(langMatcher)) {
		return ({ consumed: url, posParams: { lang: url[0] } });
	}
	return null;
}

export function LanguageIdMatcher(url: UrlSegment[]): UrlMatchResult {
	if (url.length !== 2) {
		return null;
	}

	const idMatcher = /^[0-9]*$/;
	const lang = url[0].toString();
	const id = url[1].toString();
	if (lang.match(langMatcher) && id.match(idMatcher)) {
		return ({ consumed: url, posParams: { lang: url[0], id: url[1] } });
	}
	return null;
}

export const ROUTES: any = [
	{
		path: 'auth/success',
		component: AuthPageComponent,
		resolve: {preloaded: PreloadedResolver},
		canActivate: [DefaultContextGuard],
	},
	{
		path: 'de',
		children: defaultRouteChildren, // keep here, so lazy modules are recognized by AOT build
		localizeWithDefault: true,
	},
	{
		path: 'fr',
		children: []
	},
	{
		path: 'it',
		children: []
	},
	{
		path: 'en',
		children: []
	},
	{
		matcher: LanguageMatcher,
		children: []
	},
	{
		matcher: LanguageIdMatcher,
		component: DetailPageComponent,
		canActivate: [DetailContextGuard]
	},
	{
		path: '**',
		component: StaticPageComponent,
		canActivate: [DefaultRedirectGuard]
	}
];

function assertRoutes(routes: any[]) {
	Routing.assertRoutes(routes, {
		assertRoute: (route: Route) => {
			if (_util.isEmpty(route.component)
				&& _util.isEmpty(route.redirectTo)
				&& _util.isEmpty(route.loadChildren)
				&& (!_util.isArray(route.children) || route.children.length <= 0)) {
				route.component = StaticPageComponent;
			}
			if (!_util.isEmpty(route.component) && _util.isEmpty(route.canActivate)) {
				route.canActivate = [DefaultContextGuard];
			}
			if (!_util.isEmpty(route.component) && route.component !== StaticPageComponent) {
				const resolve = route.resolve = _util.isObject(route.resolve) ? route.resolve : {};
				resolve['translationsLoaded'] = TranslationsLoadedResolver;
			}
		}
	});

	Routing.collectLocalizations(Routing.supportedLanguages, routes);
}

let initialized = false;
export function initRoutes(routes: any[]) {
	if (initialized) {
		return;
	}
	initialized = true;

	assertRoutes(defaultRouteChildren);

	routes.forEach((route) => {
		if (route.localizeWithDefault || (_util.isArray(route.children) && _util.isEmpty(route.children))) {
			if (_util.isString(route.path) && route.path.match(langMatcher)) {
				route.children = Routing.localizeRoutes(route.path, defaultRouteChildren);
			} else {
				route.children = defaultRouteChildren;
			}
		}
	});

	console.log('initRoutes', routes);
}
