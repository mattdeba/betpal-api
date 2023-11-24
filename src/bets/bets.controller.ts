import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { AcceptBetDto } from './dto/accept-bet.dto';
import { AssertBetDto } from "./dto/assert-bet.dto";

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  create(@Body() createBetDto: CreateBetDto) {
    return this.betsService.create(createBetDto);
  }

  @Get()
  findAll() {
    return this.betsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.betsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDto) {
    return this.betsService.update(+id, updateBetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.betsService.remove(+id);
  }

  @Post(':id/accept')
  async acceptBet(@Param('id') id: string, @Body() acceptBetDto: AcceptBetDto) {
    return await this.betsService.acceptBet(+id, acceptBetDto?.acceptorEmail);
  }

  @Post(':id/assert')
  async assertBet(@Param('id') id: string, @Body() assertionDto: AssertBetDto) {
    return await this.betsService.assertBet(+id, assertionDto.assertionCorrect);
  }

  @Post(':id/close')
  async closeBet(@Param('id') id: string) {
    return await this.betsService.closeBet(+id);
  }
}
