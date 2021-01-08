import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private firestore: AngularFirestore) { }

  addItem(collection: string, obj: any): Promise<any> {
    return this.firestore.collection(collection).doc(obj.uid).set(Object.assign({}, obj));
  }

  update(collection: string, obj: any): Promise<any> {
    return this.firestore.collection(collection).doc(obj.uid).update(Object.assign({}, obj));
  }

  getAll(collection: string): Promise<any> {
    return this.firestore.collection(collection).get().toPromise();
  }
}
