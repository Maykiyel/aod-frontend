import { setupServer } from 'msw/node';
import { handlers } from '@/testing/mocks/handlers';

/** The network boundary. Tests mock here and nowhere else. */
export const server = setupServer(...handlers);
