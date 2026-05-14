import { Injectable } from '@nestjs/common';

export interface OutfitSuggestion {
  items: string[];
  tip: string;
}

@Injectable()
export class OutfitService {
  suggestOutfit(temperature: number, condition: string): string[] {
    const cond = condition.toLowerCase();

    if (cond === 'rain' || cond === 'drizzle' || cond === 'thunderstorm') {
      return this.rainyOutfit(temperature);
    }

    if (cond === 'snow') {
      return [
        'Abrigo grueso impermeable',
        'Botas impermeables con suela antideslizante',
        'Guantes térmicos',
        'Bufanda de lana',
        'Gorro de lana',
        'Pantalón térmico',
      ];
    }

    if (temperature < 10) {
      return [
        'Abrigo pesado o parka',
        'Suéter de lana',
        'Camiseta térmica interior',
        'Pantalón de lana o jean grueso',
        'Botas cerradas',
        'Bufanda y guantes',
      ];
    }

    if (temperature < 18) {
      return [
        'Chaqueta ligera o blazer',
        'Suéter o buzo',
        'Jean o pantalón de tela',
        'Tenis o zapatos cerrados',
      ];
    }

    if (temperature < 25) {
      return [
        'Camiseta manga corta o larga ligera',
        'Jean o pantalón casual',
        'Tenis o zapatos cómodos',
        'Opcional: chaqueta delgada para la tarde',
      ];
    }

    return [
      'Camiseta manga corta o top',
      'Shorts, falda ligera o pantalón de lino',
      'Sandalias o tenis ligeros',
      'Protector solar recomendado',
      'Gorra o sombrero si hay sol',
    ];
  }

  private rainyOutfit(temperature: number): string[] {
    const base = [
      'Impermeable o chaqueta de lluvia',
      'Paraguas compacto',
      'Botas o zapatos impermeables',
    ];

    if (temperature < 15) {
      return [...base, 'Pantalón de paño o jean grueso', 'Suéter debajo del impermeable'];
    }

    return [...base, 'Pantalón de tela o jean', 'Camiseta manga larga'];
  }
}
