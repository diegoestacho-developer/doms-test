import { Injectable } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask
} from '@angular/fire/storage';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  percentage: Observable<number>;
  snapshot: Observable<any>;
  task: AngularFireUploadTask;
  uploadTask: AngularFireUploadTask;
  uploadPercent: Observable<any>;
  uploadSnapshot: Observable<any>;

  toasts: any[] = [];

  constructor(
    private storageFire: AngularFireStorage
  ) { }

  uid() {
    return (
      this.s4() +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      this.s4() +
      this.s4()
    );
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  getFireUrl(reference: any): Promise<string> {
    return this.storageFire.ref(reference).getDownloadURL().toPromise();
  }

  uploadFile(file: File, filename: string, base64 = null) {
    if (base64) {
      const ref = this.storageFire.ref(filename);
      this.uploadTask = ref.putString(base64, 'data_url');
    } else {
      this.uploadTask = this.storageFire.upload(filename, file);
    }
    this.uploadPercent = this.uploadTask.percentageChanges();
    this.uploadSnapshot = this.uploadTask.snapshotChanges();
  }
}
