import { TEMP_UPLOAD_HOST } from './temp-upload';

const SENSITIVE_QUERY_KEYS = ['x-amz-signature', 'x-amz-credential', 'x-amz-security-token'];
const EMBEDDED_URL = new RegExp(
    'https?:\\/\\/[^\\s\'"<>]*' + TEMP_UPLOAD_HOST.replace(/\./g, '\\.') + '[^\\s\'"<>]*',
    'gi'
);

type Redaction = { value: any; changed: boolean; unsafe: boolean };

/**
 * Remove presigned credential material from a telemetry string.
 * The returned value is for Sentry only. Callers must keep using the original upload URL.
 */
export function redactPresignedUploadUrl(url: string): string {
    if (typeof url !== 'string' || url.indexOf(TEMP_UPLOAD_HOST) === -1) {
        return url;
    }

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch (err) {
        return url;
    }

    if (parsed.hostname !== TEMP_UPLOAD_HOST) {
        return url;
    }

    const sensitiveKeys = Array.from(parsed.searchParams.keys()).filter((key) => {
        return SENSITIVE_QUERY_KEYS.indexOf(key.toLowerCase()) !== -1;
    });
    if (sensitiveKeys.length === 0) {
        return url;
    }

    const alreadyRedacted = sensitiveKeys.every((key) => {
        const values = parsed.searchParams.getAll(key);
        return values.length > 0 && values.every((value) => value.toLowerCase() === '[redacted]');
    });
    if (alreadyRedacted) {
        return url;
    }

    sensitiveKeys.forEach((key) => {
        parsed.searchParams.set(key, '[redacted]');
    });

    return parsed.toString();
}

function redactSensitiveQueryValues(value: string): { value: string; changed: boolean } {
    let changed = false;
    const next = value.replace(
        /(x-amz-signature|x-amz-credential|x-amz-security-token)=([^&#\s'"<>]*)/gi,
        (match, key, raw) => {
            const lower = String(raw).toLowerCase();
            if (lower === '[redacted]' || lower === '%5bredacted%5d') {
                return match;
            }
            changed = true;
            return key + '=[redacted]';
        }
    );
    return { value: next, changed };
}

function redactEmbeddedText(value: string): Redaction {
    const hasHost = value.indexOf(TEMP_UPLOAD_HOST) !== -1;
    if (!hasHost && !stillHasSignedMaterial(value)) {
        return { value, changed: false, unsafe: false };
    }

    let next = value;
    let changed = false;
    if (hasHost) {
        next = value.replace(EMBEDDED_URL, (match) => {
            const redacted = redactPresignedUploadUrl(match);
            if (redacted === match) {
                return match;
            }
            changed = true;
            return redacted;
        });
    }

    if (stillHasSignedMaterial(next)) {
        const queryRedacted = redactSensitiveQueryValues(next);
        if (queryRedacted.changed) {
            next = queryRedacted.value;
            changed = true;
        }
    }

    if (stillHasSignedMaterial(next)) {
        return { value, changed: false, unsafe: true };
    }

    return { value: changed ? next : value, changed, unsafe: false };
}

function stillHasSignedMaterial(value: string): boolean {
    const lower = value.toLowerCase();
    return SENSITIVE_QUERY_KEYS.some((key) => {
        const marker = key + '=';
        let from = 0;
        while (from < lower.length) {
            const at = lower.indexOf(marker, from);
            if (at === -1) {
                return false;
            }
            const rest = lower.slice(at + marker.length);
            if (rest.indexOf('[redacted]') !== 0 && rest.indexOf('%5bredacted%5d') !== 0) {
                return true;
            }
            from = at + marker.length;
        }
        return false;
    });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function containsUploadHost(value: any, seen: Set<unknown>): boolean | 'unknown' {
    if (typeof value === 'string') {
        return value.indexOf(TEMP_UPLOAD_HOST) !== -1;
    }
    if (value == null || typeof value === 'number' || typeof value === 'boolean') {
        return false;
    }
    if (typeof value !== 'object') {
        return false;
    }
    if (seen.has(value)) {
        return false;
    }
    seen.add(value);

    if (typeof URL !== 'undefined' && value instanceof URL) {
        return value.href.indexOf(TEMP_UPLOAD_HOST) !== -1;
    }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const found = containsUploadHost(value[i], seen);
            if (found === true || found === 'unknown') {
                return found;
            }
        }
        return false;
    }

    const readableFields = ['message', 'stack', 'url', 'href', 'name'];
    for (let i = 0; i < readableFields.length; i++) {
        try {
            const field = value[readableFields[i]];
            if (typeof field === 'string' && field.indexOf(TEMP_UPLOAD_HOST) !== -1) {
                return true;
            }
        } catch (err) {
            return 'unknown';
        }
    }

    let keys: string[];
    try {
        keys = Object.keys(value);
    } catch (err) {
        return 'unknown';
    }

    for (let i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(TEMP_UPLOAD_HOST) !== -1) {
            return true;
        }
        try {
            const found = containsUploadHost(value[keys[i]], seen);
            if (found === true || found === 'unknown') {
                return found;
            }
        } catch (err) {
            return 'unknown';
        }
    }

    return false;
}

