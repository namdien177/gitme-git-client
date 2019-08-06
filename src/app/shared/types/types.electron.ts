import * as NodePty from 'node-pty';
import * as XTerm from 'xterm';
import * as electron from 'electron';

/**
 * Node-Pty instance in angular compile runtime
 */
export const nodePty: typeof NodePty = window.require('node-pty');
export type nodePtyTypeOf = typeof NodePty;
/**
 * XTerm instance in angular compile runtime
 */
export const xTerm: typeof XTerm = window.require('xterm');
export type xTermTypeOf = typeof XTerm;
/**
 * electron instance in angular compile runtime
 */
export const electronNG: typeof electron = window.require('electron');
export type electronNGTypeOf = typeof electron;
