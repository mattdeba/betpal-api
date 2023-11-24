import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bet } from "../../bets/entities/bet.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @OneToMany(() => Bet, (bet) => bet.createdBy)
  betsCreated: Bet[];

  @OneToMany(() => Bet, (bet) => bet.acceptedBy)
  betsAccepted: Bet[];
}
