import { config } from 'dotenv';

config({ path: '.env.test' });

beforeAll(() => {
  console.log('Iniciando pruebas...');
});

afterAll(() => {
  console.log('Pruebas completadas.');
});

jest.setTimeout(10000);

global.console = {
  ...console,
};
