import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import * as firebase from 'firebase';

import { SystemDataService } from 'src/app/shared/services/system-data.service';
import { Employee } from 'src/app/shared/services/Employee';
import { User } from 'src/app/shared/services/User';
import { AngularFireDatabase } from '@angular/fire/database';

export class userAccess {
  public firstName: string;
  public lastName: string;
  public department: string;
  public workAt: string;
  public active: boolean;


}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  formLogin: FormGroup
  isSignin: boolean = false
  constructor(private dataService: SystemDataService, private fb: FormBuilder, private auth: AuthService, private router: Router, private snackBar: MatSnackBar, private db: AngularFireDatabase) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    console.log(this.auth.authInfo$.getValue().isLoggedIn())
  }

  ngOnInit() {
    /* const user = JSON.parse(localStorage.getItem("user"));
    if (user != null) {
      console.log(user)
      this.auth.login(user[0], user[1])
        .subscribe(res => {
          this.router.navigate(['/select-restaurant'])
        },
          err => alert(err.message)
        );
    } */

  }
  register() {
    localStorage.setItem("isAdmin", 'true')
  }
  login() {
    if (!this.formLogin.invalid) {
      this.isSignin = true
      this.auth.login(this.formLogin.value.email, this.formLogin.value.password)
        .subscribe(res => {
          var user = new Array();
          user.push(this.formLogin.value.email)
          user.push(this.formLogin.value.password)
          user.push(this.auth.authInfo$.getValue().$uid)
          localStorage.setItem('user', JSON.stringify(user))
          this.db.object<Employee>(`employee/${this.auth.authInfo$.getValue().$uid}`).valueChanges().subscribe(data => {
            if (data != null) {
              if (data.active) {
                localStorage.setItem("restaurantKey", data.workAt)
                this.router.navigate(['/home'])
              } else {
                this.dataService.changeEmployee(data);
                this.router.navigate(['/register'])
              }
              localStorage.setItem("isAdmin", 'false')
              this.isSignin = false
              this.snackBar.open('เข้าสู่ระบบสำเร็จ', "ตกลง", {
                duration: 3000
              });
            } else {
              this.db.object<User>(`restaurantOwner/${this.auth.authInfo$.getValue().$uid}`).valueChanges().subscribe(data => {
                if (data != null) {
                  localStorage.setItem("isAdmin", 'true')
                  this.router.navigate(['/select-restaurant'])
                  this.isSignin = false
                  this.snackBar.open('เข้าสู่ระบบสำเร็จ', "ตกลง", {
                    duration: 3000
                  });
                } else {
                  this.isSignin = false
                  this.snackBar.open('เข้าสู่ระบบไม่สำเร็จ', "ตกลง", {
                    duration: 3000
                  });
                }
              })

            }
            console.log(data);

          })




        },
          err => {
            this.snackBar.open('อีเมลล์หรือรหัสผ่านไม่ถูกต้อง', "ตกลง", {
              duration: 3000
            });
            this.isSignin = false
          }
        );
    }
  }

}
