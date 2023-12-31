import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from './entities/bet.entity';
import { User } from '../users/entities/user.entity';
import { Game } from '../games/entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Game]),
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
