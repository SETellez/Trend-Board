import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OutfitService } from './outfit.service';

export interface WeatherResponse {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  outfit: string[];
}

@Injectable()
export class WeatherService {
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly outfitService: OutfitService,
  ) {}

  async getWeatherByCity(city: string): Promise<WeatherResponse> {
    const apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: { q: city, appid: apiKey, units: 'metric', lang: 'es' },
        }),
      );

      const temperature: number = data.main.temp;
      const condition: string = data.weather[0].main;
      const outfit = this.outfitService.suggestOutfit(temperature, condition);

      return {
        city: data.name,
        temperature,
        feelsLike: data.main.feels_like,
        condition,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        outfit,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException(
          `Ciudad "${city}" no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.response?.status === 401) {
        throw new HttpException(
          'API key inválida o no autorizada',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        'Error al consultar el servicio de clima',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
