export class ApplicationNotFoundError extends Error {
  constructor(entityName: string, criteria: string) {
    super(`${entityName} was not found by ${criteria}`);
    this.name = 'ApplicationNotFoundError';
  }
}

