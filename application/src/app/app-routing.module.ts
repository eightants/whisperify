import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { HomeComponent } from './components/home/home.component';
import { ScoreComponent } from './components/score/score.component';
import { NoInfoComponent } from './components/no-info/no-info.component';
import { TracksComponent } from './components/tracks/tracks.component';
import { SurveyComponent } from './components/survey/survey.component';
import { AboutComponent } from './components/about/about.component';
import { ChallengeComponent } from './components/challenge/challenge.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'challenge/:code', component: ChallengeComponent },
  { path: 'tutorial', component: TutorialComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'results', component: ScoreComponent },
  { path: 'results/:code', component: ScoreComponent },
  { path: 'no-info', component: NoInfoComponent },
  { path: 'top', component: TracksComponent },
  { path: 'about', component: AboutComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user/:username', component: ProfileComponent },
  { path: 'survey', component: SurveyComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'analysis/user/:username', component: AnalysisComponent },
  { path: 'analysis/plot/:code', component: AnalysisComponent },
  {
    path: 'documentation',
    redirectTo: 'documentation/getting-started',
    pathMatch: 'full',
  },
  { path: 'documentation/:title', component: DocumentationComponent },
  { path: 'documentation/:title/:section', component: DocumentationComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
