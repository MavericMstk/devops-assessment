import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { NewAssessmentComponent } from './new-assessment/new-assessment.component';
import { AppRoutingModule } from './/app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListAssessmentComponent } from './list-assessment/list-assessment.component';
import { ViewAssessmentComponent } from './view-assessment/view-assessment.component';
import { RecommendationComponent } from './recommendation/recommendation.component';
import { ExportAssessmentComponent } from './export-assessment/export-assessment.component';

@NgModule({
    declarations: [
        AppComponent,
        NewAssessmentComponent,
        ListAssessmentComponent,
        ViewAssessmentComponent,
        RecommendationComponent,
        ExportAssessmentComponent
    ],
    imports: [
        BrowserModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
