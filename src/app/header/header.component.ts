import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Check auth status
  userauth = false;

  private authListenerSubs: Subscription;

  constructor(private authservice: AuthService) { }

  ngOnInit() {
    this.userauth = this.authservice.getIsAuth();
    this.authListenerSubs = this.authservice
      .getAuthStatusListener()
      .subscribe(isauth => {
        this.userauth = isauth;
      });
  }

  onLogout() {
    this.authservice.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

}
