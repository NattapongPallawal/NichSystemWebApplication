import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Rx";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(private authService:AuthService, private router:Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
		if (this.authService.authInfo$.getValue().isLoggedIn()) {
			return true;
		}
		
		return this.authService.getAuthInfo()
			.map( (authInfo ) => authInfo.isLoggedIn())
			.do(allowed => {
				if(!allowed) {
					this.router.navigate(['/sign-in']);
					return false;
				}else{
					return true;
				}
			}).take(1);
		}
}