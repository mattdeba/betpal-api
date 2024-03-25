import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Game } from '../../games/entities/game.entity';

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  assertion: string;

  @Column({ type: 'double precision', nullable: true })
  amount: number;

  @Column({ type: 'double precision', nullable: true })
  target: number;

  @ManyToOne(() => User, (user) => user.betsCreated)
  createdBy: User;

  @ManyToOne(() => User, (user) => user.betsAccepted)
  acceptedBy: User;

  @ManyToOne(() => Game)
  game: Game;

  @Column({ nullable: true })
  homeTeamWinner: boolean;

  @Column({ nullable: true })
  assertionCorrect: boolean;

  @Column({ nullable: true })
  closed: boolean;
}
