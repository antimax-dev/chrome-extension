import { Chat, Messenger } from './scripts/chat.js';
import { loadProfiles, createDefaultProfile } from './scripts/load_profiles.js';
import { saveProfiles } from './scripts/save_profiles.js';
import { ProfileManager } from './scripts/profile_manager.js';
import { Crypto } from './scripts/crypto.js';

/* =============================================================================
 * DOM ELEMENTS
 * ============================================================================= */
const importBtnEl = document.querySelector('.import-btn');
const exportBtnEl = document.querySelector('.export-btn');
const addChatBtn = document.getElementById('addChatBtn');
const shareBtn = document.getElementById('shareBtn');

const profileSelect = document.getElementById('profileSelect');
const addProfileBtn = document.getElementById('addProfileBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');

const importModal = document.getElementById('importModal');
const importCodeInput = document.getElementById('importCode');
const importFileInput = document.getElementById('importFile');
const importError = document.getElementById('importError');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const closeImportBtn = document.getElementById('closeImportBtn');

const exportModal = document.getElementById('exportModal');
const saveExportFileBtn = document.getElementById('saveExportFileBtn');
const closeExportBtn = document.getElementById('closeExportBtn');
const qrContainer = document.getElementById('qrContainer');
const exportPasswordEl = document.getElementById('exportPassword');

const chatModal = document.getElementById('chatModal');
const chatModalTitle = document.getElementById('chatModalTitle');
const chatForm = document.getElementById('chatForm');
const chatNameInput = document.getElementById('chatName');
const chatKeyInput = document.getElementById('chatKey');
const chatMessengerSelect = document.getElementById('chatMessenger');
const chatMessengerIdInput = document.getElementById('chatMessengerId');
const messengerIdGroup = document.getElementById('messengerIdGroup');
const chatError = document.getElementById('chatError');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatsList = document.getElementById('chatsList');

const deleteModal = document.getElementById('deleteModal');
const deleteError = document.getElementById('deleteError');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const closeDeleteBtn = document.getElementById('closeDeleteBtn');

const profileModal = document.getElementById('profileModal');
const profileModalTitle = document.getElementById('profileModalTitle');
const profileForm = document.getElementById('profileForm');
const profileNameInput = document.getElementById('profileName');
const profileError = document.getElementById('profileError');
const closeProfileBtn = document.getElementById('closeProfileBtn');

const encryptModal = document.getElementById('encryptModal');
const decryptModal = document.getElementById('decryptModal');
const encryptTextarea = document.querySelector('#encryptModal .modal-textarea');
const decryptTextarea = document.querySelector('#decryptModal .modal-textarea');
const encryptError = document.getElementById('encryptError');
const encryptAndCopyBtn = document.getElementById('encryptAndCopyBtn');
const closeEncryptBtn = document.getElementById('closeEncryptBtn');
const closeDecryptBtn = document.getElementById('closeDecryptBtn');

const chatAutoEncryptionEl = document.getElementById('chatAutoEncryption');

/* ===== SHARE PUBLIC KEY — DOM ===== */
const shareModal = document.getElementById('shareModal');
const shareKeyText = document.getElementById('shareKeyText');
const shareQrContainer = document.getElementById('shareQrContainer');
const copyShareKeyBtn = document.getElementById('copyShareKeyBtn');
const closeShareBtn = document.getElementById('closeShareBtn');
const shareFeedback = document.getElementById('shareFeedback');

/* =============================================================================
 * STATE MANAGEMENT
 * ============================================================================= */
let currentProfileManager = null;
let editingChatIndex = null;
let deletingChatIndex = null;
let encryptingChatIndex = null;
let decryptingChatIndex = null;
let editingProfileIndex = null;
const cryptoInstance = new Crypto();

let currentExportPassword = null;
let currentExportEncryptedData = null;

/* =============================================================================
 * PASSWORD & CRYPTO UTILITIES FOR IMPORT/EXPORT
 * ============================================================================= */
function generatePassword(length = 30) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

