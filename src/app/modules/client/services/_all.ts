import {SessionStorageService} from './sessionStorage.service';
import {UrlService} from './url.service';
import {SeoService} from './seo.service';
import {ContextService} from './context.service';
import {UserService} from './user.service';
import {AuthorizationService} from './authorization.service';
import {AuthenticationService} from './authentication.service';
import {FavoriteService} from './favorite.service';
import {EntityService} from './entity.service';
import {EntityRenderService} from './entityRender.service';
import {SearchService} from './search.service';
import {AdvancedSearchService} from './advancedSearch.service';
import {ShoppingCartService} from './shoppingCart.service';
import {NewsService} from './news.service';
import {PublicService} from './synonym.service';
import {StaticContentService} from './staticContent.service';
import {DownloadTokenService} from './downloadToken.service';
import {UnbluService} from './unblu.service';
import {ChatBotService} from './chatbot.service';

export const ALL_SERVICES = [
	SessionStorageService,
	UrlService,
	SeoService,
	ContextService,
	UserService,
	AuthorizationService,
	AuthenticationService,
	FavoriteService,
	EntityService,
	EntityRenderService,
	AdvancedSearchService,
	SearchService,
	ShoppingCartService,
	UnbluService,
	StaticContentService,
	NewsService,
	PublicService,
	ChatBotService,
	DownloadTokenService
];
