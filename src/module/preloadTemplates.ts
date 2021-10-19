export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    // Add paths to "modules/foundryvtt-dnd5eCharacterActions/templates"
  ];

  return loadTemplates(templatePaths);
}
