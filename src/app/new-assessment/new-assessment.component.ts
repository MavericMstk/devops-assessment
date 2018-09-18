import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap/accordion/accordion';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AssessmentPhase, AssessmentPhaseTool, Assessment } from '../shared/interfaces/assessment';
import { AssessmentService } from '../shared/services/assessment.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { CheckboxFormControl } from '../shared/interfaces/custom-form-controls';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-new-assessment',
    templateUrl: './new-assessment.component.html',
    styleUrls: ['./new-assessment.component.css']
})
export class NewAssessmentComponent implements OnInit, NgbPanelChangeEvent {

    panelId;
    nextState;
    preventDefault;

    @ViewChild('content') content: ElementRef;
    errorMessage = '';

    envManagedByMaster = environment.envManagedByMaster;
    statusMaster = environment.statusMaster;
    automationStatusMaster = environment.automationStatusMaster;

    assessmentToken: string;
    assessmentData: Assessment;
    formDisableStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    assessmentForm = this.fb.group({
        accountName: ['', Validators.required],
        projectName: ['', Validators.required],
        automationStatus: ['None', Validators.required],
        platform: ['Open Source', Validators.required],
        summary: [''],
        environments: this.fb.array([]),
        assessmentPhases: this.fb.array([])
    });

    constructor(private fb: FormBuilder, private srvAssessment: AssessmentService, private cdRef: ChangeDetectorRef,
        private modalService: NgbModal, private route: ActivatedRoute) { }

    ngOnInit() {
        this.panelId = 'toggle-base';
        // this.assessmentTools = environment.assessmentPhaseTools;

        this.formDisableStatus.subscribe(status => {
            console.log('status -> ' + status);
            if (status) {
                this.assessmentForm.disable();
            } else {
                this.assessmentForm.enable();
            }
        });

        this.createEnvironments();
        this.createAssessmentPhases();

        const assessmentToken = this.route.snapshot.paramMap.get('assessmentToken');
        console.log(assessmentToken);
        if (assessmentToken) {
            this.assessmentToken = assessmentToken;
        }
    }

    getAssessment(): void {
        this.formDisableStatus.next(true);
        this.srvAssessment.getAssessment(this.assessmentToken)
            .subscribe(assessmentDetails => {
                // this.parseAssessment(assessmentDetails);
                this.assessmentData = assessmentDetails;
                this.assessmentForm.patchValue(this.assessmentData);
                this.prepopulateForm();
                this.formDisableStatus.next(false);
            });
    }

    prepopulateForm() {
        if (this.assessmentData) {

            (this.assessmentForm.get('assessmentPhases') as FormArray).controls.forEach((assessmentPhase: FormGroup) => {
                const currentPhase = this.assessmentData.assessmentPhases.find((dataAssessmentPhase: AssessmentPhase) => {
                    return dataAssessmentPhase.phaseId === assessmentPhase.get('phaseId').value;
                });
                if (currentPhase.phaseId) {
                    (assessmentPhase.get('assessmentPhaseTools') as FormArray).controls.forEach((toolElem: CheckboxFormControl) => {
                        // phaseTools.defaultValue
                        toolElem.setValue(false);
                        toolElem.disable();
                        currentPhase.assessmentPhaseTools.forEach(dataPhaseTool => {
                            if (toolElem.defaultValue === dataPhaseTool.toolName) {
                                toolElem.setValue(true);
                            }
                        });
                    });
                }
            });
        }
    }

    createEnvironments() {
        this.formDisableStatus.next(true);
        if (environment.environmentsMaster) {
            environment.environmentsMaster.forEach(environmentElem => {

                // tslint:disable-next-line:prefer-const
                let env = this.fb.group({
                    env: environmentElem,
                    applicable: '',
                    managedBy: '',
                    autoDeloy: '',
                    remarks: ''
                });
                const test = this.assessmentForm.get('environments') as FormArray;  // . addControl(phase);
                test.push(env);

            });

            this.cdRef.detectChanges();
        }
        this.formDisableStatus.next(false);
    }

    createAssessmentPhases() {
        this.formDisableStatus.next(true);
        this.srvAssessment.getMaster().subscribe(masters => {
            const defaultAutomationStatus = this.automationStatusMaster[0];
            if (masters.assessmentPhases.length) {
                masters.assessmentPhases.forEach((assessmentPhase, index) => {

                    // Convert to tools to checkboxes
                    let assessmentPhaseTools: FormControl[] = [];
                    assessmentPhaseTools = assessmentPhase.tools.map(tool => {
                        const chkbox = new CheckboxFormControl({ value: null, disabled: true });
                        chkbox.defaultValue = tool.toolName;
                        if (this.formDisableStatus.getValue()) {
                            chkbox.disable();
                        }
                        return chkbox;
                    });

                    // tslint:disable-next-line:prefer-const
                    let phase = this.fb.group({
                        phaseId: assessmentPhase.phaseId,
                        phaseName: assessmentPhase.phaseName,
                        automationStatus: 'None',
                        processes: '',
                        automationSatisfaction: 'No',
                        observations: '',
                        remarks: '',
                        assessmentPhaseTools: this.fb.array(assessmentPhaseTools),
                        assessmentPhaseOtherTools: ''
                    });
                    const test = this.assessmentForm.get('assessmentPhases') as FormArray;
                    test.push(phase);
                    this.cdRef.detectChanges();
                    this.formDisableStatus.next(true);
                });
                if (this.assessmentToken) {
                    this.getAssessment();
                } else {
                    this.formDisableStatus.next(false);
                }
                this.cdRef.detectChanges();
            }
        });
    }


    public toggleAccordian(props: NgbPanelChangeEvent) {
        this.panelId = (props.nextState) ? props.panelId : '';
        // props.nextState   // true === panel is toggling to an open state // false === panel is toggling to a closed state
        // props.panelId;    // the ID of the panel that was clicked
        // props.preventDefault(); // don't toggle the state of the selected panel
        // console.log(props);
        // return true;
    }

    get assessmentPhases(): FormArray {
        return this.assessmentForm.get('assessmentPhases') as FormArray;
    }

    setAutomationStatus() {
        if (this.assessmentForm.get('automationStatus').value === 'Fully Automated') {
            const phases = this.assessmentForm.get('assessmentPhases') as FormArray;
            phases.controls.forEach(phase => {
                phase.get('automationStatus').setValue('Fully Automated');
            });
        }
    }

    saveDetails() {
        console.log(this.assessmentForm);
        if (this.assessmentForm.valid) {
            const phases = this.assessmentForm.get('assessmentPhases') as FormArray;

            // Removed unchecked tools from form
            phases.controls.forEach(phase => {
                const tools = phase.get('assessmentPhaseTools') as FormArray;
                tools.controls.forEach((tool, toolIndex) => {
                    if (!tool.value) {
                        tools.removeAt(toolIndex);
                    }
                });
            });

        } else {
            this.markFormGroupTouched(this.assessmentForm);
            this.assessmentForm.markAsTouched({ onlySelf: true });
            this.errorMessage = 'Please provide all mandatory information.';
            this.showError();
        }
        console.log(JSON.stringify(this.assessmentForm.value));
        return false;
    }

    showError() {
        this.modalService.open(this.content, {
            ariaLabelledBy: 'modal-basic-title'
        });
    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            if (control.controls) { // control is a FormGroup
                this.markFormGroupTouched(control);
            } else { // control is a FormControl
                control.markAsTouched();
            }
        });
    }
}
