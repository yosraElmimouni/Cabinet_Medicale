import { Cabinet } from '../models/cabinet';

describe('Cabinet', () => {
  it('should create an instance', () => {
    // Création d'un cabinet avec les propriétés requises
    const cabinet: Cabinet = {
      id: 1,
      nomCabinet: 'Test Cabinet',
      adresseCabinet: '123 Test Street',
      emailCabinet: 'test@cabinet.com',
      teleCabinet: '0123456789'
    };
    
    expect(cabinet).toBeTruthy();
    expect(cabinet.nomCabinet).toBe('Test Cabinet');
  });

  it('should create an instance with optional properties', () => {
    const cabinet: Cabinet = {
      id: 1,
      nomCabinet: 'Test Cabinet',
      adresseCabinet: '123 Test Street',
      emailCabinet: 'test@cabinet.com',
      teleCabinet: '0123456789',
      logo: 'logo.png',
      statut: 'ACTIF',
      createdAt: '2024-01-01'
    };
    
    expect(cabinet).toBeTruthy();
    expect(cabinet.statut).toBe('ACTIF');
    expect(cabinet.logo).toBe('logo.png');
  });
});