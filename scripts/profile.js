import { Chat, Messenger } from './chat.js';

export class Profile {
    constructor(name, publicKey = '', privateKey = '') {
        this.name = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.chats = [];
    }

    async generateKeys(cryptoInstance) {
        const keys = await cryptoInstance.generateKeys();
        this.publicKey = await cryptoInstance.exportPublicKey(keys.publicKey);
        this.privateKey = await cryptoInstance.exportPrivateKey(keys.privateKey);
    }

    deserialize(profileData) {
        if (typeof profileData.name !== 'string' || !profileData.name) {
            throw new Error('Profile name must be a non-empty string');
        }
        if (!Array.isArray(profileData.chats)) {
            throw new Error('chats must be an array');
        }

        this.name = profileData.name;
        this.publicKey = profileData.publicKey ?? '';
        this.privateKey = profileData.privateKey ?? '';

        for (let i = 0; i < profileData.chats.length; i++) {
            const data = profileData.chats[i];
            if (typeof data.name !== 'string' || !data.name) throw new Error(`Chat #${i}: name must be a non-empty string`);
            if (typeof data.key !== 'string' || !data.key) throw new Error(`Chat #${i}: key must be a non-empty string`);

            const messenger = data.messenger;
            const messengerId = data.messengerId;

            if (messenger !== null && (messengerId === null || messengerId === '')) {
                throw new Error(`Chat #${i}: messenger is "${messenger}" but messengerId is missing or empty`);
            }
            if (messenger === null && messengerId !== null) {
                throw new Error(`Chat #${i}: messenger is null but messengerId is set (${messengerId})`);
            }
        }

        this.chats = profileData.chats.map(data => new Chat(
            data.name,
            data.key,
            data.messenger ?? null,
            data.messengerId ?? null,
            data.autoEncryption ?? true  // ← обратная совместимость
        ));
    }

    serialize() {
        return {
            name: this.name,
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            chats: this.chats.map(chat => ({
                name: chat.name,
                key: chat.key,
                messenger: chat.messenger,
                messengerId: chat.messengerId,
                autoEncryption: chat.autoEncryption
            }))
        };
    }

    addChat(chat) {
        if (chat instanceof Chat) {
            this.chats.push(chat);
        } else {
            throw new Error('Argument must be an instance of Chat');
        }
    }

    updateChat(oldName, newName, key, messenger, messengerId, autoEncryption = true) {
        const chatIndex = this.chats.findIndex(chat => chat.name === oldName);
        if (chatIndex === -1) return false;

        const duplicateExists = this.chats.some((chat, idx) =>
            idx !== chatIndex && chat.name.toLowerCase() === newName.toLowerCase()
        );
        if (duplicateExists) return false;

        this.chats[chatIndex].update(newName, key, messenger, messengerId, autoEncryption);
        return true;
    }
}