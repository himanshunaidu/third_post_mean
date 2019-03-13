import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';


// Will be used by the error-inceptor
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  // We use Inject() below because we are getting data from error-interceptor.ts
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {
   }

  ngOnInit() {
  }

}
