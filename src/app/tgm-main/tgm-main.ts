import { Component, signal } from '@angular/core';

const POSITIONS = ['LV', '6er', 'RV', 'LM', 'ST', 'RM'] as const;

type Position = (typeof POSITIONS)[number];

interface RankedPlayer {
  name: string;
  rank: number;
}

interface LineupPlayer {
  name: string;
  position: Position;
}

interface GameRound {
  number: number;
  teamOne: LineupPlayer[];
  teamTwo: LineupPlayer[];
  bench: string[];
}

@Component({
  selector: 'app-tgm-main',
  templateUrl: './tgm-main.html',
  styleUrl: './tgm-main.scss',
})
export class TgmMain {
  readonly maxNames = 18;
  readonly positions = POSITIONS;
  readonly list = signal<string[]>([]);
  readonly gameStarted = signal(false);
  readonly rounds = signal<GameRound[]>([]);

  addItem(value: string) {
    const names = value.split(';').map((name) => name.trim()).filter(Boolean);
    if (names.length === 0) {
      return;
    }

    const availableSlots = this.maxNames - this.list().length;
    if (availableSlots <= 0) {
      return;
    }

    this.list.update((players) => [...players, ...names.slice(0, availableSlots)]);
  }

  startGame() {
    if (this.list().length < 12) {
      return;
    }

    this.rounds.set(this.buildRounds(this.list()));
    this.gameStarted.set(true);
  }

  editPlayers() {
    this.gameStarted.set(false);
  }

  private buildRounds(names: string[]): GameRound[] {
    const players: RankedPlayer[] = names.map((name, rank) => ({ name, rank }));
    const positionUse = players.map(() => Array<number>(POSITIONS.length).fill(0));
    const appearances = players.map(() => 0);
    const benchCount = players.length - 12;

    return Array.from({ length: 6 }, (_, roundIndex) => {
      const firstBenchIndex = (roundIndex * benchCount) % players.length;
      const benchRanks = new Set(
        Array.from({ length: benchCount }, (_, offset) =>
          (firstBenchIndex + offset) % players.length,
        ),
      );
      const activePlayers = players.filter((player) => !benchRanks.has(player.rank));
      const teamOne: RankedPlayer[] = [];
      const teamTwo: RankedPlayer[] = [];

      for (let pairIndex = 0; pairIndex < 6; pairIndex++) {
        const stronger = activePlayers[pairIndex];
        const weaker = activePlayers[11 - pairIndex];

        if ((roundIndex + pairIndex) % 2 === 0) {
          teamOne.push(stronger);
          teamTwo.push(weaker);
        } else {
          teamOne.push(weaker);
          teamTwo.push(stronger);
        }
      }

      const firstLineup = this.assignPositions(teamOne, positionUse, appearances);
      const secondLineup = this.assignPositions(teamTwo, positionUse, appearances);

      return {
        number: roundIndex + 1,
        teamOne: firstLineup,
        teamTwo: secondLineup,
        bench: players.filter((player) => benchRanks.has(player.rank)).map((player) => player.name),
      };
    });
  }

  private assignPositions(
    team: RankedPlayer[],
    positionUse: number[][],
    appearances: number[],
  ): LineupPlayer[] {
    let bestScore = Number.POSITIVE_INFINITY;
    let bestAssignment: Array<{ player: RankedPlayer; position: Position }> = [];
    const assignment: Array<{ player: RankedPlayer; position: Position }> = [];
    const usedPositions = new Set<number>();

    const search = (playerIndex: number, score: number) => {
      if (playerIndex === team.length) {
        if (score < bestScore) {
          bestScore = score;
          bestAssignment = [...assignment];
        }
        return;
      }

      const player = team[playerIndex];
      const preferredPosition = (appearances[player.rank] + player.rank) % POSITIONS.length;

      for (let positionIndex = 0; positionIndex < POSITIONS.length; positionIndex++) {
        if (usedPositions.has(positionIndex)) {
          continue;
        }

        const nextScore = score
          + positionUse[player.rank][positionIndex] * 100
          + Number(positionIndex !== preferredPosition);
        if (nextScore >= bestScore) {
          continue;
        }

        usedPositions.add(positionIndex);
        assignment.push({ player, position: POSITIONS[positionIndex] });
        search(playerIndex + 1, nextScore);
        assignment.pop();
        usedPositions.delete(positionIndex);
      }
    };

    search(0, 0);

    for (const { player, position } of bestAssignment) {
      positionUse[player.rank][POSITIONS.indexOf(position)]++;
      appearances[player.rank]++;
    }

    return bestAssignment
      .map(({ player, position }) => ({ name: player.name, position }))
      .sort((first, second) => POSITIONS.indexOf(first.position) - POSITIONS.indexOf(second.position));
  }
}
