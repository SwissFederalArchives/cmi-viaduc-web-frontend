import {interval as observableInterval, Subscription} from 'rxjs';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PublicService} from '../../../../services';
import {SynonymGruppe} from '../../../../model';

@Component({
	selector: 'cmi-viaduc-search-synonym-icon',
	templateUrl: 'searchSynonymeIcon.component.html',
	styleUrls: ['searchSynonymeIcon.component.less']
})
export class SearchSynonymeIconComponent implements OnInit {
	@Input()
	public searchTerm: string;

	@Input()
	public controlId: string;

	@Output()
	public addSynonymToSearchClicked: EventEmitter<string> = new EventEmitter<string>();

	public synonymList: SynonymGruppe[];
	public showSynonymListIcon: boolean;
	public showSynonymList: boolean;

	private synonymTimer: Subscription;

	constructor(private _publicService: PublicService) {
	}

	public ngOnInit(): void {
		this.showSynonymList = false;
		this.showSynonymListIcon = false;
		this.synonymTimer = null;
	}

	public clickShowSynonym(): void {
		this.showSynonymList = true;
	}

	public onAddSynonymToSearchClicked(searchString: string): void {
		// Falls kein Synonym gewählt Glühbrine stehen lassen
		this.showSynonymListIcon = searchString.indexOf('(') < 0;

		this.addSynonymToSearchClicked.emit(searchString);
	}

	public setSynonymSearchTimer() {
		this.stopSynonymSearchTimer();

		this.synonymTimer = observableInterval(500).subscribe(val => {
			this.searchSynonyme();
		});
	}

	public stopSynonymSearchTimer() {
		if (this.synonymTimer != null) {
			this.synonymTimer.unsubscribe();
			this.synonymTimer = null;
		}
	}

	private searchSynonyme(): void {
		this.showSynonymListIcon = false;
		this.stopSynonymSearchTimer();

		// Prüfen ob bereits eine Suche abegesetzt wurde
		if (!this.searchTerm) {
			return;
		}
		if (this.searchTerm.length === 0 || this.searchTerm.indexOf('(') >= 0) {
			return;
		}

		this._publicService.getSynonyme(this.searchTerm)
			.subscribe(syn => this.synonymList = syn, (e => console.error(e)), () => this.setVisibiltySynonymResult());
	}

	private setVisibiltySynonymResult(): void {
		if (this.synonymList.length > 0) {
			this.showSynonymListIcon = true;
		}
	}
}
