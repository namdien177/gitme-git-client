import { TestBed, async, inject } from '@angular/core/testing';

import { ExistRepositoryConfigGuard } from './exist-repository-config.guard';

describe('ExistRepositoryConfigGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExistRepositoryConfigGuard]
    });
  });

  it('should ...', inject([ExistRepositoryConfigGuard], (guard: ExistRepositoryConfigGuard) => {
    expect(guard).toBeTruthy();
  }));
});
