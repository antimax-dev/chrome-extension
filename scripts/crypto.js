/**
 * Converts a UTF-8 string to Base64 encoding.
 * Works in browsers where `btoa` supports Unicode via `encodeURIComponent`.
 *
 * @param {string} str - The UTF-8 string to encode.
 * @returns {string} Base64-encoded string.
 */
function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decodes a Base64 string back to UTF-8.
 * Reverses `utf8ToBase64`, using `decodeURIComponent` and `escape`.
 *
 * @param {string} base64 - The Base64-encoded string to decode.
 * @returns {string} Original UTF-8 string.
 */
function base64ToUtf8(base64) {
    return decodeURIComponent(escape(atob(base64)));
}

/**
 * Проверяет, является ли строка валидным Base64 (стандарт RFC 4648).
 * Пустая строка считается невалидной.
 *
 * @param {string} str
 * @returns {boolean}
 */
function isValidBase64(str) {
    if (typeof str !== 'string' || str.length === 0) return false;
    if (str.length % 4 !== 0) return false;
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) return false;
    return true;
}

/**
 * Безопасно декодирует Base64 → Uint8Array с понятной ошибкой.
 *
 * @param {string} base64
 * @param {string} label - описание поля (для сообщения об ошибке)
 * @returns {Uint8Array}
 * @throws {Error} если строка не является валидным Base64
 */
function decodeBase64(base64, label) {
    if (!isValidBase64(base64)) {
        throw new Error(`Невалидный Base64 в поле "${label}"`);
    }
    try {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    } catch (e) {
        throw new Error(`Не удалось декодировать Base64 в поле "${label}"`);
    }
}

/**
 * A wrapper class for cryptographic operations using Web Crypto API.
 * Supports ECDH key generation, key exchange, and AES-GCM encryption/decryption.
 */
export class Crypto {
    /**
     * Creates a new Crypto instance.
     * Verifies the availability of the Web Crypto API (`crypto.subtle`).
     *
     * @throws {Error} if `crypto.subtle` is not supported by the environment.
     */
    constructor() {
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            throw new Error("Web Crypto API (crypto.subtle) not found.");
        }
    }

    /**
     * Generates a new ECDH key pair using the P-256 (secp256r1) curve.
     *
     * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey}>} A promise resolving to the key pair.
     */
    async generateKeys() {
        const keys = await crypto.subtle.generateKey(
            { name: "ECDH", namedCurve: "P-256" },
            true,
            ["deriveBits"]
        );
        return keys;
    }

    /**
     * Exports a public key in raw format and encodes it as Base64.
     *
     * @param {CryptoKey} key - The public CryptoKey to export.
     * @returns {Promise<string>} Base64-encoded raw public key.
     */
    async exportPublicKey(key) {
        const raw = await crypto.subtle.exportKey("raw", key);
        return btoa(String.fromCharCode(...new Uint8Array(raw)));
    }

    /**
     * Exports a private key in PKCS#8 format and encodes it as Base64.
     *
     * @param {CryptoKey} key - The private CryptoKey to export.
     * @returns {Promise<string>} Base64-encoded PKCS#8 private key.
     */
    async exportPrivateKey(key) {
        const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
        return btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
    }

    /**
     * Imports a private key from Base64-encoded PKCS#8 data.
     *
     * @param {string} base64 - Base64-encoded PKCS#8 private key.
     * @returns {Promise<CryptoKey>} A CryptoKey instance for private key operations.
     * @throws {Error} если Base64 невалиден, ключ повреждён или не соответствует P-256.
     */
    async importPrivateKey(base64) {
        const pkcs8 = decodeBase64(base64, 'privateKey');

        // PKCS#8 для P-256 обычно ~138 байт; меньше 100 — явно повреждён
        if (pkcs8.length < 100) {
            throw new Error('Приватный ключ слишком короткий (повреждён)');
        }

        try {
            return await crypto.subtle.importKey(
                "pkcs8",
                pkcs8,
                { name: "ECDH", namedCurve: "P-256" },
                true,
                ["deriveBits"]
            );
        } catch (e) {
            throw new Error('Не удалось импортировать приватный ключ: неверный формат или кривая');
        }
    }

    /**
     * Imports a public key from Base64-encoded raw format.
     *
     * @param {string} base64 - Base64-encoded raw public key.
     * @returns {Promise<CryptoKey>} A CryptoKey instance for public key operations.
     * @throws {Error} если Base64 невалиден, длина не 65 байт или точка не на кривой P-256.
     */
    async importPublicKey(base64) {
        const raw = decodeBase64(base64, 'publicKey');

        // Для P-256 uncompressed public key ВСЕГДА 65 байт (0x04 + 32 + 32)
        if (raw.length !== 65) {
            throw new Error(
                `Неверная длина публичного ключа: ожидалось 65 байт, получено ${raw.length}`
            );
        }
        if (raw[0] !== 0x04) {
            throw new Error('Публичный ключ должен быть в несжатом формате (0x04)');
        }

        try {
            return await crypto.subtle.importKey(
                "raw",
                raw,
                { name: "ECDH", namedCurve: "P-256" },
                true,
                []
            );
        } catch (e) {
            throw new Error('Не удалось импортировать публичный ключ: точка не на кривой P-256');
        }
    }

    /**
     * Derives a shared session key using ECDH key agreement.
     *
     * @param {CryptoKey} privateKey - The local private key (ECDH).
     * @param {CryptoKey} publicKey - The remote public key (ECDH).
     * @returns {Promise<CryptoKey>} An AES-GCM session key derived from the shared secret.
     */
    async deriveSessionKey(privateKey, publicKey) {
        const bits = await crypto.subtle.deriveBits(
            { name: "ECDH", public: publicKey },
            privateKey,
            256
        );
        return crypto.subtle.importKey(
            "raw",
            bits,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    /**
     * Encrypts text using AES-GCM with the given session key.
     *
     * @param {string} text - The plaintext to encrypt.
     * @param {CryptoKey} key - The AES-GCM session key.
     * @returns {Promise<{iv: string, msg: string}>} An object containing:
     *   - `iv`: Base64-encoded initialization vector (12 bytes),
     *   - `msg`: Base64-encoded ciphertext.
     */
    async encrypt(text, key) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder().encode(text);

        const cipher = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc
        );

        return {
            iv: btoa(String.fromCharCode(...iv)),
            msg: btoa(String.fromCharCode(...new Uint8Array(cipher)))
        };
    }

    /**
     * Decrypts AES-GCM ciphertext using the given session key.
     *
     * @param {string} ivB64 - Base64-encoded initialization vector.
     * @param {string} msgB64 - Base64-encoded ciphertext.
     * @param {CryptoKey} key - The AES-GCM session key.
     * @returns {Promise<string>} Decrypted plaintext.
     */
    async decrypt(ivB64, msgB64, key) {
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const cipher = Uint8Array.from(atob(msgB64), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipher
        );

        return new TextDecoder().decode(decrypted);
    }
}