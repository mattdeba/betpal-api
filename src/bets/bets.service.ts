import { Injectable } from '@nestjs/common';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './entities/bet.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betsRepository: Repository<Bet>,
  ) {}
  create(createBetDto: CreateBetDto) {
    return this.betsRepository.save(createBetDto);
  }

  findAll() {
    return this.betsRepository.find();
  }

  findOne(id: number) {
    return this.betsRepository.findOne({ where: { id } });
  }

  update(id: number, updateBetDto: UpdateBetDto) {
    return this.betsRepository.update(id, updateBetDto);
  }

  remove(id: number) {
    return this.betsRepository.delete(id);
  }
}
