import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Timer } from './timer/timer';
import { Score } from './score/score';
// import Score from './score/score';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Timer, Score],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('qpui');
}