async function deriveKey(password, salt, usage) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const baseKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']);
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

async function encryptData(data, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, 'encrypt');
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...result));
}

async function decryptData(base64Data, password) {
  // Валидация Base64 перед декодированием
  if (typeof base64Data !== 'string' || base64Data.length === 0) {
    throw new Error('Пустые входные данные');
  }
  if (base64Data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    throw new Error('Невалидный данные для дешифрования');
  }

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  if (bytes.length < 28) {
    throw new Error('Файл слишком мал или повреждён');
  }

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const encrypted = bytes.slice(28);
  const key = await deriveKey(password, salt, 'decrypt');
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

function renderQR(text, container = qrContainer) {
  if (typeof qrcode !== 'function') {
    container.innerHTML = '<p style="color:#d32f2f;">QR-библиотека не загружена</p>';
    return;
  }
  try {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    container.innerHTML = qr.createImgTag(3, 4);
  } catch (e) {
    container.innerHTML = '<p style="color:#d32f2f;">Не удалось создать QR-код</p>';
  }
}

function downloadEncryptedFile(base64Data) {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const a = document.createElement('a');
  a.href = url;
  a.download = `antimax-export-${timestamp}.bin`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =============================================================================
 * MODAL MANAGEMENT
 * ============================================================================= */
function openImportModal() { importModal.classList.add('open'); importError.textContent = ''; importCodeInput.value = ''; importFileInput.value = ''; importCodeInput.focus(); }
function closeImportModal() { importModal.classList.remove('open'); importError.textContent = ''; importCodeInput.value = ''; importFileInput.value = ''; }
function closeExportModal() { exportModal.classList.remove('open'); qrContainer.innerHTML = ''; exportPasswordEl.textContent = ''; currentExportPassword = null; currentExportEncryptedData = null; }
function openEncryptModal(chatIndex) { encryptingChatIndex = chatIndex; encryptError.textContent = ''; encryptError.style.color = ''; encryptTextarea.value = ''; encryptModal.classList.add('open'); encryptTextarea.focus(); }
function closeEncryptModal() { encryptModal.classList.remove('open'); encryptError.textContent = ''; encryptingChatIndex = null; }
function openDecryptModal(chatIndex) { decryptingChatIndex = chatIndex; decryptFromClipboard(); }
function closeDecryptModal() { decryptModal.classList.remove('open'); decryptingChatIndex = null; }

/* ===== SHARE PUBLIC KEY — MODAL ===== */
async function openShareModal() {
  shareFeedback.textContent = '';
  shareFeedback.style.color = '';
  shareKeyText.value = '';
  shareQrContainer.innerHTML = '';

  try {
    const profile = currentProfileManager.getCurrentProfile();
    if (!profile) {
      shareFeedback.textContent = 'Профиль не найден';
      shareFeedback.style.color = '#d32f2f';
      shareModal.classList.add('open');
      return;
    }

    if (!profile.publicKey || !profile.privateKey) {
      await profile.generateKeys(cryptoInstance);
      await saveProfiles(currentProfileManager);
    }

    shareKeyText.value = profile.publicKey;
    renderQR(profile.publicKey, shareQrContainer);
  } catch (err) {
    shareFeedback.textContent = 'Ошибка подготовки ключа';
    shareFeedback.style.color = '#d32f2f';
  }

  shareModal.classList.add('open');
}

function closeShareModal() {
  shareModal.classList.remove('open');
  shareKeyText.value = '';
  shareQrContainer.innerHTML = '';
  shareFeedback.textContent = '';
}

async function copyShareKey() {
  const key = shareKeyText.value;
  if (!key) return;

  try {
    await navigator.clipboard.writeText(key);
    shareFeedback.textContent = '✓ Ключ скопирован в буфер обмена';
    shareFeedback.style.color = '#2e7d32';
    setTimeout(() => {
      shareFeedback.textContent = '';
      shareFeedback.style.color = '';
    }, 2500);
  } catch (err) {
    shareKeyText.select();
    try {
      document.execCommand('copy');
      shareFeedback.textContent = '✓ Ключ скопирован';
      shareFeedback.style.color = '#2e7d32';
    } catch (e) {
      shareFeedback.textContent = 'Не удалось скопировать. Выделите текст вручную.';
      shareFeedback.style.color = '#d32f2f';
    }
  }
}

function closeAllMods() {
  closeImportModal();
  closeExportModal();
  closeEncryptModal();
  closeDecryptModal();
  closeProfileModal();
  closeShareModal();
}

function handleEscapeKey(e) { if (e.key === 'Escape') closeAllMods(); }

function handleOverlayClick(e, modalId) {
  const modal = document.getElementById(modalId);
  if (modal && e.target === modal) {
    if (modalId === 'importModal') closeImportModal();
    else if (modalId === 'exportModal') closeExportModal();
    else if (modalId === 'encryptModal') closeEncryptModal();
    else if (modalId === 'decryptModal') closeDecryptModal();
    else if (modalId === 'profileModal') closeProfileModal();
    else if (modalId === 'shareModal') closeShareModal();
  }
}

/* =============================================================================
 * IMPORT/EXPORT
 * ============================================================================= */
async function handleImport() {
  importError.textContent = '';
  const code = importCodeInput.value.trim();
  const file = importFileInput.files[0];

  if (!code || !file) {
    importError.textContent = 'Заполните код и выберите файл';
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) binaryString += String.fromCharCode(bytes[i]);
    const base64Data = btoa(binaryString);

    const decryptedJson = await decryptData(base64Data, code);
    const parsedData = JSON.parse(decryptedJson);

    // Сначала десериализуем во временный объект, чтобы не потерять текущий менеджер при ошибке
    const tempManager = new ProfileManager();
    tempManager.deserialize(parsedData);

    currentProfileManager = tempManager;
    await saveProfiles(currentProfileManager);
    closeImportModal();
    await loadAndRenderChats();
  } catch (err) {
    // Показываем конкретную причину, если она понятна; иначе — общий текст
    const fallback = 'неверный пароль или повреждённый файл';
    const detail = (err && err.message) ? err.message : '';
    importError.textContent = 'Ошибка импорта: ' + (detail || fallback);
  }
}

function handleSaveExportFile() {
  if (!currentExportEncryptedData) return closeExportModal();
  try { downloadEncryptedFile(currentExportEncryptedData); closeExportModal(); } catch (err) { closeExportModal(); }
}

async function openExportModal() {
  qrContainer.innerHTML = ''; exportPasswordEl.textContent = ''; currentExportPassword = null; currentExportEncryptedData = null;
  exportModal.classList.add('open');
  try {
    if (!currentProfileManager) throw new Error('Профили ещё не загружены');
    const serializedData = currentProfileManager.serialize();
    const jsonData = JSON.stringify(serializedData);
    const password = generatePassword(30);
    currentExportPassword = password;
    currentExportEncryptedData = await encryptData(jsonData, password);
    exportPasswordEl.textContent = password;
    renderQR(password);
  } catch (err) {
    exportPasswordEl.textContent = 'Ошибка подготовки экспорта';
    exportPasswordEl.style.color = '#d32f2f';
  }
}

/* =============================================================================
 * ENCRYPT/DECRYPT
 * ============================================================================= */
async function encryptAndCopy() {
  const plaintext = encryptTextarea.value.trim();
  if (!plaintext) { encryptError.textContent = 'Введите текст для шифрования'; encryptError.style.color = '#d32f2f'; return; }

  try {
    const profile = currentProfileManager.getCurrentProfile();
    if (!profile) throw new Error('Профиль не найден');

    if (!profile.privateKey) {
      await profile.generateKeys(cryptoInstance);
      await saveProfiles(currentProfileManager);
    }

    const chat = profile.chats[encryptingChatIndex];
    const remotePubKey = await cryptoInstance.importPublicKey(chat.key);
    const localPrivKey = await cryptoInstance.importPrivateKey(profile.privateKey);

    const sessionKey = await cryptoInstance.deriveSessionKey(localPrivKey, remotePubKey);
    const { iv, msg } = await cryptoInstance.encrypt(plaintext, sessionKey);
    const encrypted = `${iv};${msg}`;

    await navigator.clipboard.writeText(encrypted);
    encryptTextarea.value = encrypted;
    encryptError.textContent = 'Скопировано!';
    encryptError.style.color = '#2e7d32';
    setTimeout(() => { encryptError.textContent = ''; encryptError.style.color = ''; }, 3000);
  } catch (err) {
    encryptError.textContent = 'Ошибка шифрования: ' + (err.message || 'проверьте ключи');
    encryptError.style.color = '#d32f2f';
  }
}

async function decryptFromClipboard() {
  // Открываем модалку сразу, чтобы пользователь видел процесс/ошибку
  decryptTextarea.value = 'Загрузка...';
  decryptModal.classList.add('open');

  try {
    let clipboardText = '';
    try { clipboardText = await navigator.clipboard.readText(); } catch (clipErr) {
      decryptTextarea.value = '';
      alert('Не удалось прочитать буфер обмена');
      decryptModal.classList.remove('open');
      return;
    }
    if (!clipboardText) {
      decryptTextarea.value = '';
      return;
    }

    clipboardText = clipboardText.replace(/\s+/g, '');
    const parts = clipboardText.split(';');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Неверный формат шифротекста (ожидается формат через разделитель ;)');
    }
    const [ivB64, msgB64] = parts;

    const profile = currentProfileManager.getCurrentProfile();
    if (!profile) throw new Error('Профиль не найден');
    const chat = profile.chats[decryptingChatIndex];
    if (!chat || !chat.key) throw new Error('Ключ чата отсутствует');

    if (!profile.privateKey) {
      await profile.generateKeys(cryptoInstance);
      await saveProfiles(currentProfileManager);
    }

    const remotePubKey = await cryptoInstance.importPublicKey(chat.key);
    const localPrivKey = await cryptoInstance.importPrivateKey(profile.privateKey);
    const sessionKey = await cryptoInstance.deriveSessionKey(localPrivKey, remotePubKey);
    const decrypted = await cryptoInstance.decrypt(ivB64, msgB64, sessionKey);

    decryptTextarea.value = decrypted;
  } catch (err) {
    decryptTextarea.value = 'Ошибка: ' + (err.message || 'не удалось расшифровать сообщение');
  }
}

