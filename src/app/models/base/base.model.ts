export abstract class BaseModel {
  createdAt: Date;
  editAt: Date;
  removeAt: Date;

  constructor({
    createdAt,
    editAt,
    removeAt
  }: {
    createdAt?: Date;
    editAt?: Date;
    removeAt?: Date;
  } = {}) {
    Object.assign(this, {
      createdAt,
      editAt,
      removeAt
    });
  }
}
