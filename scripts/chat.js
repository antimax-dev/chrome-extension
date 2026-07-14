/**
 * @typedef {Object} ChatData
 * @property {string} name
 * @property {string} key
 * @property {string|null} [messenger]
 * @property {string|null} [messengerId]
 * @property {boolean} [autoEncryption]
 */

export const Messenger = {
    vk: "vk",
    max: "max",
    tg: "tg"
};

export class Chat {
    /**
     * @param {string} [name]
     * @param {string} [key]
     * @param {string|null} [messenger]
     * @param {string|null} [messengerId]
     * @param {boolean} [autoEncryption]
     */
    constructor(name = '', key = '', messenger = null, messengerId = null, autoEncryption = true) {
        /** @type {string} */
        this.name = name;

        /** @type {string} */
        this.key = key;

        /** @type {string|null} */
        this.messenger = messenger;

        /** @type {string|null} */
        this.messengerId = messengerId;

        /** @type {boolean} */
        this.autoEncryption = autoEncryption;
    }

    /**
     * @param {string} name
     * @param {string} key
     * @param {string|null} messenger
     * @param {string|null} messengerId
     * @param {boolean} [autoEncryption]
     */
    update(name, key, messenger, messengerId, autoEncryption = true) {
        if (messenger !== null && (messengerId === null || messengerId === '')) {
            throw new Error('When messenger is set, messengerId must be provided');
        }
        if (messenger === null && messengerId !== null) {
            throw new Error('messengerId cannot be set when messenger is null');
        }

        this.name = name;
        this.key = key;
        this.messenger = messenger;
        this.messengerId = messengerId;
        this.autoEncryption = autoEncryption;
    }
}