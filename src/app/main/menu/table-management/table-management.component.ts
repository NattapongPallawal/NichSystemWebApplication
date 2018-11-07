import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import * as firebase from 'firebase/app';
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { Observable, BehaviorSubject } from 'rxjs';
import { QrcodeDialogComponent } from './qrcode-dialog/qrcode-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';

export class Table {
  public tableName: string;
  public available: boolean;
  public customer: string;
  public key: string;
  public resKey: string;

}
@Component({
  selector: 'app-table-management',
  templateUrl: './table-management.component.html',
  styleUrls: ['./table-management.component.css']
})
export class TableManagementComponent implements OnInit {
  cardAddTable: boolean;
  formTable: FormGroup;

  table = {
    tableName: null,
    available: true,
    customer: null,
  }
  resKey: string

  tableList: Array<Table> = []
  constructor(private db: AngularFireDatabase, private fb: FormBuilder, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.resKey = localStorage.getItem("restaurantKey")
    db.list<Table>(`/table/${this.resKey}`).snapshotChanges().subscribe(data => {
      this.tableList = []
      data.forEach(d => {
        if(d.key !+ null)
        var dd = d.payload.val()
        dd.key = d.key
        dd.resKey = this.resKey
        this.tableList.push(dd)
      })
    })
    this.cardAddTable = false;


  }

  ngOnInit() {
  }

  addTable() {
    this.cardAddTable = !this.cardAddTable;
  }
  removeTable(t: Table) {
    console.log(t);

    if (t.available) {
      this.db.object(`/table/${this.resKey}/${t.key}`).remove()
    }

  }
  add() {
    if (this.table.tableName == null || this.table.tableName == '') {
      this.snackBar.open(`กรุณาป้อนชื่อโต๊ะ`, "ตกลง", {
        duration: 3000
      });
      return
    }
    var checkTableName = true
    this.tableList.forEach(t => {
      if (this.table.tableName === t.tableName) {
        checkTableName = false

      }
    })
    if (checkTableName) {
      this.db.list(`table/${this.resKey}/`).push(this.table).then(_ => {
        this.cardAddTable = false;
        this.table.tableName = null
      })
    } else {
      this.snackBar.open(`ชื่อโต๊ะ ${this.table.tableName} ถูกใช้ไปแล้ว`, "ตกลง", {
        duration: 3000
      });
      this.table.tableName = null
    }
  }
  showQRCode(table: Table) {


    const dialogRef = this.dialog.open(QrcodeDialogComponent, {
      data: table
    });
    dialogRef.afterClosed().subscribe(_ => {


    })



  }

}
