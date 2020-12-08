import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MarkdownModule } from 'ngx-markdown';
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
import { TracksComponent } from './components/tracks/tracks.component';
import { SurveyComponent } from './components/survey/survey.component';
import { MultchoiceComponent } from './components/quiz/multchoice/multchoice.component';
import { ChallengeComponent } from './components/challenge/challenge.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { RadarChartComponent } from './components/analysis/radar-chart/radar-chart.component';
import { DotPlotComponent } from './components/analysis/dot-plot/dot-plot.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { MediaNetAdComponent } from './components/media-net-ad/media-net-ad.component'

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
    TracksComponent,
    SurveyComponent,
    MultchoiceComponent,
    ChallengeComponent,
    AnalysisComponent,
    RadarChartComponent,
    DotPlotComponent,
    NavbarComponent,
    DocumentationComponent,
    MediaNetAdComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule, 
    HttpClientModule, 
    FormsModule,
    MarkdownModule.forRoot({loader: HttpClientModule})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
