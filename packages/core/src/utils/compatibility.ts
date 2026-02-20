/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import os from 'node:os';

/**
 * Detects if the current OS is Windows 10.
 * Windows 11 also reports as version 10.0, but with build numbers >= 22000.
 */
export function isWindows10(): boolean {
  if (os.platform() !== 'win32') {
    return false;
  }
  const release = os.release();
  const parts = release.split('.');
  if (parts.length >= 3 && parts[0] === '10' && parts[1] === '0') {
    const build = parseInt(parts[2], 10);
    return build < 22000;
  }
  return false;
}

/**
 * Detects if the current terminal is a JetBrains-based IDE terminal.
 */
export function isJetBrainsTerminal(): boolean {
  return process.env['TERMINAL_EMULATOR'] === 'JetBrains-JediTerm';
}

/**
 * Detects if the current terminal is the default Apple Terminal.app.
 */
export function isAppleTerminal(): boolean {
  return process.env['TERM_PROGRAM'] === 'Apple_Terminal';
}

/**
 * Detects if the current terminal supports true color (24-bit).
 */
export function supportsTrueColor(): boolean {
  // Check COLORTERM environment variable
  if (
    process.env['COLORTERM'] === 'truecolor' ||
    process.env['COLORTERM'] === '24bit'
  ) {
    return true;
  }

  // Check if stdout supports 24-bit color depth
  if (process.stdout.getColorDepth && process.stdout.getColorDepth() >= 24) {
    return true;
  }

  return false;
}

/**
 * Returns a list of compatibility warnings based on the current environment.
 */
export enum WarningPriority {
  Low = 'low',
  High = 'high',
}

export interface StartupWarning {
  id: string;
  message: string;
  priority: WarningPriority;
}

export function getCompatibilityWarnings(): StartupWarning[] {
  const warnings: StartupWarning[] = [];

  if (isWindows10()) {
    warnings.push({
      id: 'windows-10',
      message:
        'Warning: Windows 10 detected. Some UI features like smooth scrolling may be degraded. Windows 11 is recommended for the best experience.',
      priority: WarningPriority.High,
    });
  }

  if (isJetBrainsTerminal()) {
    warnings.push({
      id: 'jetbrains-terminal',
      message:
        'Warning: JetBrains terminal detected. You may experience rendering or scrolling issues. Using an external terminal (e.g., Windows Terminal, iTerm2) is recommended.',
      priority: WarningPriority.High,
    });
  }

  if (!supportsTrueColor() && !isAppleTerminal()) {
    warnings.push({
      id: 'true-color',
      message:
        'Warning: True color (24-bit) support not detected. Using a terminal with true color enabled will result in a better visual experience.',
      priority: WarningPriority.Low,
    });
  }

  return warnings;
}
