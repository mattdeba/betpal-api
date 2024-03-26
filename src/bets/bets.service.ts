import { HttpException, Injectable } from '@nestjs/common';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './entities/bet.entity';
import { User } from '../users/entities/user.entity';
import { Game } from '../games/entities/game.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betsRepository: Repository<Bet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}
  async create(createBetDto: CreateBetDto) {
    const game = await this.gamesRepository.findOne({
      where: { id: createBetDto.gameId },
    });
    if (!game) {
      throw new Error('Game not found');
    }
    const user = await this.usersRepository.findOne({
      where: {
        email: createBetDto.creatorEmail,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    await this.usersRepository.update(user.id, {
      points: user.points - createBetDto.amount,
    });
    return this.betsRepository.save({
      assertion: createBetDto.assertion,
      amount: createBetDto.amount,
      target: createBetDto.target,
      createdBy: user,
      game: game,
      homeTeamWinner: createBetDto.homeTeamWinner,
    });
  }

  findAll() {
    return this.betsRepository.find({
      relations: {
        createdBy: true,
        acceptedBy: true,
      },
    });
  }

  findAllFromFirstName(firstName: string) {
    return this.betsRepository
      .createQueryBuilder('bet')
      .innerJoinAndSelect(
        'bet.createdBy',
        'user',
        'user.firstName = :firstName',
        { firstName },
      )
      .leftJoinAndSelect('bet.acceptedBy', 'acceptedBy')
      .getMany();
  }

  findOne(id: number) {
    return this.betsRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        acceptedBy: true,
      },
    });
  }

  async update(id: number, updateBetDto: UpdateBetDto) {
    const bet = await this.betsRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!bet) {
      throw new Error('Bet not found');
    }
    if (bet.acceptedBy) {
      throw new Error('Bet already accepted');
    }
    if (
      updateBetDto.amount !== undefined &&
      updateBetDto.amount !== bet.amount
    ) {
      const user = bet.createdBy;
      await this.usersRepository.update(user.id, {
        points: user.points + bet.amount - updateBetDto.amount,
      });
    }
    return this.betsRepository.update(id, updateBetDto);
  }

  async remove(id: number) {
    const bet = await this.betsRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!bet) {
      throw new Error('Bet not found');
    }
    if (bet.acceptedBy) {
      throw new Error('Bet already accepted');
    }
    await this.usersRepository.update(bet.createdBy.id, {
      points: bet.createdBy.points + bet.amount,
    });
    return this.betsRepository.delete(id);
  }

  async acceptBet(id: number, acceptorEmail: string) {
    const bet = await this.betsRepository.findOne({
      where: { id },
      relations: { acceptedBy: true },
    });
    if (!bet) {
      throw new HttpException('Bet not found', 404);
    }
    if (bet.acceptedBy) {
      throw new HttpException('Bet already accepted', 400);
    }
    const user = await this.usersRepository.findOne({
      where: {
        email: acceptorEmail,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    await this.usersRepository.update(user.id, {
      points: user.points - bet.target + bet.amount,
    });
    return this.betsRepository.update(id, {
      acceptedBy: user,
    });
  }

  assertBet(id: number, assertionCorrect: boolean) {
    return this.betsRepository.update(id, {
      assertionCorrect,
    });
  }

  async assertBetsFromGame(gameId: number) {
    const game = await this.gamesRepository.findOne({ where: { id: gameId } });

    if (!game || game.gameStatus !== 'finished') {
      return;
    }

    const gameWinnerIsHomeTeam = game.homeTeamScore > game.awayTeamScore;

    const bets = await this.betsRepository.find({
      where: {
        game: {
          id: gameId,
        },
      },
    });
    const betsClosed = [];
    for (const bet of bets) {
      try {
        const betIsCorrect = bet.homeTeamWinner === gameWinnerIsHomeTeam;

        await this.betsRepository.update(bet.id, {
          assertionCorrect: betIsCorrect,
        });
        const closedBet = await this.closeBet(bet.id);
        if (closedBet) {
          betsClosed.push(closedBet);
        }
        return betsClosed;
      } catch (error) {
        console.error(error);
      }
    }
  }

  async closeBet(id: number) {
    const bet = await this.betsRepository.findOne({
      where: { id },
      relations: { acceptedBy: true, createdBy: true },
    });
    if (bet.closed) {
      throw new HttpException('Bet already closed', 400);
    }
    if (!bet) {
      throw new HttpException('Bet not found', 404);
    }
    if (!bet.acceptedBy) {
      throw new HttpException('Bet not accepted', 400);
    }
    if (bet.assertionCorrect === null) {
      throw new HttpException('Result not still available', 400);
    }
    if (bet.assertionCorrect === true) {
      //creator wins
      await this.usersRepository.update(bet.createdBy.id, {
        points: bet.createdBy.points + bet.target,
      });
      await this.betsRepository.update(id, {
        closed: true,
      });
    } else if (bet.assertionCorrect === false) {
      //acceptor wins
      await this.usersRepository.update(bet.acceptedBy.id, {
        points: bet.acceptedBy.points + bet.target,
      });
      await this.betsRepository.update(id, {
        closed: true,
      });
    }
    return this.betsRepository.findOne({
      where: { id },
    });
  }
}
