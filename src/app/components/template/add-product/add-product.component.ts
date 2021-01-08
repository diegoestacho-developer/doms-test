import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { classToPlain } from 'class-transformer';
import * as moment from 'moment';
import { Product } from 'src/app/models/product/product.model';
import { DbService } from 'src/app/services/db/db.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  product: Product;

  submitted = false;

  selectedFile: File;
  imgPreview: any = null;

  qtdImages: number = 0;

  edit = false;

  namesProducts: any[] = [];

  constructor(
    private modal: NgbModal,
    private utilsService: UtilsService,
    private dbService: DbService
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.createForm();
    });
  }

  async createForm() {
    const newProduct = new Product({
      uid: this.utilsService.uid(),
      deleted: false,
      description: null,
      images: null,
      mainImageFullPath: null,
      mainImageUrl: null,
      name: null,
      productionValue: null,
      profitPercentage: null,
      profitValue: null,
      saleValue: null,
      createdAt: null,
      editAt: null,
      removeAt: null,
      expirationDate: null
    });

    if (!this.product) {
      this.edit = false;
      this.product = newProduct;
    } else {
      this.edit = true;

      for (const key of Object.keys(newProduct)) {
        if (this.product[key] === null || this.product[key] === undefined) {
          this.product[key] = newProduct[key];
        }
      }

      await this.getProductImages();
    }

    this.product = classToPlain(this.product) as Product;

    await this.getNamesProducts();
  }

  calculateProfitValue() {
    if (this.product.saleValue > 0 && this.product.productionValue) {

      this.product.profitValue = this.product.saleValue - this.product.productionValue;

      let percentage: any = (this.product.profitValue / this.product.saleValue).toFixed(2);

      this.product.profitPercentage = parseFloat(percentage);
    }
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];
    this.preview();
  }

  chooseImage(img: any) {
    img.main = true;
  }

  preview() {
    if (!this.product.images) {
      this.product.images = [];
    }

    if (this.qtdImages < 5) {
      const mimeType = this.selectedFile.type;

      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);

      reader.onload = (_event) => {
        this.imgPreview = reader.result;

        this.product.images.push({
          file: this.selectedFile,
          preview: this.imgPreview,
          id: this.product.images.length,
          fullpath: `products/${this.product.uid}/${this.product.images.length}.png`,
          url: ''
        });

        this.product.mainImageFullPath = this.product.images[0].fullpath;

        this.qtdImages = this.product.images.length;
      }
    }
  }

  validateNames() {
    for (const name of this.namesProducts) {
      if (name === this.product.name) {
        this.product.name = ''
        alert('Já existe um produto com este nome registrado');
      }
    }
  }

  async prepareImage() {
    return new Promise(async (resolve, reject) => {
      for (const img of this.product.images) {
        try {
          if (img.file) {
            this.utilsService.uploadFile(img.file, img.fullpath, null);
            this.utilsService.uploadSnapshot.subscribe(
              async (upload) => {
                if (upload.bytesTransferred === upload.totalBytes) {
                  this.utilsService.uploadTask.then(
                    async (obj: firebase.default.storage.UploadTaskSnapshot) => {
                      resolve(await obj.ref.getDownloadURL());
                    }
                  );
                }
              },
              (err) => {
                console.error(err);
                reject(err);
              }
            );
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }
    });
  }

  async getProductImages() {
    for (let i = 0; i < this.product.images.length; i++) {
      try {
        this.product.images[i].url = await this.utilsService.getFireUrl(this.product.images[i].fullpath);
      } catch (error) {
        console.error(error);
      } finally {
        this.qtdImages = this.product.images.length;
      }
    }
  }

  async getMainImage() {
    try {
      this.product.mainImageUrl = await this.utilsService.getFireUrl(this.product.mainImageFullPath);
    } catch (error) {
      console.error(error);
    }
  }

  async getNamesProducts() {
    try {
      const data = await this.dbService.getAll('products');
      this.namesProducts = data.docs.map((res: any) => {
        return res.data().name;
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onSubmit() {
    try {
      if (!this.product.name) {
        alert('Nome do produto é obrigatório');
      } else if (!this.product.productionValue) {
        alert('Custo de produção do produto é obrigatório');
      } else if (!this.product.saleValue) {
        alert('Valor de venda do produto é obrigatório');
      } else if (!this.product.profitValue) {
        alert('Valor de lucro do produto é obrigatório');
      } else if (!this.product.description) {
        alert('Descrição do produto é obrigatória');
      } else if (this.product.images.length === 0) {
        alert('É obrigatório pelo menos 1 imagem no produto');
      } else {

        if (!this.edit) {
          this.product.createdAt = new Date();
          this.product.expirationDate = new Date();
          this.product.expirationDate.setDate(this.product.expirationDate.getDate() + 60);
        } else {
          this.product.editAt = new Date();
          const createAtSeconds: any = this.product.createdAt;
          const expirationAtSeconds: any = this.product.expirationDate;
          const removeAtSeconds: any = this.product.removeAt;
          this.product.createdAt = moment(createAtSeconds.seconds * 1000).toDate();
          this.product.expirationDate = moment(expirationAtSeconds.seconds * 1000).toDate();
          this.product.removeAt = moment(removeAtSeconds.seconds * 1000).toDate();
        }



        await this.prepareImage();

        for (const image of this.product.images) {
          delete image.file;
          delete image.preview;
          image.url = '';
        }

        await this.getMainImage();

        await this.dbService.addItem('products', this.product);
        alert('Produto registrado com sucesso');

        this.modal.dismissAll({ success: true });
      }
    } catch (error) {
      console.error('error: ', error);
      alert('Erro ao registrar produto. Tente novamente mais tarde');
    }
  }

  closeModal() {
    this.modal.dismissAll();
  }
}
