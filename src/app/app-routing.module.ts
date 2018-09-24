import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAssessmentComponent } from './list-assessment/list-assessment.component';
import { NewAssessmentComponent } from './new-assessment/new-assessment.component';

const routes: Routes = [
    { path: '', redirectTo: '/list', pathMatch: 'full' },
    { path: 'new-assessment', component: NewAssessmentComponent },
    { path: 'list', component: ListAssessmentComponent },
    { path: ':action/:assessmentToken', component: NewAssessmentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
