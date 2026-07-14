import { Profile } from './profile.js';

export class ProfileManager {
    constructor() {
        this.profiles = [];
        this.currentProfileIndex = 0;
    }

    addProfile(name, publicKey = '', privateKey = '') {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Имя профиля должно быть непустой строкой');
        }
        const normalized = name.trim();
        if (this.getProfile(normalized)) {
            throw new Error(`Профиль "${normalized}" уже существует`);
        }
        const profile = new Profile(normalized, publicKey, privateKey);
        this.profiles.push(profile);
        return profile;
    }

    removeProfile(name) {
        const index = this.profiles.findIndex(p => p.name === name);
        if (index === -1) {
            throw new Error(`Профиль "${name}" не найден`);
        }
        this.profiles.splice(index, 1);
        if (this.currentProfileIndex >= this.profiles.length) {
            this.currentProfileIndex = Math.max(0, this.profiles.length - 1);
        }
    }

    getProfile(name) {
        return this.profiles.find(p => p.name === name) ?? null;
    }

    getProfileByIndex(index) {
        if (index < 0 || index >= this.profiles.length) return null;
        return this.profiles[index];
    }

    getCurrentProfile() {
        return this.getProfileByIndex(this.currentProfileIndex);
    }

    setCurrentProfile(index) {
        if (index < 0 || index >= this.profiles.length) {
            throw new Error(`Индекс профиля ${index} выходит за границы [0, ${this.profiles.length - 1}]`);
        }
        this.currentProfileIndex = index;
    }

    listProfiles() {
        return this.profiles.map(p => p.name);
    }

    deserialize(data) {
        if (!data || typeof data !== 'object') throw new Error('Данные ProfileManager должны быть объектом');
        if (!Array.isArray(data.profiles)) throw new Error('profiles должен быть массивом');

        this.profiles = [];
        this.currentProfileIndex = 0;
        if (typeof data.currentProfileIndex === 'number') {
            this.currentProfileIndex = data.currentProfileIndex;
        }

        for (let i = 0; i < data.profiles.length; i++) {
            try {
                const profile = new Profile('');
                profile.deserialize(data.profiles[i]);
                const existingIndex = this.profiles.findIndex(p => p.name === profile.name);
                if (existingIndex !== -1) {
                    this.profiles[existingIndex] = profile;
                } else {
                    this.profiles.push(profile);
                }
            } catch (err) {
                throw new Error(`Не удалось загрузить профиль #${i}: ${err.message}`);
            }
        }

        if (this.currentProfileIndex >= this.profiles.length) {
            this.currentProfileIndex = Math.max(0, this.profiles.length - 1);
        }
    }

    serialize() {
        return {
            profiles: this.profiles.map(p => p.serialize()),
            currentProfileIndex: this.currentProfileIndex
        };
    }
}