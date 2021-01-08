import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from 'src/app/models/product/product.model';
import { DbService } from 'src/app/services/db/db.service';
import { ConfirmDeleteComponent } from '../../confirm-delete/confirm-delete/confirm-delete.component';
import { AddProductComponent } from '../add-product/add-product.component';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {

  tableData: any[] = [];

  firstInResponse: any = [];

  lastInResponse: any = [];

  prev_strt_at: any = [];

  pagination_clicked_count = 0;

  disable_next: boolean = false;
  disable_prev: boolean = false;

  constructor(
    private modalService: NgbModal,
    private firestore: AngularFirestore,
    private dbService: DbService
  ) {
    this.loadItems();
  }

  ngOnInit() {
    //todo
  }

  addItem() {
    this.modalService.open(AddProductComponent, { size: 'xl' });
  }

  async edit(product: Product) {
    this.openModal(product);
  }

  async openModal(product: Product) {
    const modal = this.modalService.open(AddProductComponent, {
      size: 'xl',
    });

    modal.componentInstance.product = product;
    modal.result.then(
      (resultModal) => { },
      async (reason) => {
        if (reason) {
          this.loadItems();
        }
      }
    );
  }

  loadItems() {
    this.firestore.collection('products', ref => ref
      .limit(5)
      .orderBy('name', 'desc')
    ).snapshotChanges()
      .subscribe(response => {
        if (!response.length) {
          return false;
        }
        this.firstInResponse = response[0].payload.doc;
        this.lastInResponse = response[response.length - 1].payload.doc;

        this.tableData = [];
        for (let item of response) {
          if (item.payload.doc.data())
            this.tableData.push(item.payload.doc.data());

          this.tableData = this.tableData.filter(res => {
            return res.deleted == false;
          })
        }

        this.prev_strt_at = [];
        this.pagination_clicked_count = 0;
        this.disable_next = false;
        this.disable_prev = false;

        this.push_prev_startAt(this.firstInResponse);
      }, error => {
      });
  }

  prevPage() {
    this.disable_prev = true;
    this.firestore.collection('products', ref => ref
      .orderBy('name', 'desc')
      .startAt(this.get_prev_startAt())
      .endBefore(this.firstInResponse)
      .limit(5)
    ).get()
      .subscribe(response => {
        this.firstInResponse = response.docs[0];
        this.lastInResponse = response.docs[response.docs.length - 1];

        this.tableData = [];
        for (let item of response.docs) {
          this.tableData.push(item.data());

          this.tableData = this.tableData.filter(res => {
            return res.deleted == false;
          })
        }

        this.pagination_clicked_count--;

        this.pop_prev_startAt(this.firstInResponse);

        this.disable_prev = false;
        this.disable_next = false;
      }, error => {
        this.disable_prev = false;
      });
  }

  nextPage() {
    this.disable_next = true;
    this.firestore.collection('products', ref => ref
      .limit(5)
      .orderBy('name', 'desc')
      .startAfter(this.lastInResponse)
    ).get()
      .subscribe(response => {

        if (!response.docs.length) {
          this.disable_next = true;
          return;
        }

        this.firstInResponse = response.docs[0];

        this.lastInResponse = response.docs[response.docs.length - 1];
        this.tableData = [];
        for (let item of response.docs) {
          this.tableData.push(item.data());

          this.tableData = this.tableData.filter(res => {
            return res.deleted == false;
          })
        }

        this.pagination_clicked_count++;

        this.push_prev_startAt(this.firstInResponse);

        this.disable_next = false;
      }, error => {
        this.disable_next = false;
      });
  }

  push_prev_startAt(prev_first_doc: any) {
    this.prev_strt_at.push(prev_first_doc);
  }

  pop_prev_startAt(prev_first_doc: any) {
    this.prev_strt_at.forEach((element: any) => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }

  get_prev_startAt() {
    if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
      this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }

  bindDate(date: any) {
    return date.toDate();
  }

  confirmDelete(product: Product) {
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      centered: true,
      size: 'lg',
    });

    modal.result.then(
      (_) => {
        // do nothing
      },
      async (reason) => {
        if (reason) {
          await this.deleteItem(product);
        }
      }
    );
  }

  async deleteItem(product: Product) {
    try {
      product.deleted = true;
      product.removeAt = new Date();
      await this.dbService.update('products', product);
    } catch (error) {
      console.error(error);
    }
  }

}
