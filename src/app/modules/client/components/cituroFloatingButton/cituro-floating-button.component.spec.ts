import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CituroFloatingButtonComponent } from './cituro-floating-button.component';
import {ConfigService, CoreModule, TranslationService} from '@cmi/viaduc-web-core';
import {LocalizeLinkPipe} from '../../pipes';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

describe('CituroFloatingButtonComponent', () => {
  let component: CituroFloatingButtonComponent;
	let txt: TranslationService;
	let cfg: ConfigService;
  let fixture: ComponentFixture<CituroFloatingButtonComponent>;

	cfg = <ConfigService>{
		getSetting(key: string, defaultValue: any): any {
			return defaultValue;
		}
	};
	txt = <TranslationService>{
		translate(text: string, key?: string, ...args): string {
			return text;
		}
	};

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [
			CoreModule,
			ReactiveFormsModule,
			RouterTestingModule
		],
		providers: [
			{ provide: TranslationService, useValue: txt},
			{provide: ConfigService, useValue: cfg},
			{ provide: LocalizeLinkPipe },
		],
      declarations: [ CituroFloatingButtonComponent, LocalizeLinkPipe ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CituroFloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
