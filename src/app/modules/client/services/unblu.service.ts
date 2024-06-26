import {Injectable, EventEmitter} from '@angular/core';
import {api, UnbluApi} from '../../../../assets/js/unblu/lib-esm';
import {IndividualUiState} from '../../../../assets/js/unblu/lib-esm/model/individualui_state';
import { UNBLU_APIKEY } from './unblu-apikey';

@Injectable()
export class UnbluService {

	private _api: UnbluApi;
	public onOpenUnbluChat: EventEmitter<void> = new EventEmitter<void>();

	public async openChat(): Promise<void> {
		if (!this.isInitiated()) {
			await this.loadUnbluSnippet();
			await this._api.ui.openIndividualUi();
		} else {
			await this._api.ui.openIndividualUi();
		}
		this.onOpenUnbluChat.emit();
	}

	public async closeChat(): Promise<void> {
		if (this.isInitiated()) {
			const state = await this._api.ui.getIndividualUiState();
			if (state !== IndividualUiState.COLLAPSED) {
				await this._api.ui.toggleIndividualUi();
			}
		}
	}

	public isInitiated(): boolean {
		return !!this._api;
	}

	public async loadUnbluSnippet(): Promise<void> {
		if (this.isInitiated()) {
			return;
		}

		const node = document.createElement('script');
		node.src = `https://unblu.cloud/unblu/visitor.js?x-unblu-apikey=${UNBLU_APIKEY}`;
		node.type = 'text/javascript';
		node.async = false;
		document.getElementsByTagName('head')[0].appendChild(node);
		// eslint-disable-next-line
		await new Promise((resolve, reject) => {
			node.onload = resolve;
		});

		this._api = await api.initialize();
	}
}
