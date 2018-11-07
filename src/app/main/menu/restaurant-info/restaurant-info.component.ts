import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatGridTile, MatSnackBar } from '@angular/material';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, NgControl, Validators } from '@angular/forms';
import { UploadService } from '../../../shared/services/upload.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Upload } from '../../../shared/services/upload';
import * as firebase from 'firebase/app';

export class Restaurant {
  public restaurantName: string = "ชื่อร้านอาหาร";
  public about: string = "";
  public address = new Address();
  public key: string = "";
  public promtPayID: string = "";
  public owner: string = "";
  public picture: string = "";
  public times: string = "";

}
export class Address {
  public address: string = "";
  public district: string = "";
  public postalCode: string = "";
  public province: string = "";
  public subDistrict: string = "";
  public latitude: number;
  public longitude: number;
}
export class RestaurantOwner {
  public key: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public phoneNumber: string = "";
}
@Component({
  selector: 'app-restaurant-info',
  templateUrl: './restaurant-info.component.html',
  styleUrls: ['./restaurant-info.component.css']
  //providers: [AngularFireDatabase, UploadService,AuthService]

})
export class RestaurantInfoComponent implements OnInit, OnDestroy {
  restaurant = new Restaurant();
  restaurantOwner = new RestaurantOwner();
  isAbout: Boolean = true;
  isAddress: Boolean = false;
  isMaps: Boolean = false;

  iconAbout: string = "edit"
  iconMaps: string = "edit_location"
  iconAddress: string = "edit"
  formAddress = new FormGroup({
    address: new FormControl({ value: '' }, Validators.required),
    district: new FormControl({ value: '' }, Validators.required),
    postalCode: new FormControl({ value: '' }, Validators.required),
    province: new FormControl({ value: '' }, Validators.required),
    subDistrict: new FormControl({ value: '' }, Validators.required),
  })
  latitude: number;
  longitude: number;
  locationChosen = true;
  currentUpload: Upload;
  selectedFiles: FileList;
  progress: number = 0;
  isUpload: boolean = false;
  resKey: string
  constructor(private db: AngularFireDatabase, private uploadImg: UploadService, private snackBar: MatSnackBar) {
    this.resKey = localStorage.getItem("restaurantKey")
    db.object<Restaurant>(`restaurant/${this.resKey}`).snapshotChanges().subscribe(res => {
      this.restaurant = res.payload.val()
      console.log(this.restaurant.key)
      if (this.restaurant.address.latitude != null && this.restaurant.address.longitude != null) {
        this.latitude = this.restaurant.address.latitude
        this.longitude = this.restaurant.address.longitude
      } else {
        this.getUserLocation()
      }
      this.formAddress.controls['address'].setValue(this.restaurant.address.address)
      this.formAddress.controls['district'].setValue(this.restaurant.address.district)
      this.formAddress.controls['postalCode'].setValue(this.restaurant.address.postalCode)
      this.formAddress.controls['province'].setValue(this.restaurant.address.province)
      this.formAddress.controls['subDistrict'].setValue(this.restaurant.address.subDistrict)
      const owner = db.object<RestaurantOwner>("restaurantOwner/" + this.restaurant.owner).valueChanges().subscribe(o => {
        this.restaurantOwner = o
        owner.unsubscribe();
      })
    })

  }

  uploadImage() {
    this.isUpload = true
    let file = this.selectedFiles.item(0)
    this.currentUpload = new Upload(file);
    this.currentUpload.name = "res-test1." + file.name.split('.')[1]
    console.log(this.currentUpload.name)
    let uploadTask = this.uploadImg.uploadImage(this.currentUpload, "Restaurant", `restaurant/${this.resKey}`)

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        this.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
        console.log(this.progress);

      },
      (error) => {
        // upload failed
        console.log(error)
        this.snackBar.open('อัพโหลดไม่สำเร็จ', "ตกลง", {
          duration: 3000
        });
        this.isUpload = false
      },
      () => {
        // upload success
        this.isUpload = false

        uploadTask.snapshot.ref.getDownloadURL().then(url => {
          console.log(`${url}`)
          this.db.list(`restaurant/${this.resKey}`).set('picture', url)
          this.snackBar.open('อัพโหลดเสร็จสิ้น', "ตกลง", {
            duration: 3000
          });
        })
      }
    );
  }
  detectFiles(event) {

    this.selectedFiles = event.target.files;
    console.log(event.target.files)
    this.uploadImage()

    this.snackBar.open('กำลังอัพโหลด', "ตกลง", {
      duration: 3000
    });




  }

  onChoseLocation(event) {
    if (this.isMaps) {
      this.latitude = event.coords.lat;
      this.longitude = event.coords.lng;
      this.locationChosen = true;
      console.log(event)
    }
  }
  ngOnInit() {
    this.formAddress.disable()
    /*  this.getUserLocation() */
    /*   this.subscription = this.geo.hits
        .subscribe(hits => {
  
          this.markers = hits
          console.log(hits)
        }
        ); */
  }
  ngOnDestroy() {
    /*  this.subscription.unsubscribe() */
  }

  getUserLocation() {
    /// locate the user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        //     this.geo.getLocations(100, [this.latitude, this.longitude])
      });
    }
  }


  updateContact(about: string, promtPay: string) {
    this.isAbout = !this.isAbout
    if (this.isAbout) {
      this.iconAbout = "edit"
      this.restaurant.about = about;
      this.restaurant.promtPayID = promtPay;
      this.db.object<Restaurant>(`restaurant/${this.resKey}`).update(this.restaurant);
    } else {
      this.iconAbout = "save"
    }
  }
  updateAddress() {
    // console.log(this.address)
    this.isAddress = !this.isAddress
    if (this.isAddress) {
      this.formAddress.enable()
      this.iconAddress = "save"
    } else {
      this.formAddress.disable()
      this.db.object<Restaurant>(`restaurant/${this.resKey}/address`).update(this.formAddress.value);
      this.iconAddress = "edit"
    }
  }

  onClickEditMaps() {
    this.isMaps = !this.isMaps
    if (this.isMaps) {
      this.iconMaps = "save"
    } else {
      this.restaurant.address.latitude = this.latitude
      this.restaurant.address.longitude = this.longitude
      this.db.object<Address>(`restaurant/${this.resKey}/address`).update(this.restaurant.address);
      this.iconMaps = "edit_location"
    }
  }

}
