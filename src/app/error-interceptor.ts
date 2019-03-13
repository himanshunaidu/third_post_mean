import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

// Used for intercepting http requests on behalf of auth

@Injectable() // Must be used so that other services can be injected into this
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // next.handle(req) gives us back the response observable stream
    return next.handle(req)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          // We are getting error from the server that adds another level of error. Hence triple
          // The second argument in open() would send the message

          let errormessage = 'An Unknown Error Occurred';
          if (error.error.message) {
            errormessage = error.error.message;
          }
          this.dialog.open(ErrorComponent, {data: {message: errormessage}});

          // We need to return an observable at the end as this interceptor
          // would be used in other components of the app
          // throwError facilitates that
          return throwError(error);
        })
      );
  }
}
