import { OutfitService } from './outfit.service';

describe('OutfitService', () => {
  let service: OutfitService;

  beforeEach(() => {
    service = new OutfitService();
  });

  it('debería sugerir ropa de lluvia cuando la condición es Rain', () => {
    const outfit = service.suggestOutfit(20, 'Rain');
    expect(outfit).toContain('Impermeable o chaqueta de lluvia');
    expect(outfit).toContain('Paraguas compacto');
  });

  it('debería sugerir ropa abrigada cuando la temperatura es menor a 10°C', () => {
    const outfit = service.suggestOutfit(5, 'Clear');
    expect(outfit).toContain('Abrigo pesado o parka');
    expect(outfit).toContain('Bufanda y guantes');
  });

  it('debería sugerir ropa ligera cuando la temperatura supera los 25°C', () => {
    const outfit = service.suggestOutfit(30, 'Clear');
    expect(outfit).toContain('Camiseta manga corta o top');
    expect(outfit).toContain('Protector solar recomendado');
  });

  it('debería sugerir ropa intermedia para temperatura entre 10 y 18°C', () => {
    const outfit = service.suggestOutfit(14, 'Clouds');
    expect(outfit).toContain('Chaqueta ligera o blazer');
  });

  it('debería sugerir equipo de nieve cuando la condición es Snow', () => {
    const outfit = service.suggestOutfit(0, 'Snow');
    expect(outfit).toContain('Abrigo grueso impermeable');
    expect(outfit).toContain('Guantes térmicos');
  });
});
