import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  assertion: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  target: number;
}
