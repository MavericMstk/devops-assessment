import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbTab } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './components/header/header.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        NgbModule,
        HeaderComponent,
        HttpClientModule
    ],
    declarations: [HeaderComponent]
})
export class SharedModule { }
