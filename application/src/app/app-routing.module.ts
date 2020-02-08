import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component'
import { QuizComponent } from './components/quiz/quiz.component'
import { TutorialComponent } from './components/tutorial/tutorial.component'
import { HomeComponent } from './components/home/home.component'
import { ScoreComponent } from './components/score/score.component';
import { NoInfoComponent } from './components/no-info/no-info.component';
import { TracksComponent } from './components/tracks/tracks.component';
import { SurveyComponent } from './components/survey/survey.component';
import { AboutComponent } from './components/about/about.component';





const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'welcome', component: WelcomeComponent }, 
  { path: 'tutorial', component: TutorialComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'results', component: ScoreComponent}, 
  { path: 'no-info', component: NoInfoComponent}, 
  { path: 'tracks', component: TracksComponent}, 
  { path: 'about', component: AboutComponent}, 
  { path: 'survey', component: SurveyComponent}, 
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
