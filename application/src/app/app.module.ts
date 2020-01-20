import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './components/quiz/search/search.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { AnswerComponent } from './components/quiz/answer/answer.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { HomeComponent } from './components/home/home.component';
import { ScoreComponent } from './components/score/score.component';
import { AboutComponent } from './components/about/about.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { NoInfoComponent } from './components/no-info/no-info.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    QuizComponent,
    AnswerComponent,
    WelcomeComponent,
    HomeComponent,
    ScoreComponent,
    AboutComponent,
    TutorialComponent,
    NoInfoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    HttpClientModule, 
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
