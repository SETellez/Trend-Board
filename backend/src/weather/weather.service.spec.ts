import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherService } from './weather.service';
import { OutfitService } from './outfit.service';

const mockOpenWeatherResponse = (overrides = {}): AxiosResponse => ({
  data: {
    name: 'Pereira',
    main: { temp: 22, feels_like: 21, humidity: 75 },
    weather: [{ main: 'Clouds', description: 'nublado' }],
    ...overrides,
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: jest.Mocked<HttpService>;
  let outfitService: jest.Mocked<OutfitService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-api-key') },
        },
        {
          provide: OutfitService,
          useValue: { suggestOutfit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get(HttpService);
    outfitService = module.get(OutfitService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería retornar datos de clima y sugerencia de outfit para una ciudad válida', async () => {
    const expectedOutfit = ['Camiseta manga corta', 'Jean', 'Tenis'];
    httpService.get.mockReturnValue(of(mockOpenWeatherResponse()));
    outfitService.suggestOutfit.mockReturnValue(expectedOutfit);

    const result = await service.getWeatherByCity('Pereira');

    expect(result.city).toBe('Pereira');
    expect(result.temperature).toBe(22);
    expect(result.condition).toBe('Clouds');
    expect(result.humidity).toBe(75);
    expect(result.outfit).toEqual(expectedOutfit);
    expect(outfitService.suggestOutfit).toHaveBeenCalledWith(22, 'Clouds');
  });

  it('debería lanzar HttpException 404 cuando la ciudad no existe', async () => {
    httpService.get.mockReturnValue(
      throwError(() => ({ response: { status: 404 } })),
    );

    await expect(service.getWeatherByCity('CiudadInexistente')).rejects.toThrow(
      new HttpException('Ciudad "CiudadInexistente" no encontrada', HttpStatus.NOT_FOUND),
    );
  });

  it('debería lanzar HttpException 401 cuando la API key es inválida', async () => {
    httpService.get.mockReturnValue(
      throwError(() => ({ response: { status: 401 } })),
    );

    await expect(service.getWeatherByCity('Pereira')).rejects.toThrow(
      new HttpException('API key inválida o no autorizada', HttpStatus.UNAUTHORIZED),
    );
  });

  it('debería lanzar HttpException 500 ante errores inesperados', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('Network Error')),
    );

    await expect(service.getWeatherByCity('Pereira')).rejects.toThrow(
      new HttpException(
        'Error al consultar el servicio de clima',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('debería incluir feelsLike y description en la respuesta', async () => {
    httpService.get.mockReturnValue(of(mockOpenWeatherResponse()));
    outfitService.suggestOutfit.mockReturnValue([]);

    const result = await service.getWeatherByCity('Pereira');

    expect(result.feelsLike).toBe(21);
    expect(result.description).toBe('nublado');
  });
});
