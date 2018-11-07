import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from "rxjs/Rx";
import { AngularFireAuth } from "@angular/fire/auth";
import { AuthInfo } from "./auth-info";
import { Router } from "@angular/router";
//import * as firebase from 'firebase';

@Injectable()
export class AuthService {

  static UNKNOWN_USER = new AuthInfo(null);
  authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(AuthService.UNKNOWN_USER);

  constructor(private afAuth: AngularFireAuth, private router: Router) {
   /*  afAuth.auth.currentUser.getIdToken().then(a => {
      console.log(a)
    }).catch(err => {
      console.log(err)
    }) */
  }

  getAuthInfo(): Observable<AuthInfo> {

    return this.afAuth.authState.map(
      auth => {
        if (auth) {
          const authInfo = new AuthInfo(auth.uid);
          this.authInfo$.next(authInfo);
          console.log(authInfo.$uid);
          return authInfo;
        } else {
          this.authInfo$.next(AuthService.UNKNOWN_USER);
          console.log("AuthService.UNKNOWN_USER");
          return AuthService.UNKNOWN_USER;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  login(email, password): Observable<AuthInfo> {
    return this.fromFirebaseAuthPromise(this.afAuth.auth.signInWithEmailAndPassword(email, password));
  }


  signUp(email, password) {
    return this.fromFirebaseAuthPromise(this.afAuth.auth.createUserWithEmailAndPassword(email, password));
  }

  fromFirebaseAuthPromise(promise): Observable<any> {
    const subject = new Subject<any>();
    promise
      .then(
        res => {
          const authInfo = new AuthInfo(this.afAuth.auth.currentUser.uid);
          this.authInfo$.next(authInfo);
          subject.next(res);
          subject.complete();

        },
        err => {
         // this.authInfo$.error(err);
          subject.error(err);
          subject.complete();
        });
    return subject.asObservable();
  }


  logout() {
    this.afAuth.auth.signOut();
    this.authInfo$.next(AuthService.UNKNOWN_USER);
    localStorage.clear();
    this.router.navigate(['/sign-in']);
  }

}