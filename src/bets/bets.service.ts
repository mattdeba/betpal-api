import { HttpException, Injectable } from "@nestjs/common";
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
    console.log(bet.acceptedBy);
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
    return this.betsRepository.update(id, {
      acceptedBy: user,
    });
  }
}
