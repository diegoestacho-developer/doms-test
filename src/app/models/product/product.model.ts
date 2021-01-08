import { BaseModel } from "../base/base.model";

export class Product extends BaseModel {
  uid: string;
  name: string;
  description: string;
  mainImageUrl: string;
  mainImageFullPath: string;
  images: Array<any>;
  productionValue: number;
  saleValue: number;
  profitValue: number;
  profitPercentage: number;
  deleted: boolean;
  expirationDate: Date;

  constructor({
    uid,
    name,
    description,
    mainImageUrl,
    mainImageFullPath,
    images,
    productionValue,
    saleValue,
    profitValue,
    profitPercentage,
    deleted,
    createdAt,
    editAt,
    removeAt,
    expirationDate
  }: {
    uid?: string;
    name?: string;
    description?: string;
    mainImageUrl?: string;
    mainImageFullPath?: string;
    images?: Array<any>;
    productionValue?: number;
    saleValue?: number;
    profitValue?: number;
    profitPercentage?: number;
    deleted?: boolean;
    createdAt?: Date;
    editAt?: Date;
    removeAt?: Date;
    expirationDate?: Date;
  } = {}) {
    super({ createdAt, editAt, removeAt });
    Object.assign(this, {
      uid,
      name,
      description,
      mainImageUrl,
      mainImageFullPath,
      images,
      productionValue,
      saleValue,
      profitValue,
      profitPercentage,
      deleted,
      expirationDate
    });
  }
}
