import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

// Used for intercepting http requests on behalf of auth

@Injectable() // Must be used so that other services can be injected into this
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authtoken = this.authService.getToken();

    // Dont directly change the request
    const authrequest = req.clone({
      // Set appends rather than replace
      headers: req.headers.set('Authorization', 'Bearer ' + authtoken)
    });
    return next.handle(authrequest);
  }
}
