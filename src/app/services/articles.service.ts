import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Article } from '../models/articles';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private http: HttpClient) {}
  url: string = 'https://affairscloud.com/wp-json/wp/v2';
  posts: string = `${this.url}/posts`;
  getArticles(offset: string): Observable<Article[]> {
    return this.http
      .post<Article[]>('https://video-call-mu.vercel.app/api/proxy', {
        url: this.posts + '?offset=' + offset,
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
}
