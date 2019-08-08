import * as NodePty from 'node-pty';
import * as XTerm from 'xterm';
import * as electron from 'electron';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import * as fs from 'fs';
import * as os from 'os';
import * as process from 'process';
import * as child_process from 'child_process';
import * as util from 'util';

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
/**
 * NodeJS packages
 */
export const utilNode: typeof util = window.require('util');
export const cryptoNode: typeof crypto = window.require('crypto');
export const zlibNode: typeof zlib = window.require('zlib');
export const fsNode: typeof fs = window.require('fs');
export const osNode: typeof os = window.require('os');
export const child_processNode: typeof child_process = window.require('child_process');
export const processNode: typeof process = window.require('process');
