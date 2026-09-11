import type { Team, User } from '@/types/api';

/** Typed as the generated schemas so a mock cannot describe a response the API
 *  would never send. Values taken from a real seeded-team response. */

export const thunderbolts: Team = {
  id: 1,
  team_code: 'TM-IEH7ITRC',
  team_name: 'Thunderbolts',
  description: null,
  disbanded_at: null,
  created_at: '2026-09-11T11:52:36.000000Z',
  // Deliberately absent: the login payload and /me serialise teams WITHOUT
  // members loaded. Only GET /teams carries them. Adding members here would
  // let a test pass against a response the API never sends.
};

export const mainCoach: User = {
  id: 1,
  username: 'maincoach',
  email: 'maincoach@example.com',
  user_code: 'CH-BKHPDTKD',
  riot_id: null,
  is_online: true,
  roles: ['Coach'],
  teams: [thunderbolts],
  created_at: '2026-09-11T11:52:36.000000Z',
};

export const authToken = '1|4AT2TVTcC6UncL4v0sq5MN5dqBLWaJ71ACYkmGRUed90a6f5';
