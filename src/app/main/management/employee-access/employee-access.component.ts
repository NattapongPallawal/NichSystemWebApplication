import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { AngularFireDatabase } from '@angular/fire/database';

import { AngularFireAuth } from '@angular/fire/auth';
import { DialogRemoveEmployeeComponent } from './dialog-remove-employee/dialog-remove-employee.component';

export class userAccess {
  public firstName: string;
  public lastName: string;
  public department: string;
  public workAt: string;
  public active: boolean = false;
  public key: string;


}
@Component({
  selector: 'app-employee-access',
  templateUrl: './employee-access.component.html',
  styleUrls: ['./employee-access.component.css']
})
export class EmployeeAccessComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'access', 'delete'];
  dataSource: Array<userAccess> = [];
  restaurantKey = ''
  user: Array<userAccess> = []
  constructor(public dialog: MatDialog, private fb: AngularFireDatabase, private snackBar: MatSnackBar) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.getEmployee();
  }

  getEmployee() {
    const ownerResListener = this.fb.object<string>("/restaurant/" + this.restaurantKey + "/owner").valueChanges().subscribe(data => {
      this.fb.object<userAccess>("/restaurantOwner/" + data).snapshotChanges().subscribe(dataC => {
        this.user = []
        var temp = dataC.payload.val()
        temp.department = "เจ้าของร้าน"
        temp.key = dataC.key
        this.user.push(temp)
        this.fb.list<userAccess>(`employee/`, ref => ref.orderByChild('workAt').equalTo(this.restaurantKey)).snapshotChanges().subscribe(data => {
          data.forEach(d => {
            var temp = d.payload.val()
            temp.key = d.key
            this.user.push(temp)
          })
          this.dataSource = this.user
          ownerResListener.unsubscribe()
        })

      })

    })
  }

  ngOnInit() {
  }
  openDialogAddEmpDialog() {
    const dialogRef = this.dialog.open(AddEmployeeDialog);
    dialogRef.afterClosed().subscribe(_ => {
      this.getEmployee();
    }

    )

  }
  removeEmployee(index: number) {
    const dialogRef = this.dialog.open(DialogRemoveEmployeeComponent, {
      data: this.user[index]
      
    });
    dialogRef.afterClosed().subscribe(_ => {
      this.getEmployee();
    })
  }
}

export interface Access {
  value: string;
  viewValue: string;

}

@Component({
  selector: 'dialog-add-employee',
  templateUrl: './dialog-add-employee.html',
  styleUrls: ['./employee-access.component.css']
})

export class AddEmployeeDialog {
  form: FormGroup;
  infoEmployee: boolean;
  restaurantKey = ""
  isUploading = false
  constructor(private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private db: AngularFireDatabase,
    public dialogRef: MatDialogRef<AddEmployeeDialog>,
    private snackBar: MatSnackBar) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      access: ['', Validators.required]
    });
    this.infoEmployee = false;
  }
  accesses: Access[] = [
    { value: 'พนักงานเสริฟ', viewValue: 'พนักงานเสริฟ' },
    { value: 'พนักงานในครัว', viewValue: 'พนักงานในครัว' },
    { value: 'แคชเชียร์', viewValue: 'แคชเชียร์' }
  ];
  ngOnInit() {

  }

  onClickSignUp() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (this.form.valid) {
      this.isUploading = true
      this.form.disable()
      /*       var token = ''
            this.afAuth.auth.sendPasswordResetEmail("") */

      this.afAuth.auth.createUserWithEmailAndPassword(this.form.value.email, "000000").then(data => {
        console.log(this.afAuth.auth.currentUser.uid);
        const employee = new userAccess();
        employee.workAt = this.restaurantKey;
        employee.firstName = this.form.value.firstName;
        employee.lastName = this.form.value.lastName;
        employee.department = this.form.value.access;
        this.db.object<any>(`employee/${this.afAuth.auth.currentUser.uid}`).set(employee).then(c => {
          this.afAuth.auth.signInWithEmailAndPassword(user[0], user[1]).then(_ => {
            console.log(this.afAuth.auth.currentUser.email);
            this.snackBar.open('ลงทะเบียนสำเร็จ', "ตกลง", {
              duration: 3000
            })
            this.isUploading = false
            this.dialogRef.close()
          })

        })
      }).catch(
        error => {
          this.isUploading = false
          this.form.enable()
          this.snackBar.open('ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง', "ตกลง", {
            duration: 3000
          })
          console.log(error);
        }
      )
    }
  }
  showInfoEmp() {
    this.infoEmployee = !this.infoEmployee;
  }

}