import { TestBed } from '@angular/core/testing';

import { CodeHighlightService } from './code-highlight.service';

describe('CodeHighlightService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CodeHighlightService = TestBed.get(CodeHighlightService);
    expect(service).toBeTruthy();
  });
});
