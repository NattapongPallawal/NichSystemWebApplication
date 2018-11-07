import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { UploadService } from 'src/app/shared/services/upload.service';
import { Upload } from 'src/app/shared/services/upload';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/services/User';

export const personalInfo = {
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  birthday: ['', [Validators.required]],
  firstName: ['', [Validators.required]],
  lastName: ['', [Validators.required]],
  personID: ['', [Validators.required]],
  phoneNumber: ['', [Validators.required]],
  picture: ['', [Validators.required]]
}
/* export class User {
  public birthday: number;
  public firstName: string;
  public lastName: string;
  public personID: string;
  public phoneNumber: string;
  public picture: string;
  public address: Address = new Address()
}
export class Address {
  public address: string;
  public district: string;
  public postalCode: string;
  public province: string;
  public subDistrict: string;
} */
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  date: any;
  cantEditProfile: boolean = true
  editIcon: string = "edit"
  currentUpload: Upload;
  selectedFiles: FileList;
  progress: number = 0;
  isUpload: boolean = false;
  formPersonalInfo: FormGroup;
  isAdmin : boolean = false
  restaurantKey = ''
  user = new User()
  constructor(private auth: AuthService, private snackBar: MatSnackBar, private uploadImg: UploadService, private db: AngularFireDatabase, private fb: FormBuilder) {
    this.isAdmin = localStorage.getItem("isAdmin") === "true"
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.formPersonalInfo = this.fb.group({
      birthday: [new Date(), [Validators.required]],
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      personID: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      picture: [null, [Validators.required]],
      address: [null, [Validators.required]],
      district: [null, [Validators.required]],
      postalCode: [null, [Validators.required]],
      province: [null, [Validators.required]],
      subDistrict: [null, [Validators.required]]
    });
    this.formPersonalInfo.disable()
    this.formPersonalInfo.valueChanges.subscribe(d => {
      console.log(d)
    })
    db.object<User>(`${this.isAdmin ? 'restaurantOwner' : 'employee'}/${this.auth.authInfo$.getValue().$uid}`).valueChanges().subscribe(u => {
      this.user = u
      this.formPersonalInfo.controls['birthday'].setValue(new Date(this.user.birthday))
      this.formPersonalInfo.controls['firstName'].setValue(this.user.firstName)
      this.formPersonalInfo.controls['lastName'].setValue(this.user.lastName)
      this.formPersonalInfo.controls['personID'].setValue(this.user.personID)
      this.formPersonalInfo.controls['phoneNumber'].setValue(this.user.phoneNumber)
      this.formPersonalInfo.controls['picture'].setValue(this.user.picture)
      this.formPersonalInfo.controls['address'].setValue(this.user.address.address)
      this.formPersonalInfo.controls['district'].setValue(this.user.address.district)
      this.formPersonalInfo.controls['postalCode'].setValue(this.user.address.postalCode)
      this.formPersonalInfo.controls['province'].setValue(this.user.address.province)
      this.formPersonalInfo.controls['subDistrict'].setValue(this.user.address.subDistrict)
    })
  }

  ngOnInit() {
  }
  updatePersonalInfo() {
    this.cantEditProfile = !this.cantEditProfile
    if (this.cantEditProfile) {
      this.editIcon = "edit"
      this.formPersonalInfo.disable()
      this.setValue()
      this.db.object<User>(`${this.isAdmin ? 'restaurantOwner' : 'employee'}/${this.auth.authInfo$.getValue().$uid}`).update(this.user)
        .then(_ => {
          this.snackBar.open('อัพเดทข้อมูลของคุณเรียบร้อยแล้ว', "ตกลง", {
            duration: 3000
          });
        })
      // this.cantEditProfile = !this.cantEditProfile
    } else {
      this.editIcon = "save"
      this.formPersonalInfo.enable()
      // this.cantEditProfile = !this.cantEditProfile
    }
  }

  setValue() {
    this.user.firstName = this.formPersonalInfo.value.firstName
    this.user.lastName = this.formPersonalInfo.value.lastName
    this.user.birthday = new Date(this.formPersonalInfo.value.birthday).getTime()
    this.user.personID = this.formPersonalInfo.value.personID
    this.user.phoneNumber = this.formPersonalInfo.value.phoneNumber
    this.user.picture = this.formPersonalInfo.value.picture
    this.user.address.address = this.formPersonalInfo.value.address
    this.user.address.subDistrict = this.formPersonalInfo.value.subDistrict
    this.user.address.district = this.formPersonalInfo.value.district
    this.user.address.province = this.formPersonalInfo.value.province
    this.user.address.postalCode = this.formPersonalInfo.value.postalCode

  }
  detectFiles(event) {
    this.selectedFiles = event.target.files;
    console.log(event.target.files)
    this.uploadImage()

    this.snackBar.open('กำลังอัพโหลด', "ตกลง", {
      duration: 3000
    });

  }
  uploadImage() {
    this.isUpload = true
    let file = this.selectedFiles.item(0)
    this.currentUpload = new Upload(file);
    this.currentUpload.name = "uid." + file.name.split('.')[1]
    console.log(this.currentUpload.name)
    let uploadTask = this.uploadImg.uploadImage(this.currentUpload, `${this.isAdmin ? 'restaurantOwner' : 'employee'}`, `${this.isAdmin ? 'restaurantOwner' : 'employee'}/${this.restaurantKey}`)

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
          this.db.list(`${this.isAdmin ? 'restaurantOwner' : 'employee'}/${this.auth.authInfo$.getValue().$uid}`).set('picture', url)
          this.snackBar.open('อัพโหลดเสร็จสิ้น', "ตกลง", {
            duration: 3000
          });
        })
      }
    );
  }

}
