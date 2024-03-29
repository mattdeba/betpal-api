import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Between, Not, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

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
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const res = await this.httpService.axiosRef.get(
      `https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/${year}-${month}-${day}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key':
            this.configService.get('SUBSCRIPTION_KEY'),
        },
      },
    );
    const gamesFromApi = res.data;
    for (const game of gamesFromApi) {
      const existingGame = await this.gamesRepository.findOne({
        where: {
          gameId: game.GameID,
        },
      });
      if (!existingGame) {
        const newGame = this.gamesRepository.create({
          gameId: game.GameID,
          gameStatus: game.Status,
          homeTeam: game.HomeTeam,
          awayTeam: game.AwayTeam,
          dateTimeUTC: game.DateTimeUTC,
          isClosed: game.IsClosed,
          homeTeamScore: game.HomeTeamScore,
          awayTeamScore: game.AwayTeamScore,
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
    let games: any;

    if (updateAllGames === true) {
      games = await this.gamesRepository.find({
        where: {
          isClosed: Not(true),
        },
      });
    } else {
      const now = new Date();
      const threeHoursBefore = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      games = await this.gamesRepository.find({
        where: {
          dateTimeUTC: Between(threeHoursBefore, now),
          isClosed: Not(true),
        },
      });
    }

    for (const game of games) {
      const res = await this.httpService.axiosRef.get(
        `https://api.sportsdata.io/v3/nba/pbp/json/PlayByPlay/${game.gameId}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key':
              this.configService.get('SUBSCRIPTION_KEY'),
          },
        },
      );

      const gameFromApi = res.data.Game;
      game.homeTeamScore = gameFromApi.HomeTeamScore;
      game.awayTeamScore = gameFromApi.AwayTeamScore;
      game.gameStatus = gameFromApi.Status;
      game.isClosed = gameFromApi.IsClosed;

      await this.gamesRepository.save(game);
    }
  }
}
