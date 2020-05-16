import { ProductModel } from './../../../Models/spk.model'
import { ApiService } from './../../../Services/api/api.service'
import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { Web3Service } from 'src/app/Services/Web3/web3.service'
import { Web3Model } from 'src/app/Models/web3.model'

@Component( {
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: [ '../../../../assets/styles/form.css',
    './add-product.component.scss' ]
} )
export class AddProductComponent implements OnInit {
  productForm: FormGroup
  uploaded: File[] = []
  imagesFormData = new FormData()
  account: string
  spk: any
  constructor ( private fb: FormBuilder, private api: ApiService, private web3service: Web3Service ) { }
  ngOnInit() {
    this.web3service.web3login()
    this.web3service.Web3Details$.subscribe( async ( data: Web3Model ) => {
      this.account = data.account
      this.spk = data.spk
    } )
    this.productForm = this.fb.group( {
      itemName: new FormControl( null, Validators.required ),
      itemType: new FormControl( null, Validators.required ),
      itemPrice: new FormControl( null, Validators.required ),
      itemDetails: new FormControl( null, Validators.required ),
      itemBrand: new FormControl( null, Validators.required ),
      itemColor: new FormControl( null, Validators.required ),
    } )
  }
  onFileChanged = ( e ) => {
    try {
      const img: File = e.target.files[ 0 ]
      this.uploaded.push( img )
    } catch ( error ) {
    }
  }
  removeImg = ( index ) => {
    this.uploaded.splice( index, 1 )
  }
  addProduct = async () => {
    try {
      this.imagesFormData.delete( 'product' )
      const pData: ProductModel = this.productForm.value
      console.log( 'Log: AddProductComponent -> addProduct -> pData', pData )
      Object.keys( pData ).forEach( ( key ) => ( pData[ key ] == null ) && delete pData[ key ] )
      if ( Object.keys( pData ).length === 6 ) {
        if ( this.uploaded.length > 0 ) {
          this.uploaded.forEach( ( img ) => {
            this.imagesFormData.append( 'product', img, img.name )
          } )
          pData.itemId = await this.spk.totalProductID().call( { from: this.account } )
          this.imagesFormData.append( 'product', JSON.stringify( pData ) )
          pData.imageId = await this.api.addProducts( this.imagesFormData )
          const newProductRes = await this.spk.addProduct(
            pData.itemName,
            pData.itemType,
            pData.itemPrice,
            pData.itemDetails,
            pData.itemBrand,
            pData.itemColor,
            pData.imageId ).send( { from: this.account, gas: 5000000 } )
        } else {
          alert( 'No Images Selected' )
        }
      } else {
        alert( 'Some Fields Are Empty' )
        this.productForm.reset()
      }
    } catch ( error ) {
    }
  }
}

