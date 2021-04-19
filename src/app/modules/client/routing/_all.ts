// Guards
import {DefaultContextGuard} from './defaultContextGuard';
import {DetailContextGuard} from './detailContextGuard';
import {DefaultRedirectGuard} from './defaultRedirectGuard';
import {AuthGuard} from './authGuard';

export const ALL_GUARDS = [
	DefaultContextGuard,
	DetailContextGuard,
	DefaultRedirectGuard,
	AuthGuard
];

// Resolvers
import {NotFoundResolver} from './notFoundResolver';
import {PreloadedResolver, TranslationsLoadedResolver, UserSettingsResolver} from './preloadResolvers';

export const ALL_RESOLVERS = [
	NotFoundResolver,
	PreloadedResolver,
	UserSettingsResolver,
	TranslationsLoadedResolver
];
