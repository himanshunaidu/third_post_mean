import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeValidator } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredtitle = '';
  enteredcontent = '';
  @Output() postcreated = new EventEmitter<Post>();
  postservice: PostsService;

  // The following route is used to extract the postid that would be present in edit mode
  route: ActivatedRoute;
  // the following 3 variables are for updation
  mode = 'create';
  postId: string = null;
  post: Post = null;

  // For Spinner
  isloading = false;

  // For Reactive Form
  form: FormGroup;

  // For image
  imageview: string;

  // To stop the spinner
  authservice: AuthService;
  authstatsub: Subscription;

  constructor(postservice: PostsService, route: ActivatedRoute, authservice: AuthService) {
    this.postservice = postservice;
    this.route = route;
    this.authservice = authservice;
  }

  ngOnInit() {

    this.authstatsub = this.authservice.getAuthStatusListener()
      .subscribe(
        authstatus => {
          this.isloading = false;
      });

    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(1)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      // We won't synchronize the following image formcontrol with the html element
      image: new FormControl(null, {validators: [], asyncValidators: [mimeValidator]},)
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        // Start Progress Spinner
        this.isloading = true;
        this.postservice.getPost(this.postId).subscribe(postData => {
          // Stop Progress Spinner
          this.isloading = false;
          this.post = {_id: postData._id, title: postData.title, content: postData.content,
            imageUrl: postData.imageUrl, creator: postData.creator};
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imageUrl
          });
        });
        console.log('Edit Mode');
      }
    });
  }

  onSavePost() {
    if (!this.form.valid) {
      return;
    }
    /*const post: Post = {
      title: form.value.title,
      content: form.value.content
    };
    this.postcreated.emit(post);*/

    // Start Progress Spinner
    this.isloading = true;

    if (this.mode === 'create') {
      this.postservice.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postservice.updatePost(this.postId, this.form.value.title,
        this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  onImageClicked(event: Event) {
    // Typescript does not know that the event is of type HTMLInputElement. We need to explicitly tell it so
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    // console.log(file);
    // console.log(this.form);
    const reader = new FileReader();
    reader.onload = () => {
      this.imageview = reader.result as string;
      // sconsole.log(this.imageview);
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    this.authstatsub.unsubscribe();
  }
}
