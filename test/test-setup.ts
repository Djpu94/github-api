import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.test' });

// Configuración global para los tests
beforeAll(() => {
  // Configuraciones que se ejecutan antes de todos los tests
  console.log('Starting tests...');
});

afterAll(() => {
  // Limpieza después de todos los tests
  console.log('Tests completed.');
});

// Configuración global de timeouts
jest.setTimeout(10000);

// Mocks globales si son necesarios
global.console = {
  ...console,
  // Descomenta si quieres silenciar algunos logs en tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
