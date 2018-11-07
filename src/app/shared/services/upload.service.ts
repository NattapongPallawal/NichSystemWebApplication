import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireObject, AngularFireList, } from '@angular/fire/database';
import { AngularFireAuth, } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Upload } from './upload';
import { AuthService } from './auth.service'


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private basePath: string = "";
  uploads: AngularFireList<Upload[]>;
  private uid: String = ''
  private uploadTask: firebase.storage.UploadTask;
  private picture: String = ' '
  private pathRes : String =''

  constructor(private af: AngularFireDatabase, private db: AngularFireDatabase, authService: AuthService) {
    this.uid = authService.authInfo$.value.$uid
    this.basePath = `/user/${this.uid}/picture`
    this.pathRes = `/restaurant`

  }
  uploadImage(upload: Upload, imagePath: String,rtdbPath : string){
    let storageRef = firebase.storage().ref();
    return this.uploadTask = storageRef.child(`${imagePath}/${upload.name}`).put(upload.file);
    /* this.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        upload.progress = (this.uploadTask.snapshot.bytesTransferred / this.uploadTask.snapshot.totalBytes) * 100;
        //console.log(upload.progress);
      },
      (error) => {
        // upload failed
        console.log(error)
      },
      () => {
        // upload success
       
         this.uploadTask.snapshot.ref.getDownloadURL().then(url => {
          console.log(`${url}`)
          this.db.list(rtdbPath).set('picture', url)
        })        
      }
    ); */
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  pushUpload(upload: Upload, key: String) {
    let storageRef = firebase.storage().ref();
    this.uploadTask = storageRef.child(`${this.basePath}/${upload.file.name}`).put(upload.file);

    this.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        upload.progress = (this.uploadTask.snapshot.bytesTransferred / this.uploadTask.snapshot.totalBytes) * 100;
        console.log(upload.progress);

      },
      (error) => {
        // upload failed
        console.log(error)
      },
      () => {
        // upload success
        // this.picture = this.uploadTask.snapshot.downloadURL
        upload.url = this.uploadTask.snapshot.downloadURL
        this.uploadTask.snapshot.ref.getDownloadURL().then(url => {
          console.log(`${url}`)
          this.picture = url
          this.saveFileData(key)
        })

        //       this.url = this.uploadTask.snapshot.downloadURL
        //upload.name = upload.file.name
        //this.saveFileData(upload)
      }
    );
  }




  // Writes the file details to the realtime db
  private saveFileData(key: String) {
    //   this.db.list("aaaa").push(this.picture)
    this.db.list(`restaurant/${key}/`).set('picture', this.picture)
  }
  deleteUpload(upload: Upload) {
    this.deleteFileData(upload.$key)
      .then(() => {
        this.deleteFileStorage(upload.name)
      })
      .catch(error => console.log(error))
  }
  private deleteFileStorage(name: string) {
    let storageRef = firebase.storage().ref();
    storageRef.child(`${this.basePath}/${name}`).delete()
  }
  // Deletes the file details from the realtime db
  private deleteFileData(key: string) {
    return this.db.list(`${this.basePath}/`).remove(key);
  }

 pushUpPicMenu(upload: Upload, key: String) {
    let storageRef = firebase.storage().ref();
    this.uploadTask = storageRef.child(`/user/YWistfRgqga74rUfZvhGhXWe8aD3/pictureRestaurant/-LNJGdJTWYOX4TMrGHUJ/menu/${upload.file.name}`).put(upload.file);

    this.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        upload.progress = (this.uploadTask.snapshot.bytesTransferred / this.uploadTask.snapshot.totalBytes) * 100;
        console.log(upload.progress);

      },
      (error) => {
        // upload failed
        console.log(error)
      },
      () => {
        // upload success
        // this.picture = this.uploadTask.snapshot.downloadURL
        upload.url = this.uploadTask.snapshot.downloadURL
        this.uploadTask.snapshot.ref.getDownloadURL().then(url => {
          console.log(`${url}`)
          this.picture = url
          this.savePicMenu(key)
        })

        //       this.url = this.uploadTask.snapshot.downloadURL
        //upload.name = upload.file.name
        //this.saveFileData(upload)
      }

      
    );
  }
  private savePicMenu(key: String) {


    //   this.db.list("aaaa").push(this.picture)
    this.db.list(`menu/-LNJGdJTWYOX4TMrGHUJ/${key}/`).set('picture', this.picture)
  }

  // Firebase files must have unique names in their respective storage dir
  // So the name serves as a unique key
 


}
