import { inject, TestBed } from '@angular/core/testing';

import { NotExistRepositoryConfigGuard } from './not-exist-repository-config.guard';

describe('NotExistRepositoryConfigGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotExistRepositoryConfigGuard]
    });
  });

  it('should ...', inject([NotExistRepositoryConfigGuard], (guard: NotExistRepositoryConfigGuard) => {
    expect(guard).toBeTruthy();
  }));
});
