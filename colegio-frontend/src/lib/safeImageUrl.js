/**
 * Validates and re-serializes a URL so only safe schemes (blob:, https:, http:)
 * can reach the DOM. Using parsed.href (not the original string) breaks
 * CodeQL's taint chain from user-controlled input to img.src.
 *
 * @param {string} url
 * @returns {string} The safe URL, or an empty string for disallowed schemes.
 */
export function safeImageUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'blob:' || parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return parsed.href;
        }
    } catch {
        // Relative URL or invalid — not safe to use as img src
    }
    return '';
}
