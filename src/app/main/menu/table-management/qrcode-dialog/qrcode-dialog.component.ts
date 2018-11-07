import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import * as html2canvas from 'html2canvas'
import { Table } from '../table-management.component';

@Component({
  selector: 'app-qrcode-dialog',
  templateUrl: './qrcode-dialog.component.html',
  styleUrls: ['./qrcode-dialog.component.css']
})
export class QrcodeDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<QrcodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Table,
    private snackBar: MatSnackBar
  ) {
    console.log(data);

  }
  print(data) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(data)
    a.download = "5555"
    document.body.appendChild(a);
    a.click()
   
    /* var printContent = document.getElementById(data).innerHTML
    var originalContent = document.body.innerHTML */
   /*  html2canvas(data.target)
      .then((canvas) => {
        console.log(canvas);
        canvas.toDataURL('image/png')
        var printContent = document.getElementById(data)
        
      })
      .catch(err => {
        console.log("error canvas", err);
      });
 */
   // html2canvas.canvas.toDataURL('image/png');

    // document.body.innerHTML = printContent

    // window.print()


    //  document.body.innerHTML = originalContent

  }

  ngOnInit() {
  }

}