function redactValue(value: any, seen: Set<unknown>): Redaction {
    if (typeof value === 'string') {
        return redactEmbeddedText(value);
    }
    if (value == null || typeof value === 'number' || typeof value === 'boolean') {
        return { value, changed: false, unsafe: false };
    }
    if (typeof value !== 'object') {
        return { value, changed: false, unsafe: false };
    }
    if (seen.has(value)) {
        return { value, changed: false, unsafe: true };
    }

    if (!Array.isArray(value) && !isPlainObject(value)) {
        const found = containsUploadHost(value, new Set());
        return { value, changed: false, unsafe: found === true || found === 'unknown' };
    }

    seen.add(value);

    if (Array.isArray(value)) {
        const copy = [];
        let changed = false;
        for (let i = 0; i < value.length; i++) {
            const result = redactValue(value[i], seen);
            if (result.unsafe) {
                return { value, changed: false, unsafe: true };
            }
            copy.push(result.value);
            if (result.changed) {
                changed = true;
            }
        }
        return { value: changed ? copy : value, changed, unsafe: false };
    }

    const copy: Record<string, unknown> = {};
    let changed = false;
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        const keyResult = redactEmbeddedText(keys[i]);
        if (keyResult.unsafe) {
            return { value, changed: false, unsafe: true };
        }
        const result = redactValue(value[keys[i]], seen);
        if (result.unsafe) {
            return { value, changed: false, unsafe: true };
        }
        copy[keyResult.value] = result.value;
        if (keyResult.changed || result.changed) {
            changed = true;
        }
    }

    return { value: changed ? copy : value, changed, unsafe: false };
}

function redactTelemetryValue<T>(value: T): T | null {
    const redacted = redactValue(value, new Set());
    if (redacted.unsafe) {
        return null;
    }
    return redacted.changed ? redacted.value as T : value;
}

/**
 * Breadcrumbs integration stores the XHR URL. Redact presigned query values
 * and keep method/status. Returns null when a signed URL cannot be removed safely.
 */
export function redactPresignedUploadBreadcrumb(breadcrumb: any): any {
    if (!breadcrumb) {
        return breadcrumb;
    }

    let message = breadcrumb.message;
    let changed = false;

    if (typeof message === 'string') {
        const redactedMessage = redactEmbeddedText(message);
        if (redactedMessage.unsafe) {
            return null;
        }
        if (redactedMessage.changed) {
            message = redactedMessage.value;
            changed = true;
        }
    }

    let data = breadcrumb.data;
    if (data && typeof data === 'object') {
        const redactedData = redactValue(data, new Set());
        if (redactedData.unsafe) {
            return null;
        }
        if (redactedData.changed) {
            data = redactedData.value;
            changed = true;
        }
    }

    if (!changed) {
        return breadcrumb;
    }

    return {
        ...breadcrumb,
        message,
        data
    };
}

/** Tracing span. Returning null drops that span from the transaction. */
export function redactPresignedUploadSpan(span: any): any {
    if (!span) {
        return span;
    }
    return redactTelemetryValue(span);
}

/**
 * Transaction events still used when the SDK emits a whole transaction.
 * Returning null drops the transaction.
 */
export function redactPresignedUploadTransaction(event: any): any {
    if (!event) {
        return event;
    }
    return redactTelemetryValue(event);
}

/**
 * Replay custom events carry fetch/XHR performance entries and breadcrumbs.
 * rrweb DOM events are not type 5 and are returned unchanged.
 * Returning null drops only that recording event.
 */
export function redactPresignedReplayEvent(event: any): any {
    if (!event || event.type !== 5) {
        return event;
    }
    return redactTelemetryValue(event);
}
