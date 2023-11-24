import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: {
        firstName: loginDto.firstName,
      },
    });
    if (!user) {
      throw new UnauthorizedException(
        "Vous n'existez pas dans la base de données",
      );
    }
    return user;
  }
}