/* =============================================================================
 * GLOBAL LISTENERS
 * ============================================================================= */
importBtnEl.addEventListener('click', openImportModal);
exportBtnEl.addEventListener('click', openExportModal);
closeExportBtn.addEventListener('click', closeAllMods);
closeImportBtn.addEventListener('click', closeImportModal);
closeEncryptBtn.addEventListener('click', closeEncryptModal);
closeDecryptBtn.addEventListener('click', closeDecryptModal);
encryptAndCopyBtn.addEventListener('click', encryptAndCopy);
document.addEventListener('keydown', handleEscapeKey);

importModal.addEventListener('click', (e) => handleOverlayClick(e, 'importModal'));
exportModal.addEventListener('click', (e) => handleOverlayClick(e, 'exportModal'));
encryptModal.addEventListener('click', (e) => handleOverlayClick(e, 'encryptModal'));
decryptModal.addEventListener('click', (e) => handleOverlayClick(e, 'decryptModal'));
profileModal.addEventListener('click', (e) => handleOverlayClick(e, 'profileModal'));
shareModal.addEventListener('click', (e) => handleOverlayClick(e, 'shareModal'));

confirmImportBtn.addEventListener('click', handleImport);
saveExportFileBtn.addEventListener('click', handleSaveExportFile);

