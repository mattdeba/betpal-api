import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return "Ceci est l'API de Betpal!";
  }
}
