import { MODULE_ID } from './constants';

export function log(force: boolean, ...args) {
  //@ts-ignore
  const shouldLog = force || window.DEV?.getPackageDebugValue(MODULE_ID);

  if (shouldLog) {
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

export function isActiveItem(activationType?: string) {
  if (!activationType) {
    return false;
  }
  if (['minute', 'hour', 'day'].includes(activationType)) {
    return false;
  }
  return true;
}