/* ===== SHARE PUBLIC KEY — LISTENERS ===== */
shareBtn.addEventListener('click', openShareModal);
closeShareBtn.addEventListener('click', closeShareModal);
copyShareKeyBtn.addEventListener('click', copyShareKey);

/* =============================================================================
 * PROFILE MANAGEMENT
 * ============================================================================= */
profileSelect.addEventListener('change', async () => {
  const selectedIndex = parseInt(profileSelect.value);
  if (!isNaN(selectedIndex)) {
    currentProfileManager.setCurrentProfile(selectedIndex);
    await saveProfiles(currentProfileManager);
    await loadAndRenderChats();
  }
});

addProfileBtn.addEventListener('click', () => openProfileModal());
editProfileBtn.addEventListener('click', () => openProfileModal(currentProfileManager.currentProfileIndex));

deleteProfileBtn.addEventListener('click', async () => {
  const profile = currentProfileManager.getCurrentProfile();
  if (!profile) return;

  if (confirm(`Удалить профиль "${profile.name}" и все его чаты?`)) {
    try {
      currentProfileManager.removeProfile(profile.name);
      if (currentProfileManager.profiles.length === 0) {
        await createDefaultProfile(currentProfileManager, cryptoInstance);
      }
      await saveProfiles(currentProfileManager);
      await loadAndRenderChats();
    } catch (err) {
      // silent — профиль не удалён, но UI не сломается
    }
  }
});

