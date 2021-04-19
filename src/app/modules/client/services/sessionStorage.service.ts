import {Injectable} from '@angular/core';

@Injectable()
export class SessionStorageService {
	public getItem<T>(key: string): T {
		return <T>JSON.parse(window.sessionStorage.getItem(key) || null);
	}

	public setItem(key: string, item: any): void {
		window.sessionStorage.setItem(key, JSON.stringify(item));
	}

	public clear(): void {
		window.sessionStorage.clear();
	}

	public setUrl(key: string, item: string) {
		window.sessionStorage.setItem(key, item);
	}

	public getUrl(key: string): string {
		return window.sessionStorage.getItem(key) as string;
	}
}
