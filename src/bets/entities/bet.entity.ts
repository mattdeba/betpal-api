import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => User, (user) => user.betsCreated)
  createdBy: User;

  @ManyToOne(() => User, (user) => user.betsAccepted)
  acceptedBy: User;
}