/* =============================================================================
 * PROFILE MODAL
 * ============================================================================= */
function openProfileModal(profileIndex = null) {
  profileError.textContent = ''; profileNameInput.classList.remove('input-error'); profileForm.reset();
  if (profileIndex !== null) {
    editingProfileIndex = profileIndex;
    profileModalTitle.textContent = 'Редактировать профиль';
    const profile = currentProfileManager.getProfileByIndex(profileIndex);
    if (profile) profileNameInput.value = profile.name;
  } else {
    editingProfileIndex = null;
    profileModalTitle.textContent = 'Новый профиль';
  }
  profileModal.classList.add('open'); profileNameInput.focus();
}

function closeProfileModal() { profileModal.classList.remove('open'); profileError.textContent = ''; profileNameInput.classList.remove('input-error'); editingProfileIndex = null; }
closeProfileBtn.addEventListener('click', closeProfileModal);

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await saveProfile();
});

async function saveProfile() {
  const name = profileNameInput.value.trim();
  profileNameInput.classList.remove('input-error'); profileError.textContent = '';

  if (!name) { profileNameInput.classList.add('input-error'); profileError.textContent = 'Введите имя профиля'; return; }
  if (name.length > 16) { profileNameInput.classList.add('input-error'); profileError.textContent = 'Имя профиля не должно превышать 16 символов'; return; }

  try {
    if (editingProfileIndex !== null) {
      const oldProfile = currentProfileManager.getProfileByIndex(editingProfileIndex);
      if (!oldProfile) { profileError.textContent = 'Профиль не найден'; return; }

      const duplicateExists = currentProfileManager.profiles.some((p, idx) => idx !== editingProfileIndex && p.name.toLowerCase() === name.toLowerCase());
      if (duplicateExists) { profileNameInput.classList.add('input-error'); profileError.textContent = 'Профиль с таким именем уже существует'; return; }
      oldProfile.name = name;
    } else {
      const duplicateExists = currentProfileManager.getProfile(name);
      if (duplicateExists) { profileNameInput.classList.add('input-error'); profileError.textContent = 'Профиль с таким именем уже существует'; return; }

      const newProfile = currentProfileManager.addProfile(name);
      await newProfile.generateKeys(cryptoInstance);
      currentProfileManager.setCurrentProfile(currentProfileManager.profiles.length - 1);
    }

    await saveProfiles(currentProfileManager);
    closeProfileModal();
    await loadAndRenderChats();
  } catch (err) { profileError.textContent = err.message; }
}

/* =============================================================================
 * CHAT MANAGEMENT
 * ============================================================================= */
