import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from './entities/bet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bet])],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
