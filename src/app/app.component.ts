import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArticlesService } from './services/articles.service';
import { concatMap, EMPTY, map, merge, Observable, of, switchMap } from 'rxjs';
import { Article } from './models/articles';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HtmlToPlaintextPipe } from './pipes/htmlToPlain.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HtmlToPlaintextPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [HttpClientModule, HttpClient],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'continuous-scoll';
  articles$!: Observable<Article[]>;
  allArticles$!: Observable<Article[]>;
  observer!: IntersectionObserver;
  allArticles: Article[] = [];
  pageNo = 0;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  constructor(
    private articleService: ArticlesService,
    private element: ElementRef
  ) {}

  ngAfterViewInit() {
    this.observer.observe(this.scrollAnchor.nativeElement);
  }

  intersectionObserver() {
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.fetchRecords(this.pageNo.toString());
        this.pageNo = this.pageNo + 10;
        console.log(this.pageNo);
      }
    }, options);
  }
  fetchRecords(offset: string) {
    this.articles$ = this.articleService.getArticles(offset);
  
    this.articles$.subscribe(newArticles => {
      if (offset === '0') {
        this.allArticles = newArticles;
      } else {
        this.allArticles = [...this.allArticles, ...newArticles];
      }
      this.allArticles$ = of(this.allArticles);
    });
  }
  
  ngOnInit(): void {
    this.allArticles$ = of([]); // Initialize with empty
    this.fetchRecords('0'); // Fetch first set of articles
    this.intersectionObserver(); // Setup observer after first fetch
  }
  
}
