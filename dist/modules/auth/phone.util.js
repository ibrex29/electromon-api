"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhoneNumber = normalizePhoneNumber;
exports.phoneLookupCandidates = phoneLookupCandidates;
function normalizePhoneNumber(input) {
    if (!input)
        return null;
    const digits = input.replace(/[^\d+]/g, '');
    if (!digits)
        return null;
    let normalized = digits;
    if (normalized.startsWith('+')) {
        normalized = `+${normalized.slice(1).replace(/\D/g, '')}`;
    }
    else {
        const onlyDigits = normalized.replace(/\D/g, '');
        if (onlyDigits.startsWith('234') && onlyDigits.length >= 13) {
            normalized = `+${onlyDigits}`;
        }
        else if (onlyDigits.startsWith('0') && onlyDigits.length === 11) {
            normalized = `+234${onlyDigits.slice(1)}`;
        }
        else if (onlyDigits.length === 10) {
            normalized = `+234${onlyDigits}`;
        }
        else if (onlyDigits.length >= 11) {
            normalized = `+${onlyDigits}`;
        }
        else {
            return null;
        }
    }
    if (!/^\+234\d{10}$/.test(normalized)) {
        if (!/^\+\d{10,15}$/.test(normalized)) {
            return null;
        }
    }
    return normalized;
}
function phoneLookupCandidates(input) {
    const primary = normalizePhoneNumber(input);
    const candidates = new Set();
    if (primary)
        candidates.add(primary);
    const digits = input.replace(/\D/g, '');
    if (digits) {
        if (digits.startsWith('234'))
            candidates.add(`+${digits}`);
        if (digits.startsWith('0') && digits.length === 11)
            candidates.add(`+234${digits.slice(1)}`);
        if (digits.length === 10)
            candidates.add(`+234${digits}`);
        candidates.add(digits);
        if (digits.startsWith('234'))
            candidates.add(digits);
    }
    return [...candidates];
}
//# sourceMappingURL=phone.util.js.map