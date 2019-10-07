import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';


@Injectable({providedIn: 'root'})
export class AuthService {

  // For authentication
  private authStatusListener = new Subject<boolean>();
  private isauth = false;

  private token: string;

  private tokentimer: any;

  // For authorization of post permissions (update and delete)
  private userId: string;

  getIsAuth() {
    return this.isauth;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getToken() {
    return this.token;
  }

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const authdata: AuthData = {email: email, password: password};
    this.http.post<{message: string, result: any}>('http://localhost:3000/api/user/signup', authdata)
      .subscribe(response => {
        // this.router.navigate(['/']);
        alert(response.message + '\nPlease log in');
        this.authStatusListener.next(false);
      },
      error => {
        this.authStatusListener.next(false);
      });
  }

  loginUser(email: string, password: string) {
    // const authdata: AuthData = {email: email, password: password};
    const userparams = {
      params: {
        // auth data
        email: email, password: password
      }
    };
    this.http.get<{token: string, expiresIn: number, userId: string}>
      ('http://localhost:3000/api/user/login', userparams)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          // The session is active only for a limited time in the backend
          // We need to let the frontend know
          const expiresIn = response.expiresIn;
          this.tokentimer = setTimeout(() => {
            this.logout();
          }, expiresIn * 1000);

          this.isauth = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          // expiresIn is in seconds, we need to pass milliseconds
          this.saveAuthData(this.token, this.constructDate(expiresIn * 1000), this.userId);
          this.router.navigate(['/']);
        }
      },
      error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authdata = this.getAuthData();
    if (!authdata) {
      return;
    }

    // Validate the acquired data through the expiration dates
    const now = new Date();
    const isfuture = authdata.expirationdate > now;
    if (isfuture) {
      this.token = authdata.token;
      this.isauth = true;
      this.authStatusListener.next(true);

      this.userId = authdata.userId;
      // Below we need to pass the difference between expiry and now in milliseconds
      this.constructDate( (authdata.expirationdate.getTime() - now.getTime()) );
    }
  }

  logout() {
    this.token = null;
    this.isauth = false;
    this.authStatusListener.next(false);
    this.userId = null;

    this.router.navigate(['/']);
    this.clearAuthData();
    clearTimeout(this.tokentimer);
  }

  // In order to persist the authentication
  // We will use the local storage given by Angular

  private saveAuthData(token: string, expiration: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expiration.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration || userId) {
      return;
    }
    return {
      token: token,
      expirationdate: new Date(expiration),
      userId: userId
    };
  }

  // To get expiration date from current time and milliseconds
  private constructDate(expiration: number): Date {
    const now = new Date();
    const expirationdate = new Date(now.getTime() + expiration);
    return expirationdate;
  }

  // For authorization of posts
  public getUserId() {
    return this.userId;
  }
}