addChatBtn.addEventListener('click', () => openChatModal());
closeChatBtn.addEventListener('click', closeChatModal);
chatModal.addEventListener('click', (e) => { if (e.target === chatModal) closeChatModal(); });
chatMessengerSelect.addEventListener('change', () => {
  const messenger = chatMessengerSelect.value;
  messengerIdGroup.style.display = messenger ? 'block' : 'none';
  if (!messenger) { chatMessengerIdInput.required = false; chatMessengerIdInput.value = ''; }
});
chatForm.addEventListener('submit', async (e) => { e.preventDefault(); await saveChat(); });
closeDeleteBtn.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });
confirmDeleteBtn.addEventListener('click', deleteChat);

function openChatModal(chatIndex = null) {
  chatError.textContent = '';
  chatForm.reset();
  chatNameInput.classList.remove('input-error');
  chatKeyInput.classList.remove('input-error');
  chatMessengerIdInput.classList.remove('input-error');
  if (chatIndex !== null) {
    editingChatIndex = chatIndex;
    chatModalTitle.textContent = 'Редактировать чат';
    const profile = currentProfileManager.getCurrentProfile();
    if (profile && profile.chats[chatIndex]) {
      const chat = profile.chats[chatIndex];
      chatNameInput.value = chat.name;
      chatKeyInput.value = chat.key;
      chatMessengerSelect.value = chat.messenger || '';
      chatAutoEncryptionEl.checked = chat.autoEncryption ?? true;
      if (chat.messenger) {
        messengerIdGroup.style.display = 'block';
        chatMessengerIdInput.value = chat.messengerId || '';
      } else {
        messengerIdGroup.style.display = 'none';
      }
    }
  } else {
    editingChatIndex = null;
    chatModalTitle.textContent = 'Добавить чат';
    messengerIdGroup.style.display = 'none';
    chatAutoEncryptionEl.checked = true;
  }
  chatModal.classList.add('open');
  chatNameInput.focus();
}
function closeChatModal() { chatModal.classList.remove('open'); chatError.textContent = ''; editingChatIndex = null; }

function openDeleteModal(chatIndex) { deletingChatIndex = chatIndex; deleteError.textContent = ''; deleteModal.classList.add('open'); }
function closeDeleteModal() { deleteModal.classList.remove('open'); deleteError.textContent = ''; deletingChatIndex = null; }

async function deleteChat() {
  if (deletingChatIndex === null) return;
  try {
    const profile = currentProfileManager.getCurrentProfile();
    if (!profile) { deleteError.textContent = 'Текущий профиль не найден'; return; }
    profile.chats.splice(deletingChatIndex, 1);
    await saveProfiles(currentProfileManager);
    closeDeleteModal();
    await loadAndRenderChats();
  } catch (err) { deleteError.textContent = err.message; }
}

async function saveChat() {
  const name = chatNameInput.value.trim();
  const key = chatKeyInput.value.trim();
  const messenger = chatMessengerSelect.value || null;
  const messengerId = messenger ? chatMessengerIdInput.value.trim() : null;
  const autoEncryption = chatAutoEncryptionEl.checked;

  [chatNameInput, chatKeyInput, chatMessengerIdInput].forEach(el => el.classList.remove('input-error'));
  chatError.textContent = '';

  if (!name) chatNameInput.classList.add('input-error');
  if (!key) chatKeyInput.classList.add('input-error');
  if (messenger && !messengerId) chatMessengerIdInput.classList.add('input-error');
  if (!name || !key || (messenger && !messengerId)) return;

  // Валидация публичного ключа ДО сохранения — чтобы не сохранять мусор
  try {
    await cryptoInstance.importPublicKey(key);
  } catch (err) {
    chatKeyInput.classList.add('input-error');
    chatError.textContent = 'Невалидный ключ';
    return;
  }

  try {
    const profile = currentProfileManager.getCurrentProfile();
    if (!profile) { chatError.textContent = 'Текущий профиль не найден'; return; }

    if (editingChatIndex !== null) {
      if (!profile.updateChat(
        profile.chats[editingChatIndex].name,
        name, key, messenger, messengerId, autoEncryption
      )) {
        chatNameInput.classList.add('input-error');
        chatError.textContent = 'Чат с таким именем уже существует';
        return;
      }
    } else {
      if (profile.chats.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        chatNameInput.classList.add('input-error');
        chatError.textContent = 'Чат с таким именем уже существует';
        return;
      }
      profile.addChat(new Chat(name, key, messenger, messengerId, autoEncryption));
    }

    await saveProfiles(currentProfileManager);
    closeChatModal();
    await loadAndRenderChats();
  } catch (err) {
    chatError.textContent = err.message;
  }
}

