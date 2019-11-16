/**
 * An action being computed in the background on behalf of the user
 */
export enum ComputedAction {
  /** The action is being computed in the background */
  Loading = 'loading',
  /** The action should complete without any additional work required by the user */
  Clean = 'clean',
  /** The action requires additional work by the user to complete successfully */
  Conflicts = 'conflicts',
  /** The action cannot be completed, for reasons the app should explain */
  Invalid = 'invalid',
}

interface IBlobResult {
  readonly mode: string;
  readonly sha: string;
  readonly path: string;
}

export interface IMergeEntry {
  readonly context: string;
  readonly base?: IBlobResult;
  readonly result?: IBlobResult;
  readonly our?: IBlobResult;
  readonly their?: IBlobResult;
  readonly diff: string;
  readonly hasConflicts?: boolean;
}

export interface MergeSuccess {
  readonly kind: ComputedAction.Clean;
  readonly entries: ReadonlyArray<IMergeEntry>;
}

export interface MergeError {
  readonly kind: ComputedAction.Conflicts;
  readonly conflictedFiles: number;
}

export interface MergeUnsupported {
  readonly kind: ComputedAction.Invalid;
}

export interface MergeLoading {
  readonly kind: ComputedAction.Loading;
}

export type MergeResult =
  | MergeSuccess
  | MergeError
  | MergeUnsupported
  | MergeLoading;
