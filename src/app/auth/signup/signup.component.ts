import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

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

  onSignup(form: NgForm) {
    // console.log(form.value);
    if (!form.valid) {
      return;
    }
    this.isloading = true;
    this.authservice.createUser(form.value.emailinput, form.value.passwordinput);
  }

  ngOnDestroy(): void {
    this.authstatsub.unsubscribe();
  }


}
