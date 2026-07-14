import { ProfileManager } from './profile_manager.js';

/**
 * Сохраняет профили из ProfileManager в chrome.storage.local.
 * @param {ProfileManager} profileManager
 */
async function saveProfiles(profileManager) {
    await chrome.storage.local.set({ data: profileManager.serialize() });
}

export { saveProfiles };
