import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Redundant message

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsupdated = new Subject<{posts: Post[], postcount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  // The following parameters are used for pagination
  getPosts(postsperpage: number, currentpage: number) {
    // Parameters for limited retrieval
    // The commas below are back ticks, not single quotes
    const queryparams = `?pagesize=${postsperpage}&page=${currentpage}`;

    this.http.get<{message: string, posts: Post[], maxPosts: number}>
    ('http://localhost:3000/api/posts' + queryparams)
      // pipe is used combine map function that maps the returned object to another object type
      .pipe(map(postdata => {
        return {
          posts: postdata.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            _id: post._id,
            imageUrl: post.imageUrl,
            creator: post.creator
          };
        }),
        maxPosts: postdata.maxPosts
        };
      }))
      // pipe function returns only posts
      .subscribe((postdata) => {
        console.log(postdata);
        this.posts = postdata.posts;
        this.postsupdated.next({
          posts: [...this.posts],
          postcount: postdata.maxPosts});
      });
    // return [...this.posts];
    // ... <- Used for extracting a deep copy of the array
  }

  getPostUpdateListener() {
    return this.postsupdated.asObservable();
  }

  addPost(title1: string, content1: string, image1: File) {
    const postData = new FormData();
    postData.append('title', title1);
    postData.append('content', content1);
    postData.append('image', image1, title1);
    console.log(image1);

    // const post: Post = {_id: null, title: title1, content: content1};
    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
      // responsedata has the data returned by app.post of the express app
      .subscribe((responsedata) => {
        // console.log(responsedata.message);

        // WE DON'T NEED THIS ANYMORE BECAUSE NGONINIT OF PostListComponent will fetch posts anyway
        // Everytime posts are added we go back to postlist. Hence we do not need to subscribe to this

        /*const post: Post = {_id: responsedata.post._id, title: title1,
          content: content1, imageUrl: responsedata.post.imageUrl};
        this.posts.push(post);
        this.postsupdated.next([...this.posts]);*/
        this.router.navigate(['/']);
      });
  }

  updatePost(postid: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('_id', postid);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {_id: postid, title: title,
        content: content, imageUrl: image, creator: null};
    }

    this.http.put('http://localhost:3000/api/posts/' + postid, postData)
      .subscribe((response) => {
        // console.log(response);
        // Update the posts array locally in the frontend

        // WE DON'T NEED THIS ANYMORE BECAUSE NGONINIT OF PostListComponent will fetch posts anyway
        // Everytime posts are added we go back to postlist. Hence we do not need to subscribe to this

        /*const posts2 = [...this.posts];
        const oldIndex = posts2.findIndex(p => p._id === postData._id);
        const post: Post = {
          _id: postid, title: title,
          content: content,
          imageUrl: ''
        };
        posts2[oldIndex] = post;
        this.posts = posts2;
        this.postsupdated.next([...this.posts]);*/
        this.router.navigate(['/']);
      });
  }

  getPost(id: string) {
    // return {...this.posts.find(p => p._id === id)};
    // Dont subscribe to the http request here, do it in the frontend code
    return this.http.get<{_id: string, title: string, content: string, imageUrl: string, creator: string}>
      ('http://localhost:3000/api/posts/' + id);
  }

  deletePost(postid: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postid);

    // Because of the changes in structure of postsupdated for the pagination
    // We would be better off to remove subscribe here, and add it where it is needed
    /*
      .subscribe(() => {
        // console.log('Deleted');
        // Delete the post in the local frontend posts array
        const postsremaining = this.posts.filter(post => post._id !== postid);
        this.posts = postsremaining;
        this.postsupdated.next([...this.posts]);
      });

    */
  }
}
