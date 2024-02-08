import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = this.gamesRepository.create(createGameDto);
    await this.gamesRepository.save(game);
    return game;
  }

  findAll() {
    return this.gamesRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gamesRepository.findOne({ where: { id } });
    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    const updatedGame = this.gamesRepository.merge(game, updateGameDto);
    await this.gamesRepository.save(updatedGame);
    return updatedGame;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
