import Player from './player';

export default interface Team {
    id: number;
    name: string;
    score: number;
    time: number;
    players: Player[];
}