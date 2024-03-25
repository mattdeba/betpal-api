import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Between, LessThan, Not, Repository } from "typeorm";
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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

  @Cron(CronExpression.EVERY_DAY_AT_11AM, {
    timeZone: 'Etc/UTC',
  })
  async updateGames() {
    const date = format(new Date(), 'd/M/yyyy');
    const url = `https://basketapi1.p.rapidapi.com/api/basketball/matches/${date}`;
    const key = this.configService.get('RAPIDAPI_KEY');
    const res = await this.httpService.axiosRef.get(url, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'basketapi1.p.rapidapi.com',
      },
    });
    const gamesFromApi = res.data.events.filter(
      (event) => event.tournament.slug === 'nba',
    );
    for (const game of gamesFromApi) {
      const existingGame = await this.gamesRepository.findOne({
        where: {
          gameId: game.id,
        },
      });
      if (!existingGame) {
        const newGame = this.gamesRepository.create({
          gameId: game.id,
          gameStatus: game.status.type,
          homeTeam: game.homeTeam.nameCode,
          awayTeam: game.awayTeam.nameCode,
          dateTimeUTC: new Date(game.startTimestamp * 1000).toISOString(),
          isClosed: game.status.type == 'finished',
          homeTeamScore: game.homeScore?.current || null,
          awayTeamScore: game.awayScore?.current || null,
        });
        await this.gamesRepository.save(newGame);
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    timeZone: 'Etc/UTC',
  })
  async updateScores(options = { updateAllGames: false }) {
    const { updateAllGames } = options;
    let games = [];

    if (updateAllGames === true) {
      games = await this.gamesRepository.find({
        where: {
          isClosed: Not(true),
        },
      });
    } else {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      games = await this.gamesRepository.find({
        where: {
          dateTimeUTC: LessThan(threeHoursAgo),
          isClosed: Not(true),
        },
      });
    }

    if (games.length != 0) {
      console.log('api call')
      const date = format(new Date(), 'd/M/yyyy');
      const url = `https://basketapi1.p.rapidapi.com/api/basketball/matches/${date}`;
      const key = this.configService.get('RAPIDAPI_KEY');
      const res = await this.httpService.axiosRef.get(url, {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'basketapi1.p.rapidapi.com',
        },
      });
      const gamesFromApi = res.data.events.filter(
        (event) => event.tournament.slug === 'nba',
      );
      for (const game of games) {
        const gameFromApi = gamesFromApi.find((g) => g.id === game.gameId);
        game.homeTeamScore = gameFromApi.homeScore?.current || null;
        game.awayTeamScore = gameFromApi.awayScore?.current || null;
        game.gameStatus = gameFromApi.status.type;
        game.isClosed = gameFromApi.status.type == 'finished';

        await this.gamesRepository.save(game);
      }
    }
  }
}
