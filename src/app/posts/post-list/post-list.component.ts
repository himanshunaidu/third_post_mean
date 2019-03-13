import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  /*posts = [
    {title: 'First Post', content: 'This is the first post'},
    {title: 'Second Post', content: 'This is the first post'},
    {title: 'Third Post', content: 'This is the third post'}
  ];
  @Input() posts: Post[] = [];*/
  posts: Post[] = [];
  postservice: PostsService;
  postsub: Subscription;

  // For authorization
  private authListenerSub: Subscription;
  // Check auth status
  userauth = false;

  // For Spinner
  isloading = false;

  // For Paginator (Just as a placeholder, will be replaced by dynamic values from database)
  postslength = 0;
  postsperpage = 2;
  currentpage = 1;
  pagesizeoptions = [1, 2, 5, 10, 50];

  // For authorization of posts
  userId: string;

  constructor(postservice: PostsService, private authservice: AuthService) {
    this.postservice = postservice;
  }

  ngOnInit() {
    // Start Spinner
    this.isloading = true;
    this.postservice.getPosts(this.postsperpage, this.currentpage);
    this.postsub = this.postservice.getPostUpdateListener()
      .subscribe((postdata: {posts: Post[], postcount: number}) => {
        // Stop Spinner
        this.isloading = false;
        this.posts = postdata.posts;
        this.postslength = postdata.postcount;
      });

    this.userauth = this.authservice.getIsAuth();

    this.userId = this.authservice.getUserId();

    // This authlistener subscription wont work when we login
    // Rather would work only when we logout
    // Because the post-list gets reloaded again and thus no new value is entered in the subsciption
    this.authListenerSub = this.authservice
      .getAuthStatusListener()
      .subscribe(isauth => {
        this.userauth = isauth;
        this.userId = this.authservice.getUserId();
      });
  }

  onDelete(postid: string) {
    this.postservice.deletePost(postid)
    .subscribe(() => {
      this.postservice.getPosts(this.postsperpage, this.currentpage);
    },
    (error) => {
      this.isloading = false;
    });
  }

  ngOnDestroy() {
    this.postsub.unsubscribe();
    this.authListenerSub.unsubscribe();
  }

  // For Paginator
  onChangedPage(pagechange: PageEvent) {
    this.isloading = true;
    this.currentpage = pagechange.pageIndex + 1;
    this.postsperpage = pagechange.pageSize;
    this.postservice.getPosts(this.postsperpage, this.currentpage);
    // console.log(pagechange);
  }

}
