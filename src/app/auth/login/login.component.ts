import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  isloading = false;

  // To stop the spinner
  authstatsub: Subscription;

  constructor(public authservice: AuthService) { }

  ngOnInit() {
    this.authstatsub = this.authservice.getAuthStatusListener().subscribe(
      authstatus => {
        this.isloading = false;
      }
    );
  }
  onLogin(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.isloading = true;
    this.authservice.loginUser(form.value.emailinput, form.value.passwordinput);
  }

  ngOnDestroy(): void {
    this.authstatsub.unsubscribe();
  }


}
