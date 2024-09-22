import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Article } from '../models/articles';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private http: HttpClient) {}
  url: string = 'https://affairscloud.com/wp-json/wp/v2';
  posts: string = `${this.url}/posts`;
  
  getArticles(offset: string, search:null|string=null): Observable<Article[]> {
    let query = this.posts 
    if(offset){
      query += '?offset=' + offset
    }

    if(search){
      query = `${this.url}/search?search=${search}&type=post`
      if(offset){
        query += '&offset=' + offset
      }
    }
    
    
    return this.http
      .post<Article[]>('https://video-call-mu.vercel.app/api/proxy', {
        url: query,
      })
      .pipe(
        map((articles) => {
          let articlesArr = articles.map((article) => {
            article.body = article['excerpt']['rendered'];
            article.name = article['title']['rendered'];
            return article;
          });
          return articlesArr;
        })
      );
  }
  search(offset: string, search:null|string=null): Observable<any[]> {
    let query = this.posts 
    

    if(search){
      query = `${this.url}/search?search=${search}&type=post`
      if(offset){
        query += '&offset=' + offset
      }
    }else{
      return of([])
    }
    
    
    return this.http
      .post<any[]>('https://video-call-mu.vercel.app/api/proxy', {
        url: query,
      })
      
  }
}
