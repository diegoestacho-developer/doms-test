import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.css']
})
export class ConfirmDeleteComponent implements OnInit {

  label = '';
  modalRef: NgbModalRef;

  constructor(private modal: NgbModal) { }

  ngOnInit(): void {
  }

  closeModal(reason) {
    if (this.modalRef) {
      this.modalRef.dismiss(reason);
    } else {
      this.modal.dismissAll(reason);
    }
  }

}
