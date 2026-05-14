import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('El parámetro "city" es requerido');
    }
    return this.weatherService.getWeatherByCity(city);
  }
}
