// tests/setup-api.js - Setup POUR TESTS D'API RÉELLE
console.log('🔧 Setup pour tests API réelle (localhost:3001)');

// PAS de mocks ici ! On veut tester l'API réelle
// Juste une configuration basique

// Augmente le timeout pour les appels réseau
jest.setTimeout(10000);

// Désactive les mocks globaux s'ils existent
jest.unmock('@terra-money/feather.js');
jest.unmock('crypto');
jest.unmock('bip39');
jest.unmock('elliptic');