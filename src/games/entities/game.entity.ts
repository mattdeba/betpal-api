import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  gameId: number;

  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column({ type: 'timestamp' })
  dateTimeUTC: Date;

  @Column({ default: false })
  isClosed: boolean;

  @Column({ nullable: true })
  homeTeamScore: number;

  @Column({ nullable: true })
  awayTeamScore: number;

  @Column({ nullable: true })
  gameStatus: string;
}
