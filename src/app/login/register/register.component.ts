import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Upload } from 'src/app/shared/services/upload';
import { ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/database';
import { UploadService } from 'src/app/shared/services/upload.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { error } from 'protractor';
import { SystemDataService } from 'src/app/shared/services/system-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Employee } from 'src/app/shared/services/Employee';

export class User {
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
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  formRegister: FormGroup
  isUploading: boolean = false
  currentUpload: Upload
  selectedFiles: FileList
  passwordNotMatch: boolean = false
  user: User = new User()
  employee: Employee = new Employee()
  progress: number = 0
  isAdmin: boolean = true
  constructor(private fb: FormBuilder, private router: Router, private snackBar: MatSnackBar, private uploadImg: UploadService,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase, private auth: AuthService, private dataService: SystemDataService, ) {
    this.isAdmin = localStorage.getItem("isAdmin") === "true" // ??
    console.log(this.isAdmin);


    if (this.isAdmin) {
      this.formRegister = this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        password: [null, [Validators.required, Validators.minLength(6)]],
        confirmPassword: [null, [Validators.required]],
        birthday: [new Date(), [Validators.required]],
        firstName: [null, [Validators.required]],
        lastName: [null, [Validators.required]],
        personID: [null, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
        phoneNumber: [null, [Validators.required, Validators.maxLength(10), Validators.minLength(8)]],
        picture: ["https://firebasestorage.googleapis.com/v0/b/restaurant-system-9c921.appspot.com/o/System%2Fimg-01.png?alt=media&token=cd764451-42e9-45c4-9ef7-15cd2bd6142c", Validators.required],

        address: [null, [Validators.required]],
        district: [null, [Validators.required]],
        postalCode: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
        province: [null, [Validators.required]],
        subDistrict: [null, [Validators.required]]
      });
    } else {
      this.dataService.currentEmployee.subscribe(data => {
        if (data != null) {
          this.formRegister = this.fb.group({
            email: [this.afAuth.auth.currentUser.email],
            password: [null],
            confirmPassword: [null],
            birthday: [new Date(), [Validators.required]],
            firstName: [data.firstName, [Validators.required]],
            lastName: [data.lastName, [Validators.required]],
            personID: [null, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
            phoneNumber: [null, [Validators.required, Validators.maxLength(10), Validators.minLength(8)]],
            picture: ["https://firebasestorage.googleapis.com/v0/b/restaurant-system-9c921.appspot.com/o/System%2Fimg-01.png?alt=media&token=cd764451-42e9-45c4-9ef7-15cd2bd6142c", Validators.required],
            address: [null, [Validators.required]],
            district: [null, [Validators.required]],
            postalCode: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
            province: [null, [Validators.required]],
            subDistrict: [null, [Validators.required]]
          });
          this.employee.department = data.department
          this.employee.workAt = data.workAt
          this.employee.active = true
          this.employee.firstName = data.firstName
          this.employee.lastName = data.lastName


          this.formRegister.controls.email.disable()
          this.formRegister.controls.firstName.disable()
          this.formRegister.controls.lastName.disable()
        }
      })

    }







  }

  ngOnInit() {
  }
  register() {
    if (this.formRegister.valid) {
      if (!this.passwordNotMatch && false) {
        console.log(this.passwordNotMatch)
        this.snackBar.open('รหัสผ่านไม่ตรงกัน', "ตกลง", {
          duration: 3000
        });
      } else {
        if (this.isAdmin) {
          this.user.firstName = this.formRegister.value.firstName
          this.user.lastName = this.formRegister.value.lastName
          this.user.birthday = new Date(this.formRegister.value.birthday).getTime()
          this.user.personID = this.formRegister.value.personID
          this.user.phoneNumber = this.formRegister.value.phoneNumber
          this.user.address.address = this.formRegister.value.address
          this.user.address.subDistrict = this.formRegister.value.subDistrict
          this.user.address.district = this.formRegister.value.district
          this.user.address.province = this.formRegister.value.province
          this.user.address.postalCode = this.formRegister.value.postalCode
        } else {
         
          this.employee.birthday = new Date(this.formRegister.value.birthday).getTime()
          this.employee.personID = this.formRegister.value.personID
          this.employee.phoneNumber = this.formRegister.value.phoneNumber
          this.employee.address.address = this.formRegister.value.address
          this.employee.address.subDistrict = this.formRegister.value.subDistrict
          this.employee.address.district = this.formRegister.value.district
          this.employee.address.province = this.formRegister.value.province
          this.employee.address.postalCode = this.formRegister.value.postalCode
        }


        this.isUploading = true
        this.formRegister.disable()
        this.uploadImage()

      }

    } else {
      this.snackBar.open('กรุณากรอกข้อมูลให้ครบ', "ตกลง", {
        duration: 3000
      });
    }
  }
  uploadImage() {
    try {
      let file = this.selectedFiles.item(0)
      this.currentUpload = new Upload(file);
      this.currentUpload.name = file.name //"res-test1." + file.name.split('.')[1]
      console.log(this.currentUpload.name)
      let uploadTask = this.uploadImg.uploadImage(this.currentUpload, `${this.isAdmin ? 'restaurantOwner' : 'employee'}`, "rtdbPath")
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          this.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100
          console.log((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);

        },
        (error) => {
          // upload failed
          console.log(error)
          this.snackBar.open('ลงทะเบียนไม่สำเร็จ', "ตกลง", {
            duration: 3000
          });
          this.isUploading = false
          this.formRegister.enable()
        },
        () => {
          // upload success
          if (this.isAdmin) {
            this.auth.signUp(this.formRegister.value.email, this.formRegister.value.confirmPassword).subscribe(
              s => {
                console.log("success")
                uploadTask.snapshot.ref.getDownloadURL().then(url => {
                  console.log(`${url}`)
                  this.user.picture = url
                  this.db.object<User>(`restaurantOwner/${this.auth.authInfo$.getValue().$uid}`).set(this.user).then(_ => {
                    this.isUploading = false
                    this.snackBar.open('ลงทะเบียนสำเร็จ', "ตกลง", {
                      duration: 3000
                    });
                    this.router.navigate(['/select-restaurant'])
                  })

                })
              },
              error => {
                console.log("error")
              }
            )
          } else {
            console.log(this.employee);
            
            uploadTask.snapshot.ref.getDownloadURL().then(url => {
              console.log(`${url}`)
              this.employee.picture = url
              this.db.object<Employee>(`employee/${this.auth.authInfo$.getValue().$uid}`).set(this.employee).then(_ => {
                this.isUploading = false
                this.snackBar.open('ลงทะเบียนสำเร็จ', "ตกลง", {
                  duration: 3000
                });
                this.router.navigate(['/home'])
              })

            })
          }
        }
      );
    } catch{
      this.snackBar.open('กรุณาเลือกรูปภาพ', "ตกลง", {
        duration: 3000
      });
    }
  }
  detectFiles(event) {
    try {

      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.formRegister.controls['picture'].setValue(event.target.result)

      }
      reader.readAsDataURL(event.target.files[0]);
      this.selectedFiles = event.target.files;
    } catch{

    }
  }
  /*   checkPasswords(group: FormGroup) { // here we have the 'passwords' group
      let pass = group.controls.password.value;
      let confirmPass = group.controls.confirmPass.value;
  
      return pass === confirmPass ? null : { notSame: true }
    } */

}


