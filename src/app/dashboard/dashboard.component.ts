import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnChanges, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username = 'Siddhesh';
  @ViewChild('content') content: ElementRef;

  constructor(private modalService: NgbModal, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.openSm(this.content);
    }, 1000);
  }

  openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }

}
