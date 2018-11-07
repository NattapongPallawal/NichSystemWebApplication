import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Upload } from "src/app/shared/services/upload";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { UploadService } from "src/app/shared/services/upload.service";
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from "@angular/fire/database";

export class Restaurant {
    public owner: string;
    public phoneNumber: string;
    public picture: string;
    public promtPayID: string;
    public rating: number = 0.0;
    public restaurantName: string;
    public times : string;
    public about: string;
    public address: Address = new Address();
}
export class Address {
    public address: string;
    public district: string;
    public latitude: number;
    public longitude: number;
    public postalCode: string;
    public province: string;
    public subDistrict: string;
}
@Component({
    selector: 'add-reataurant',
    templateUrl: 'dialog-add-reataurant.html',
    styleUrls: ['./select-restaurant.component.css']
})
export class DialogAddReataurant implements OnInit {
    ngOnInit(): void {
        // throw new Error("Method not implemented.");
        this.getUserLocation()
    }

    formRastaurantPicture: FormGroup
    currentUpload: Upload
    selectedFiles: FileList
    isLinear = true;
    restaurant = new Restaurant()
    formRastaurantInfo: FormGroup
    formRastaurantPromtPay: FormGroup
    formRastaurantAddress: FormGroup
    latitude: number
    longitude: number
    isUploading: boolean = false
    constructor(
        private fb: FormBuilder,
        private uploadImg: UploadService,
        private snackBar: MatSnackBar,
        private db: AngularFireDatabase,
        public dialogRef: MatDialogRef<DialogAddReataurant>,
        @Inject(MAT_DIALOG_DATA) public owner: string) {
        this.restaurant.owner = owner;

        this.formRastaurantInfo = fb.group({
            phoneNumber: [null, [Validators.required, Validators.maxLength(10), Validators.minLength(8)]],
            restaurantName: [null, [Validators.required]],
            time: ['00:00 - 23:59', [Validators.required, Validators.pattern('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] - ([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$')]],
            about: [null, [Validators.required]],

        })
        this.formRastaurantPromtPay = fb.group({
            promtPayID: [null, [
                Validators.compose([Validators.required, Validators.pattern('(^0[0-9]{9}$)|(^[0-9]{13}$)')])
            ]]
        })

        this.formRastaurantAddress = fb.group({
            address: [null, [Validators.required]],
            district: [null, [Validators.required]],
            /*    latitude: [13.719547582631385, [Validators.required]],
               longitude: [100.50699784076312, [Validators.required]], */
            latitude: [null, [Validators.required]],
            longitude: [null, [Validators.required]],
            postalCode: [null, [Validators.required]],
            province: [null, [Validators.required]],
            subDistrict: [null, [Validators.required]]
        })

        this.formRastaurantPicture = fb.group({
            picture: ["https://firebasestorage.googleapis.com/v0/b/restaurant-system-9c921.appspot.com/o/System%2Fimg-01.png?alt=media&token=cd764451-42e9-45c4-9ef7-15cd2bd6142c", [Validators.required]],
        })
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    uploadData() {
        this.isUploading = true
        this.snackBar.open('กำลังเพิ่มร้านอาหาร', "ตกลง", {
            duration: 3000
        });
        this.formRastaurantAddress.controls['latitude'].enable()
        this.formRastaurantAddress.controls['longitude'].enable()
        this.restaurant.restaurantName = this.formRastaurantInfo.value.restaurantName
        this.restaurant.phoneNumber = this.formRastaurantInfo.value.phoneNumber
        this.restaurant.about = this.formRastaurantInfo.value.about
        this.restaurant.times = this.formRastaurantInfo.value.time
        this.restaurant.promtPayID = this.formRastaurantPromtPay.value.promtPayID
        this.restaurant.address.address = this.formRastaurantAddress.value.address
        this.restaurant.address.subDistrict = this.formRastaurantAddress.value.subDistrict
        this.restaurant.address.district = this.formRastaurantAddress.value.district
        this.restaurant.address.province = this.formRastaurantAddress.value.province
        this.restaurant.address.postalCode = this.formRastaurantAddress.value.postalCode
        this.restaurant.address.latitude = this.formRastaurantAddress.value.latitude
        this.restaurant.address.longitude = this.formRastaurantAddress.value.longitude
        this.formRastaurantAddress.controls['latitude'].disable()
        this.formRastaurantAddress.controls['longitude'].disable()
        this.uploadImage()

    }
    uploadImage() {

        let file = this.selectedFiles.item(0)
        this.currentUpload = new Upload(file);
        this.currentUpload.name = file.name //"res-test1." + file.name.split('.')[1]
        console.log(this.currentUpload.name)
        let uploadTask = this.uploadImg.uploadImage(this.currentUpload, "Restaurant", "rtdbPath")

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                console.log((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);

            },
            (error) => {
                // upload failed
                console.log(error)
                this.snackBar.open('เพิ่มร้านอาหารไม่สำเร็จ', "ตกลง", {
                    duration: 3000
                });
                this.isUploading = false
            },
            () => {
                // upload success

                uploadTask.snapshot.ref.getDownloadURL().then(url => {
                    console.log(`${url}`)
                    this.restaurant.picture = url
                    this.db.list<Restaurant>("restaurant").push(this.restaurant).then(_ => {
                        this.isUploading = false
                        this.snackBar.open('เพิ่มร้านอาหารเสร็จสิ้น', "ตกลง", {
                            duration: 3000
                        });
                        this.dialogRef.close();
                    })

                })
            }
        );
    }
    detectFiles(event) {
        try {

            var reader = new FileReader();
            reader.onload = (event: any) => {
                this.formRastaurantPicture.controls['picture'].setValue(event.target.result)

            }
            reader.readAsDataURL(event.target.files[0]);
            this.selectedFiles = event.target.files;
        } catch{

        }

    }
    onChoseLocation(event) {
        this.formRastaurantAddress.controls['latitude'].enable()
        this.formRastaurantAddress.controls['longitude'].enable()
        this.longitude = event.coords.lng
        this.latitude = event.coords.lat
        this.formRastaurantAddress.controls['latitude'].setValue(event.coords.lat)
        this.formRastaurantAddress.controls['longitude'].setValue(event.coords.lng)
        this.formRastaurantAddress.controls['latitude'].disable()
        this.formRastaurantAddress.controls['longitude'].disable()
        console.log(event)

    }
    getUserLocation() {
        /// locate the user
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {

                this.longitude = position.coords.longitude
                this.latitude = position.coords.latitude
                this.formRastaurantAddress.controls['latitude'].enable()
                this.formRastaurantAddress.controls['longitude'].enable()
                this.formRastaurantAddress.controls['latitude'].setValue(position.coords.latitude)
                this.formRastaurantAddress.controls['longitude'].setValue(position.coords.longitude)
                this.formRastaurantAddress.controls['latitude'].disable()
                this.formRastaurantAddress.controls['longitude'].disable()
            });
        }
    }
}