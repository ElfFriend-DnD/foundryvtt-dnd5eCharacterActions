import { MODULE_ID } from './constants';

export function log(force: boolean, ...args) {
  if (force || CONFIG[MODULE_ID].debug === true) {
    console.log(MODULE_ID, '|', ...args);
  }
}

export function getActivationType(activationType?: string) {
  switch (activationType) {
    case 'action':
    case 'bonus':
    case 'reaction':
      return activationType;

    default:
      return 'special';
  }
}
