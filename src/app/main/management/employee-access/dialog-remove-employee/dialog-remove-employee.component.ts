import { Component, OnInit, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { userAccess } from '../employee-access.component';

import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-dialog-remove-employee',
  templateUrl: './dialog-remove-employee.component.html',
  styleUrls: ['./dialog-remove-employee.component.css']
})
export class DialogRemoveEmployeeComponent implements OnInit {
  @ViewChild('concon')  concon
  constructor(
    public dialogRef: MatDialogRef<DialogRemoveEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public user: userAccess,
    private snackBar: MatSnackBar,
    private fb: AngularFireDatabase) {

  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  remove() {
    this.fb.object<userAccess>(`employee/${this.user.key}`).remove().then(_ => {
      this.snackBar.open('ลบพนักงานเรียบร้อยแล้ว', "ตกลง", {
        duration: 3000,
        verticalPosition : 'bottom',
        horizontalPosition : 'right',
        viewContainerRef: this.concon
      })
      this.dialogRef.close();
    })
  }

  ngOnInit() {
  }

}