/* =============================================================================
 * UI & INIT
 * ============================================================================= */
function updateProfileSelect() {
  const profiles = currentProfileManager.listProfiles();
  const currentIndex = currentProfileManager.currentProfileIndex;
  profileSelect.innerHTML = '';
  profiles.forEach((name, index) => {
    const option = document.createElement('option');
    option.value = index; option.textContent = name; option.selected = (index === currentIndex);
    profileSelect.appendChild(option);
  });
}

function createChatCard(chat, index) {
  const card = document.createElement('div');
  card.className = 'chat-card';

  const icon = document.createElement('div');
  icon.className = 'chat-icon';

  if (chat.messenger === Messenger.vk) {
    icon.classList.add('chat-icon-vk');
    icon.textContent = 'VK';
  } else if (chat.messenger === Messenger.max) {
    icon.classList.add('chat-icon-max');
    icon.textContent = 'MAX';
  } else if (chat.messenger === Messenger.tg) {
    icon.classList.add('chat-icon-tg');
    icon.textContent = 'TG';
  } else {
    icon.classList.add('chat-icon-default');
    icon.textContent = '💬';
  }

  const info = document.createElement('div');
  info.className = 'chat-info';

  const name = document.createElement('div');
  name.className = 'chat-name';
  name.textContent = chat.name;
  info.appendChild(name);

  if (chat.messenger && chat.messengerId) {
    const mInfo = document.createElement('div');
    mInfo.className = 'chat-messenger';
    mInfo.textContent = `${chat.messenger.toUpperCase()}: ${chat.messengerId}`;
    info.appendChild(mInfo);
  }

  const actions = document.createElement('div');
  actions.className = 'chat-actions';

  const makeBtn = (cls, text, title, handler) => {
    const b = document.createElement('button');
    b.className = `chat-action-btn ${cls}`;
    b.textContent = text;
    b.title = title;
    b.addEventListener('click', handler);
    return b;
  };

  actions.appendChild(makeBtn('encrypt-btn', '🔐', 'Зашифровать сообщение', (e) => {
    e.stopPropagation();
    openEncryptModal(index);
    e.currentTarget.blur();
  }));

  actions.appendChild(makeBtn('decrypt-btn', '🔓', 'Расшифровать сообщение', (e) => {
    e.stopPropagation();
    openDecryptModal(index);
    e.currentTarget.blur();
  }));

  actions.appendChild(makeBtn('edit-btn', '✏️', 'Редактировать', () => openChatModal(index)));
  actions.appendChild(makeBtn('delete-btn', '🗑️', 'Удалить', () => openDeleteModal(index)));

  card.append(icon, info, actions);
  return card;
}

async function loadAndRenderChats() {
  try {
    currentProfileManager = await loadProfiles(cryptoInstance);
    const profile = currentProfileManager.getCurrentProfile();
    updateProfileSelect();

    if (!profile) { chatsList.innerHTML = '<p class="no-chats">Нет доступных профилей</p>'; return; }
    if (profile.chats.length === 0) { chatsList.innerHTML = '<p class="no-chats">Нет чатов. Добавьте первый чат!</p>'; return; }

    chatsList.innerHTML = '';
    profile.chats.forEach((chat, index) => chatsList.appendChild(createChatCard(chat, index)));
  } catch (err) { chatsList.innerHTML = '<p class="no-chats error">Ошибка загрузки чатов</p>'; }
}

document.addEventListener('DOMContentLoaded', loadAndRenderChats);