import { GitDiffPipe } from './git-diff.pipe';

describe('GitDiffPipe', () => {
  it('create an instance', () => {
    const pipe = new GitDiffPipe();
    expect(pipe).toBeTruthy();
  });
});
