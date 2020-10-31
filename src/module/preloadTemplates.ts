import { MODULE_ID } from './constants';

export const preloadTemplates = async function () {
  const templatePaths = [
    `modules/${MODULE_ID}/templates/parts/actor-actions-list.hbs`,
  ];

  return loadTemplates(templatePaths);
};
