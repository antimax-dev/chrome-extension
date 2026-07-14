import { ProfileManager } from './profile_manager.js';

/**
 * Получает текущий профиль из ProfileManager.
 * @param {ProfileManager} profileManager
 * @returns {Object|null} Текущий профиль или null если нет профилей.
 */
function getCurrentProfile(profileManager) {
    return profileManager.getCurrentProfile();
}

/**
 * Меняет текущий профиль по индексу.
 * @param {ProfileManager} profileManager
 * @param {number} index - Индекс профиля для установки как текущего.
 * @throws {Error} Если индекс выходит за границы.
 */
function setCurrentProfile(profileManager, index) {
    profileManager.setCurrentProfile(index);
}

export { getCurrentProfile, setCurrentProfile };
