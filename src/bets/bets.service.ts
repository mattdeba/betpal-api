import { HttpException, Injectable } from '@nestjs/common';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './entities/bet.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betsRepository: Repository<Bet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(createBetDto: CreateBetDto) {
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
    const bet = await this.betsRepository.findOne({ where: { id } });
    if (!bet) {
      throw new Error('Bet not found');
    }
    if (bet.acceptedBy) {
      throw new Error('Bet already accepted');
    }
    return this.betsRepository.update(id, updateBetDto);
  }

  remove(id: number) {
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

  async closeBet(id: number) {
    const bet = await this.betsRepository.findOne({
      where: { id },
      relations: { acceptedBy: true, createdBy: true },
    });
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
