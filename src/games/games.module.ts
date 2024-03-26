import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { HttpModule } from '@nestjs/axios';
import { BetsModule } from '../bets/bets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), HttpModule, BetsModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
