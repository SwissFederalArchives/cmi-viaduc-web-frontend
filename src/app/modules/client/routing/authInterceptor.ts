import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from '../services';
import {ClientContext} from '@cmi/viaduc-web-core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private auth: AuthenticationService,
				private context: ClientContext) {
	}

	private handleAuthError(err: HttpErrorResponse): Observable<any> {
		// handle your auth error or rethrow
		if (err.status === 401 || err.status === 403) {
			this.context.currentSession = null;
			this.auth.login();
			return of(err.message);
		}
		return throwError(err);
	}

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(catchError(x => this.handleAuthError(x)));
	}
}
