import { Injectable, signal } from '@angular/core';
import Team from '../types/team';

@Injectable({
  providedIn: 'root',
})
export default class Score {
  private readonly _teams = signal<Team[]>([]);

  get teams() {
    return this._teams();
  }

  set teams(teams: Team[]) {
    this._teams.set(teams);
  }

  updateTeamScore(teamId: number, score: number) {
    this._teams.update((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        team.score = score;
      }
      return teams;
    });
  }

  addTeamScore(teamId: number, points: number) {
    this._teams.update((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        team.score += points;
      }
      return teams;
    });
  }

  addTeam(team: Team) {
    this._teams.update((teams) => [...teams, team]);
  }

  createTeam(name: string) {
    const newTeam: Team = {
      id: this.teams.length,
      name,
      score: 0,
      time: -1,
      players: [],
    };
    this.addTeam(newTeam);
  }

  addPlayerToTeam(teamId: number, playerName: string) {
    this._teams.update((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        const newPlayer = {
          id: Date.now(),
          name: playerName,
          active: false,
        };
        team.players.push(newPlayer);
      }
      return teams;
    });
  }

}
