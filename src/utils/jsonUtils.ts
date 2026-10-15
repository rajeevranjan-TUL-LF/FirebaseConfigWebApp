/**
 * Utility functions for JSON validation, formatting, JSONPath resolution, and diffing.
 */

export interface JsonValidationError {
  message: string;
  line: number;
  column: number;
}

export function validateJsonString(raw: string): { isValid: boolean; parsed?: any; error?: JsonValidationError } {
  if (!raw.trim()) {
    return { isValid: false, error: { message: 'JSON content cannot be empty', line: 1, column: 1 } };
  }

  try {
    const parsed = JSON.parse(raw);
    return { isValid: true, parsed };
  } catch (err: any) {
    const msg = err.message || 'Invalid JSON';
    // Try to parse line and column from error message
    // e.g. "Unexpected token '}' at position 45" or "line 2 column 5"
    let line = 1;
    let column = 1;

    const lineColMatch = msg.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      const posMatch = msg.match(/position (\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const lines = raw.slice(0, pos).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    return {
      isValid: false,
      error: {
        message: msg,
        line,
        column,
      },
    };
  }
}

export function formatJson(val: any, space = 2): string {
  try {
    if (typeof val === 'string') {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, space);
    }
    return JSON.stringify(val, null, space);
  } catch {
    return typeof val === 'string' ? val : String(val);
  }
}

export function minifyJson(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  } catch {
    return raw;
  }
}

/**
 * Resolves a simple JSONPath expression like $.data.feature_flags or $.config
 */
export function resolveJsonPath(obj: any, pathStr: string): any {
  if (!pathStr || pathStr === '$' || pathStr === '$.') return obj;
  const cleanPath = pathStr.replace(/^\$\.?/, '');
  if (!cleanPath) return obj;

  const segments = cleanPath.split('.').filter(Boolean);
  let current = obj;
  for (const seg of segments) {
    if (current && typeof current === 'object' && seg in current) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Flattens nested object into dot-notated key-value map
 */
export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) result[prefix] = obj;
    return result;
  }

  for (const key of Object.keys(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, nextKey));
    } else {
      result[nextKey] = value;
    }
  }

  return result;
}

export function inferValueType(val: any): 'string' | 'number' | 'boolean' | 'null' | 'json_object' | 'json_array' {
  if (val === null) return 'null';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) return 'json_array';
  if (typeof val === 'object') return 'json_object';
  return 'string';
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Computes a line-by-line diff for two objects or strings
 */
export function computeJsonDiff(oldVal: any, newVal: any): DiffLine[] {
  const oldStr = typeof oldVal === 'string' ? oldVal : formatJson(oldVal);
  const newStr = typeof newVal === 'string' ? newVal : formatJson(newVal);

  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');

  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        diff.push({
          type: 'unchanged',
          text: oldLines[i],
          oldLineNumber: i + 1,
          newLineNumber: j + 1,
        });
        i++;
        j++;
      } else {
        diff.push({
          type: 'removed',
          text: oldLines[i],
          oldLineNumber: i + 1,
        });
        diff.push({
          type: 'added',
          text: newLines[j],
          newLineNumber: j + 1,
        });
        i++;
        j++;
      }
    } else if (i < oldLines.length) {
      diff.push({
        type: 'removed',
        text: oldLines[i],
        oldLineNumber: i + 1,
      });
      i++;
    } else if (j < newLines.length) {
      diff.push({
        type: 'added',
        text: newLines[j],
        newLineNumber: j + 1,
      });
      j++;
    }
  }

  return diff;
}
