import { ProfileManager } from './profile_manager.js';

async function loadProfiles(cryptoInstance) {
    const profileManager = new ProfileManager();

    try {
        const result = await chrome.storage.local.get('data');
        const data = result['data'];

        if (!data || !data.profiles || data.profiles.length === 0) {
            await createDefaultProfile(profileManager, cryptoInstance);
            await saveToStorage(profileManager);
            return profileManager;
        }

        profileManager.deserialize(data);
    } catch (error) {
        try {
            await chrome.storage.local.clear();
            await createDefaultProfile(profileManager, cryptoInstance);
            await saveToStorage(profileManager);
        } catch (cleanupError) { }
    }

    return profileManager;
}

async function createDefaultProfile(profileManager, cryptoInstance) {
    const profile = profileManager.addProfile('Профиль 1');
    await profile.generateKeys(cryptoInstance);
}

async function createDefaultProfileForContent(profileManager) {
    const profile = profileManager.addProfile('Профиль 1');

    const keys = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveBits"]
    );

    const rawPub = await crypto.subtle.exportKey("raw", keys.publicKey);
    const rawPriv = await crypto.subtle.exportKey("pkcs8", keys.privateKey);

    profile.publicKey = btoa(String.fromCharCode(...new Uint8Array(rawPub)));
    profile.privateKey = btoa(String.fromCharCode(...new Uint8Array(rawPriv)));

    await chrome.storage.local.set({ data: profileManager.serialize() });
}

async function saveToStorage(profileManager) {
    await chrome.storage.local.set({ data: profileManager.serialize() });
}

export { loadProfiles, saveToStorage, createDefaultProfile, createDefaultProfileForContent };
