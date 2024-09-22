import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArticlesService } from './services/articles.service';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  merge,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Article } from './models/articles';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HtmlToPlaintextPipe } from './pipes/htmlToPlain.pipe';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HtmlToPlaintextPipe,
    FormsModule,
    ReactiveFormsModule,
  ],
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
  searchLoader = new BehaviorSubject(false);
  searchLoaderObs$ = this.searchLoader.asObservable();
  searchQuery$: Observable<any[]>; // For search input

  searchForm = new FormGroup({
    searchVal: new FormControl(''),
  });
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  constructor(
    private articleService: ArticlesService,
    private element: ElementRef
  ) {
    this.searchLoaderObs$.subscribe((x) => console.log(x));
    this.searchQuery$ = this.searchForm.valueChanges.pipe(
      tap(() => {
        // Set spinner to true before calling API
        this.searchLoader.next(true);
      }),
      map((x) => x.searchVal || ''),
      debounceTime(5), // Keep debounce time as is
      distinctUntilChanged(),

      switchMap((val) => {
        // Call the API and handle the loader inside
        return this.articleService.search('0', val).pipe(
          catchError((err) => {
            console.error(err);
            return of([]);
          })
        );
      })
    )
    // this.searchQuery$.subscribe(x=>{
    //   this.searchLoader.next(false);
    // });
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }

  ngAfterViewInit() {
    this.observer.observe(this.scrollAnchor.nativeElement);
  }
  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect(); // Clean up the observer
    }
  }
  // onSearch() {
  //   this.pageNo = 0; // Reset page number for new search
  //   this.allArticles = []; // Clear current articles
  //   this.fetchRecords('0', this.searchQuery); // Fetch articles with search query
  // }

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
  fetchRecords(offset: string, search: string | null = null) {
    this.articles$ = this.articleService.getArticles(offset, search);

    this.articles$.subscribe({
      next: (newArticles) => {
        if (offset === '0') {
          this.allArticles = newArticles;
        } else {
          this.allArticles = [...this.allArticles, ...newArticles];
        }
        this.allArticles$ = of(this.allArticles);
      },
      error: (error) => {
        console.error('Error fetching articles:', error);
      },
    });
  }

  ngOnInit(): void {
    this.allArticles$ = of([]); // Initialize with empty
    this.fetchRecords('0'); // Fetch first set of articles
    this.intersectionObserver(); // Setup observer after first fetch
  }
}
