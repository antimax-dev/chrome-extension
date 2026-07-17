(function () {
    'use strict';

    const BUTTON_ID = 'secret-chat-unlock-button';
    const MODAL_ID = 'secret-chat-modal';
    const SECRET_INPUT_ID = 'secret-protected-input';
    const DECRYPTED_ATTR = 'data-secret-decrypted';
    const DECRYPTING_CLASS = 'secret-decrypting';
    const INVITE_MODAL_ID = 'invite-create-chat-modal';
    const INVITE_BUTTON_CLASS = 'invite-create-chat-btn';
    let inviteStylesInjected = false;

    function injectInviteStyles() {
        if (inviteStylesInjected) return;

        const style = document.createElement('style');
        style.textContent = `
        /* Общие стили для модалок на сайте */
        .secret-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            animation: secretFadeIn 0.2s ease;
        }
        
        .secret-modal-window {
            background: white;
            border-radius: 12px;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 90%;
            max-width: 420px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: secretSlideUp 0.25s ease;
        }
        
        .secret-modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 16px 0;
        }
        
        .secret-modal-title.danger {
            color: #d32f2f;
        }
        
        .secret-form-group {
            margin-bottom: 14px;
        }
        
        .secret-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #333;
            margin-bottom: 5px;
        }
        
        .secret-form-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 13px;
            font-family: inherit;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }
        
        .secret-form-input:focus {
            outline: none;
            border-color: #4C75A3;
        }
        
        .secret-form-input[readonly] {
            background: #f5f5f5;
            color: #666;
        }
        
        .secret-form-checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 500;
            color: #333;
            cursor: pointer;
        }
        
        .secret-form-checkbox-label input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
        
        .secret-modal-error {
            color: #d32f2f;
            font-size: 13px;
            margin: 10px 0;
            min-height: 16px;
        }
        
        .secret-modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 16px;
        }
        
        .secret-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            font-family: inherit;
        }
        
        .secret-btn:active {
            transform: scale(0.97);
        }
        
        .secret-btn-primary {
            background: #4C75A3;
            color: white;
        }
        
        .secret-btn-primary:hover {
            background: #5181B8;
        }
        
        .secret-btn-secondary {
            background: #f5f5f5;
            color: #666;
        }
        
        .secret-btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .secret-warning-box {
            margin-top: 16px;
            padding: 12px;
            background: #fff3f3;
            border-radius: 8px;
            border-left: 3px solid #d32f2f;
        }
        
        .secret-warning-text {
            color: #d32f2f;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
        }
        
        .secret-info-box {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            text-align: left;
        }
        
        .secret-info-box-title {
            font-size: 13px;
            color: #555;
            margin: 0 0 6px 0;
            font-weight: 600;
        }
        
        .secret-info-box-text {
            font-size: 13px;
            color: #555;
            margin: 0;
            line-height: 1.5;
        }
        
        .secret-warning-icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        
        .secret-warning-subtitle {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        
        .secret-warning-hint {
            font-size: 12px;
            color: #888;
            margin: 20px 0;
            line-height: 1.5;
        }
        
        .secret-modal-text {
            font-size: 14px;
            color: #333;
            line-height: 1.5;
            margin: 0 0 16px 0;
        }
        
        .secret-modal-text-center {
            text-align: center;
        }
        
        .secret-chat-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .secret-chat-text {
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }
        
        /* Кнопка "Создать чат" под сообщением */
        .invite-button-wrapper {
            display: block;
            margin-top: 8px;
        }
        
        .${INVITE_BUTTON_CLASS} {
            padding: 6px 12px;
            background: #4C75A3;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            font-family: inherit;
            transition: background-color 0.2s;
        }
        
        .${INVITE_BUTTON_CLASS}:hover {
            background: #5181B8;
        }
        
        @keyframes secretFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes secretSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

        document.head.appendChild(style);
        inviteStylesInjected = true;
    }

    // ============== MESSAGER & CHAT CLASSES ==============
    const Messenger = {
        vk: "vk",
        max: "max",
        tg: "tg"
    };

    class Chat {
        constructor(name = '', key = '', messenger = null, messengerId = null, autoEncryption = true) {
            this.name = name;
            this.key = key;
            this.messenger = messenger;
            this.messengerId = messengerId;
            this.autoEncryption = autoEncryption;
        }

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

    class Profile {
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
                if (typeof data.name !== 'string' || !data.name) throw new Error('Chat #' + i + ': name must be a non-empty string');
                if (typeof data.key !== 'string' || !data.key) throw new Error('Chat #' + i + ': key must be a non-empty string');
                const messenger = data.messenger;
                const messengerId = data.messengerId;
                if (messenger !== null && (messengerId === null || messengerId === '')) {
                    throw new Error('Chat #' + i + ': messenger is "' + messenger + '" but messengerId is missing or empty');
                }
                if (messenger === null && messengerId !== null) {
                    throw new Error('Chat #' + i + ': messenger is null but messengerId is set (' + messengerId + ')');
                }
            }
            this.chats = profileData.chats.map(data => new Chat(
                data.name,
                data.key,
                data.messenger ?? null,
                data.messengerId ?? null,
                data.autoEncryption ?? true
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

    class ProfileManager {
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
                throw new Error('Профиль "' + normalized + '" уже существует');
            }
            const profile = new Profile(normalized, publicKey, privateKey);
            this.profiles.push(profile);
            return profile;
        }

        removeProfile(name) {
            const index = this.profiles.findIndex(p => p.name === name);
            if (index === -1) {
                throw new Error('Профиль "' + name + '" не найден');
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
                throw new Error('Индекс профиля ' + index + ' выходит за границы [0, ' + (this.profiles.length - 1) + ']');
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
                    throw new Error('Не удалось загрузить профиль #' + i + ': ' + err.message);
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

    // ============== CRYPTO CLASS ==============
    class Crypto {
        constructor() {
            if (typeof crypto === 'undefined' || !crypto.subtle) {
                throw new Error('Web Crypto API (crypto.subtle) not found.');
            }
        }

        async generateKeys() {
            const keys = await crypto.subtle.generateKey(
                { name: "ECDH", namedCurve: "P-256" },
                true,
                ["deriveBits"]
            );
            return keys;
        }

        async exportPublicKey(key) {
            const raw = await crypto.subtle.exportKey("raw", key);
            return btoa(String.fromCharCode(...new Uint8Array(raw)));
        }

        async exportPrivateKey(key) {
            const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
            return btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
        }

        async importPrivateKey(base64) {
            const pkcs8 = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            return crypto.subtle.importKey(
                "pkcs8",
                pkcs8,
                { name: "ECDH", namedCurve: "P-256" },
                true,
                ["deriveBits"]
            );
        }

        async importPublicKey(base64) {
            const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            return crypto.subtle.importKey(
                "raw",
                raw,
                { name: "ECDH", namedCurve: "P-256" },
                true,
                []
            );
        }

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

    // ============== HELPER FUNCTIONS ==============
    function extractChatIdFromUrl() {
        const match = location.href.match(/[-]?\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    function detectMessengerFromUrl() {
        const hostname = location.hostname.toLowerCase();
        if (/^web\.telegram\.org$/i.test(hostname)) {
            return 'tg';
        }
        if (/^vk\.com$/i.test(hostname) || /^vk\.ru$/i.test(hostname) || hostname.includes('vk.com') || hostname.includes('vk.ru')) {
            return 'vk';
        }
        if (/^max\.ru$/i.test(hostname) || hostname.includes('max.ru')) {
            return 'max';
        }
        return null;
    }

    function findChatByMessengerId(profile, messenger, messengerId) {
        if (!profile || !messenger || messengerId === null) return null;
        return profile.chats.find(chat => chat.messenger === messenger && chat.messengerId === String(messengerId)) || null;
    }

    let cachedProfileManager = null;
    let cryptoInstanceForContent = null;

    async function getCurrentProfileManager() {
        if (cachedProfileManager) return cachedProfileManager;

        if (!cryptoInstanceForContent) {
            cryptoInstanceForContent = new Crypto();
        }

        const pm = new ProfileManager();
        const result = await chrome.storage.local.get('data');
        const data = result['data'];

        if (data && data.profiles) {
            try {
                pm.deserialize(data);
                cachedProfileManager = pm;
                return pm;
            } catch (e) {
                // console.error('Ошибка десериализации профилей:', e);
            }
        }

        await createDefaultProfileForContent(pm);
        cachedProfileManager = pm;
        return pm;
    }

    async function createDefaultProfileForContent(profileManager) {
        const profile = profileManager.addProfile('Профиль 1');
        await profile.generateKeys(cryptoInstanceForContent);
        await chrome.storage.local.set({ data: profileManager.serialize() });
    }

    // ============== MESSAGE DECRYPTOR ==============
    const ENCRYPTED_MSG_REGEX = /([A-Za-z0-9+/]{16,}={0,2});([A-Za-z0-9+/]{4,}={0,2})/g;

    class MessageDecryptor {
        constructor() {
            this.sessionKeyCache = new Map();
            this.processedNodes = new WeakSet();
            this.scanDebounceTimer = null;
        }

        async getSessionKey(localPrivateKey, chatPublicKey) {
            const cacheKey = chatPublicKey;
            if (this.sessionKeyCache.has(cacheKey)) {
                return this.sessionKeyCache.get(cacheKey);
            }

            const promise = (async () => {
                const remotePubKey = await cryptoInstanceForContent.importPublicKey(chatPublicKey);
                return await cryptoInstanceForContent.deriveSessionKey(localPrivateKey, remotePubKey);
            })();

            this.sessionKeyCache.set(cacheKey, promise);

            try {
                return await promise;
            } catch (err) {
                this.sessionKeyCache.delete(cacheKey);
                throw err;
            }
        }

        clearCache() {
            this.sessionKeyCache.clear();
        }

        isValidEncryptedMessage(ivB64, msgB64) {
            if (ivB64.length < 16 || ivB64.length > 24) return false;
            if (msgB64.length < 4) return false;
            const b64Regex = /^[A-Za-z0-9+/]+=*$/;
            return b64Regex.test(ivB64) && b64Regex.test(msgB64);
        }

        async processTextNode(textNode, chat) {
            if (this.processedNodes.has(textNode)) return;
            if (!textNode.parentNode) return;

            const text = textNode.nodeValue;
            if (!text) return;

            if (!text.includes(';')) return;

            ENCRYPTED_MSG_REGEX.lastIndex = 0;
            const match = ENCRYPTED_MSG_REGEX.exec(text);
            if (!match) return;

            const fullMatch = match[0];
            const ivB64 = match[1];
            const msgB64 = match[2];

            if (!this.isValidEncryptedMessage(ivB64, msgB64)) return;

            this.processedNodes.add(textNode);

            const isFullMatch = text.trim() === fullMatch;

            try {
                const localPrivKey = await cryptoInstanceForContent.importPrivateKey(
                    (await getCurrentProfileManager()).getCurrentProfile().privateKey
                );
                const sessionKey = await this.getSessionKey(localPrivKey, chat.key);
                const decrypted = await cryptoInstanceForContent.decrypt(ivB64, msgB64, sessionKey);

                if (isFullMatch) {
                    const placeholder = document.createElement('span');
                    placeholder.className = 'secret-msg-placeholder secret-msg-decrypted';
                    placeholder.textContent = '🔒 ' + decrypted;
                    placeholder.style.color = '#167A52';
                    textNode.parentNode.replaceChild(placeholder, textNode);
                } else {
                    const beforeText = text.substring(0, match.index);
                    const afterText = text.substring(match.index + fullMatch.length);

                    const fragment = document.createDocumentFragment();

                    if (beforeText) {
                        fragment.appendChild(document.createTextNode(beforeText));
                    }

                    const placeholder = document.createElement('span');
                    placeholder.className = 'secret-msg-placeholder secret-msg-decrypted';
                    placeholder.textContent = '🔒 ' + decrypted;
                    placeholder.style.color = '#167A52';
                    fragment.appendChild(placeholder);

                    if (afterText) {
                        fragment.appendChild(document.createTextNode(afterText));
                    }

                    textNode.parentNode.replaceChild(fragment, textNode);
                }
            } catch (err) {
                // console.warn('Secret Chat: decrypt failed', err);
            }
        }

        async scanDocument() {
            const profileManager = await getCurrentProfileManager();
            const profile = profileManager.getCurrentProfile();
            if (!profile || !profile.privateKey) return;

            const messenger = detectMessengerFromUrl();
            const messengerId = extractChatIdFromUrl();
            const chat = findChatByMessengerId(profile, messenger, messengerId);
            if (!chat || !chat.key) return;

            if (chat.autoEncryption === false) return;

            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const parent = node.parentNode;
                        if (!parent) return NodeFilter.FILTER_REJECT;

                        if (parent.isContentEditable || parent.closest('[contenteditable]') ||
                            parent.tagName === 'INPUT' || parent.tagName === 'TEXTAREA' ||
                            parent.closest('#' + SECRET_INPUT_ID) || parent.closest('#' + MODAL_ID)) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        const tagName = parent.tagName;
                        if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        if (this.processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) {
                textNodes.push(node);
            }

            const BATCH_SIZE = 10;
            for (let i = 0; i < textNodes.length; i += BATCH_SIZE) {
                const batch = textNodes.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(n => this.processTextNode(n, chat).catch(() => { })));
                if (i + BATCH_SIZE < textNodes.length) {
                    await new Promise(r => setTimeout(r, 0));
                }
            }
        }

        scheduleScan() {
            if (this.scanDebounceTimer) {
                clearTimeout(this.scanDebounceTimer);
            }
            this.scanDebounceTimer = setTimeout(() => {
                this.scanDocument().catch(err => { }
                    // console.warn('Secret Chat: scan failed', err)
                );
            }, 300);
        }
    }

    const messageDecryptor = new MessageDecryptor();

    // ============== LOCK SVG FUNCTIONS ==============
    function openLockSVG() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 10V8C14 5.2 15.8 3 18 3C20.8 3 22 5.2 22 8V11" stroke="#818C99" stroke-width="2.2" stroke-linecap="round"/><rect x="4" y="10" width="15" height="11" rx="3" fill="#99A2AD"/><circle cx="11.5" cy="15" r="1.7" fill="#626D7A"/></svg>`;
    }

    function closedLockSVG() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10V8C7 5.2 9.2 3 12 3C14.8 3 17 5.2 17 8V10" stroke="#2CB67D" stroke-width="2.2" stroke-linecap="round"/><rect x="4" y="10" width="15" height="11" rx="3" fill="#2CB67D"/><circle cx="11.5" cy="15" r="1.7" fill="#167A52"/></svg>`;
    }

    function resetLockIcon(element) {
        if (!element) return;
        element.classList.remove('secret-active');
        isSecretInputActive = false;
        const icon = element.querySelector('.secret-lock-icon');
        if (icon) icon.innerHTML = openLockSVG();
    }

    // ============== INVITE HANDLER ==============
    const INVITE_PATTERNS = [
        /Приглашение\s+в\s+(защищенный|секретный)\s+чат[:\s\n]+([A-Za-z0-9+/]{20,}=*)/i,
        /Invitation\s+to\s+(secure|secret)\s+chat[:\s\n]+([A-Za-z0-9+/]{20,}=*)/i,
        /Приглашение\s+в\s+(защищенный|секретный)\s+чат[:\s\n]*([A-Za-z0-9+/]{20,}=*)/i
    ];

    function extractInviteFromText(text) {
        for (const pattern of INVITE_PATTERNS) {
            const match = text.match(pattern);
            if (match && match[2]) {
                return match[2].trim();
            }
        }
        return null;
    }

    function createInviteButton(publicKey) {
        injectInviteStyles(); // ← Стили инжектим СРАЗУ при создании кнопки

        const wrapper = document.createElement('div');
        wrapper.className = 'invite-button-wrapper';

        const btn = document.createElement('button');
        btn.className = INVITE_BUTTON_CLASS;
        btn.textContent = '🔐 Создать чат';
        btn.onclick = async () => {
            const hasOurKey = await checkIfOurKeyExistsOnPage();

            if (!hasOurKey) {
                showShareProfileWarning();
                return;
            }

            openInviteModal(publicKey);
        };

        wrapper.appendChild(btn);
        return wrapper;
    }

    async function checkIfOurKeyExistsOnPage() {
        try {
            const pm = await getCurrentProfileManager();
            const profile = pm.getCurrentProfile();
            if (!profile || !profile.publicKey) return false;

            const ourKey = profile.publicKey;

            // Получаем область ТОЛЬКО текущего диалога
            const messagesArea = currentAdapter ? currentAdapter.getMessagesArea() : null;
            if (!messagesArea) return false;

            // Ищем элементы ТОЛЬКО в области сообщений
            const allElements = messagesArea.querySelectorAll('div, span, p, li, td, a');

            for (const el of allElements) {
                // Пропускаем наши собственные элементы
                if (el.closest('#' + INVITE_MODAL_ID)) continue;
                if (el.closest('#' + SECRET_INPUT_ID)) continue;
                if (el.closest('#' + MODAL_ID)) continue;

                const text = el.textContent || '';
                if (text.includes(ourKey)) {
                    return true;
                }
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    function showShareProfileWarning() {
        if (document.getElementById(INVITE_MODAL_ID)) return;
        injectInviteStyles();

        const overlay = document.createElement('div');
        overlay.className = 'secret-modal-overlay';
        overlay.id = INVITE_MODAL_ID;
        overlay.innerHTML = `
        <div class="secret-modal-window">
            <div class="secret-modal-text-center">
                <span class="secret-warning-icon">⚠️</span>
                <h3 class="secret-modal-title danger">Сначала поделитесь своим профилем</h3>
                <p class="secret-warning-subtitle">
                    Чтобы создать защищенный чат, сначала отправьте собеседнику свой публичный ключ.
                </p>
                <div class="secret-info-box">
                    <p class="secret-info-box-title">Способ 1:</p>
                    <p class="secret-info-box-text">Нажмите на <strong>серый замочек</strong> в поле ввода сообщения</p>
                </div>
                <div class="secret-info-box">
                    <p class="secret-info-box-title">Способ 2:</p>
                    <p class="secret-info-box-text">Откройте <strong>окно расширения</strong> и нажмите кнопку <strong> Поделиться ключом</strong></p>
                </div>
                <p class="secret-warning-hint">
                    После того как вы отправите свой ключ собеседнику, нажмите "Создать чат" снова.
                </p>
                <button id="inviteCloseWarningBtn" class="secret-btn secret-btn-primary">Понятно</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        document.getElementById('inviteCloseWarningBtn').onclick = closeInviteModal;
    }

    async function scanForInvites() {
        let currentPublicKey = null;
        try {
            const pm = await getCurrentProfileManager();
            const profile = pm.getCurrentProfile();
            if (profile) currentPublicKey = profile.publicKey;
        } catch (e) {
        }

        const messagesArea = currentAdapter ? currentAdapter.getMessagesArea() : document.body;
        if (!messagesArea) return;

        const allElements = messagesArea.querySelectorAll('div, span, p, li, td');

        for (const el of allElements) {
            if (el.closest('#' + INVITE_MODAL_ID)) continue;
            if (el.closest('.' + INVITE_BUTTON_CLASS)) continue;
            if (el.closest('#' + SECRET_INPUT_ID)) continue;
            if (el.closest('#' + MODAL_ID)) continue;

            if (el.querySelector('.' + INVITE_BUTTON_CLASS)) continue;

            const text = el.textContent || '';
            if (!text) continue;

            const publicKey = extractInviteFromText(text);
            if (!publicKey) continue;

            // Если ключ совпадает с нашим публичным — пропускаем (это наше же приглашение)
            if (currentPublicKey && publicKey === currentPublicKey) continue;

            let isLeaf = true;
            for (const child of el.children) {
                if (child.textContent && child.textContent.includes('Приглашение')) {
                    isLeaf = false;
                    break;
                }
            }

            if (!isLeaf) continue;

            const rect = el.getBoundingClientRect();
            if (rect.width < 100 || rect.height < 20) continue;
            if (rect.width > window.innerWidth - 100) continue;

            const btn = createInviteButton(publicKey);
            el.appendChild(btn);
        }
    }

    function openInviteModal(publicKey) {
        if (document.getElementById(INVITE_MODAL_ID)) return;
        injectInviteStyles();

        const messenger = detectMessengerFromUrl();
        const messengerId = extractChatIdFromUrl();

        const overlay = document.createElement('div');
        overlay.className = 'secret-modal-overlay';
        overlay.id = INVITE_MODAL_ID;
        overlay.innerHTML = `
        <div class="secret-modal-window">
            <h3 class="secret-modal-title">Создать защищенный чат</h3>
            <div>
                <div class="secret-form-group">
                    <label for="inviteChatName">Название чата</label>
                    <input type="text" id="inviteChatName" class="secret-form-input">
                </div>
                <div class="secret-form-group">
                    <label for="inviteChatKey">Ключ шифрования</label>
                    <input type="text" id="inviteChatKey" class="secret-form-input" value="${publicKey}" readonly>
                </div>
                <div class="secret-form-group">
                    <label class="secret-form-checkbox-label">
                        <input type="checkbox" id="inviteAutoEncryption" checked>
                        Автошифрование
                    </label>
                </div>
                <div class="secret-form-group">
                    <label for="inviteMessenger">Мессенджер</label>
                    <select id="inviteMessenger" class="secret-form-input">
                        <option value="">Не выбран</option>
                        <option value="vk" ${messenger === 'vk' ? 'selected' : ''}>ВКонтакте</option>
                        <option value="max" ${messenger === 'max' ? 'selected' : ''}>Макс</option>
                        <option value="tg" ${messenger === 'tg' ? 'selected' : ''}>Telegram</option>
                    </select>
                </div>
                <div class="secret-form-group" id="inviteMessengerIdGroup" style="display:${messenger != null ? 'block' : 'none'};">
                    <label for="inviteMessengerId">ID чата в мессенджере</label>
                    <input type="text" id="inviteMessengerId" class="secret-form-input" value="${messengerId != null ? messengerId : ''}" placeholder="Введите ID чата">
                </div>
            </div>
            <div class="secret-modal-error" id="inviteError"></div>
            <div class="secret-modal-buttons">
                <button id="inviteSaveBtn" class="secret-btn secret-btn-primary">Сохранить</button>
                <button id="inviteCancelBtn" class="secret-btn secret-btn-secondary">Отмена</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        document.getElementById('inviteMessenger').onchange = (e) => {
            document.getElementById('inviteMessengerIdGroup').style.display = e.target.value ? 'block' : 'none';
        };

        document.getElementById('inviteCancelBtn').onclick = closeInviteModal;

        document.getElementById('inviteSaveBtn').onclick = async () => {
            const name = document.getElementById('inviteChatName').value.trim();
            const key = document.getElementById('inviteChatKey').value.trim();
            const messenger = document.getElementById('inviteMessenger').value || null;
            const messengerId = messenger ? document.getElementById('inviteMessengerId').value.trim() : null;
            const autoEncryption = document.getElementById('inviteAutoEncryption').checked;
            const errorEl = document.getElementById('inviteError');

            errorEl.textContent = '';

            if (!name) {
                errorEl.textContent = 'Введите название чата';
                return;
            }
            if (!key) {
                errorEl.textContent = 'Ключ шифрования не указан';
                return;
            }
            if (messenger && !messengerId) {
                errorEl.textContent = 'Укажите ID чата в мессенджере';
                return;
            }

            try {
                const pm = await getCurrentProfileManager();
                const profile = pm.getCurrentProfile();
                if (!profile) {
                    errorEl.textContent = 'Профиль не найден';
                    return;
                }

                if (profile.chats.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                    errorEl.textContent = 'Чат с таким именем уже существует';
                    return;
                }

                profile.addChat(new Chat(name, key, messenger, messengerId, autoEncryption));
                await chrome.storage.local.set({ data: pm.serialize() });

                closeInviteModal();

                if (messenger && messengerId) {
                    const currentMessenger = detectMessengerFromUrl();
                    const currentMessengerId = extractChatIdFromUrl();

                    if (currentMessenger === messenger && String(currentMessengerId) === String(messengerId)) {
                        const lockBtn = document.getElementById(BUTTON_ID);
                        if (lockBtn) {
                            const icon = lockBtn.querySelector('.secret-lock-icon');
                            if (icon) icon.innerHTML = closedLockSVG();
                            lockBtn.classList.add('secret-active');
                            isSecretInputActive = true;
                            if (currentAdapter) {
                                currentAdapter.createSecretInput();
                            }
                        }
                    }
                }
            } catch (err) {
                errorEl.textContent = 'Ошибка: ' + err.message;
            }
        };
    }

    function closeInviteModal() {
        const modal = document.getElementById(INVITE_MODAL_ID);
        if (modal) modal.remove();
    }

    // ============== SITE ADAPTERS ==============
    class SiteAdapter {
        constructor(name, config = {}) {
            this.name = name;
            this.config = {
                buttonStyles: config.buttonStyles || '',
                inputWrapperStyles: config.inputWrapperStyles || 'display:flex;align-items:center;background:#fff;border:2px solid #2CB67D;border-radius:12px;padding:4px 8px;box-sizing:border-box;box-shadow:0 0 0 2px rgba(44,182,125,.15),0 4px 15px rgba(0,0,0,.15);',
                inputContainerStyles: config.inputContainerStyles || '',
                sendButtonStyles: config.sendButtonStyles || 'background:#2CB67D;border:0;color:white;padding:8px 14px;border-radius:8px;cursor:pointer;',
                hideOriginalInput: config.hideOriginalInput !== undefined ? config.hideOriginalInput : false,
                ...config
            };
            this._stylesInjected = false;
        }

        getMessagesArea() {
            return document.body; // По умолчанию — весь документ
        }
        findAnchorButton() { throw new Error('Not implemented'); }
        createButtonWrapper(button) { throw new Error('Not implemented'); }
        getInputContainer() { throw new Error('Not implemented'); }
        getOriginalInput() { throw new Error('Not implemented'); }
        getPlaceholder() { return null; }
        getSendButton() { throw new Error('Not implemented'); }
        getInputPosition() { return null; }

        insertLockButton(button, anchor) {
            const parent = anchor.parentElement;
            if (parent) parent.insertBefore(button, anchor);
        }

        insertSecretInput(wrapper, container) {
            container.appendChild(wrapper);
        }

        triggerSend(originalInput, sendBtn) {
            sendBtn.click();
        }

        sendMessage(text) {
            const originalInput = this.getOriginalInput();
            if (!originalInput) return;

            const messenger = detectMessengerFromUrl();
            const messengerId = extractChatIdFromUrl();

            getCurrentProfileManager().then(pm => {
                const profile = pm.getCurrentProfile();
                if (!profile) {
                    this.removeSecretInput();
                    return;
                }

                const foundChat = findChatByMessengerId(profile, messenger, messengerId);
                if (!foundChat) {
                    this.removeSecretInput();
                    return;
                }

                const cryptoInstance = new Crypto();
                cryptoInstance.importPrivateKey(profile.privateKey)
                    .then(localPrivKey => {
                        return cryptoInstance.importPublicKey(foundChat.key)
                            .then(remotePubKey => ({ localPrivKey, remotePubKey }));
                    })
                    .then(keys => {
                        return cryptoInstance.deriveSessionKey(keys.localPrivKey, keys.remotePubKey)
                            .then(sessionKey => ({ sessionKey }));
                    })
                    .then(context => {
                        return cryptoInstance.encrypt(text, context.sessionKey)
                            .then(encrypted => ({ iv: encrypted.iv, msg: encrypted.msg }));
                    })
                    .then(encrypted => {
                        const payload = `${encrypted.iv};${encrypted.msg}`;

                        if (this.config.hideOriginalInput) {
                            originalInput.style.display = '';
                        }

                        originalInput.focus();

                        if (originalInput.tagName === 'TEXTAREA' || originalInput.tagName === 'INPUT') {
                            originalInput.value = payload;
                            originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                        } else {
                            originalInput.focus();
                            const selection = window.getSelection();
                            const range = document.createRange();
                            range.selectNodeContents(originalInput);
                            range.deleteContents();

                            const textNode = document.createTextNode(payload);
                            range.insertNode(textNode);
                            range.setStartAfter(textNode);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);

                            originalInput.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: payload }));
                        }

                        setTimeout(() => {
                            const sendBtn = this.getSendButton();
                            if (sendBtn) this.triggerSend(originalInput, sendBtn);

                            if (this.config.hideOriginalInput) {
                                this.removeSecretInput();

                                setTimeout(() => {
                                    const lockBtn = document.getElementById(BUTTON_ID);
                                    if (lockBtn && lockBtn.classList.contains('secret-active')) {
                                        this.createSecretInput();

                                        setTimeout(() => {
                                            const secretWrapper = document.getElementById(SECRET_INPUT_ID);
                                            if (secretWrapper) {
                                                const inputArea = secretWrapper.querySelector('.secret-input-inner');
                                                if (inputArea) inputArea.focus();
                                            }
                                        }, 100);
                                    }
                                }, 200);
                            } else {
                                const secretWrapper = document.getElementById(SECRET_INPUT_ID);
                                if (secretWrapper) {
                                    const inputArea = secretWrapper.querySelector('.secret-input-inner');
                                    const placeholderEl = secretWrapper.querySelector('.secret-placeholder');

                                    if (inputArea) {
                                        inputArea.innerHTML = '';
                                        inputArea.focus();

                                        if (placeholderEl) placeholderEl.style.display = '';
                                    }
                                }
                            }
                        }, 120);
                    })
                    .catch(err => {
                        // console.error('Ошибка шифрования:', err);
                        this.removeSecretInput();
                        resetLockIcon(document.getElementById(BUTTON_ID));
                    });
            });
        }

        createSecretInput() {
            if (document.getElementById(SECRET_INPUT_ID)) return;

            const container = this.getInputContainer();
            if (!container) return;

            const originalInput = this.getOriginalInput();
            const placeholder = this.getPlaceholder();

            if (this.config.hideOriginalInput) {
                if (originalInput) originalInput.style.display = 'none';
                if (placeholder) placeholder.style.display = 'none';
            }

            if (!this._stylesInjected) {
                this._injectStyles();
                this._stylesInjected = true;
            }

            const wrapper = document.createElement('div');
            wrapper.id = SECRET_INPUT_ID;

            const styles = [];

            const position = this.getInputPosition();
            if (position) {
                styles.push(Object.entries(position).map(([k, v]) => `${k}:${v}`).join(';'));
            }

            if (this.config.inputContainerStyles) {
                styles.push(this.config.inputContainerStyles);
            }

            if (styles.length > 0) {
                wrapper.style.cssText = styles.join(';');
            }

            wrapper.innerHTML = `
                <div style="flex:1;position:relative;display:flex;align-items:center;min-height:32px;">
                    <span class="secret-placeholder">Защищённое сообщение...</span>
                    <div class="secret-input-inner" contenteditable="true"></div>
                </div>
                <button class="secret-send-btn">Отправить</button>`;

            this.insertSecretInput(wrapper, container);
            this._bindSecretInputEvents(wrapper);

            setTimeout(() => {
                const inputArea = wrapper.querySelector('.secret-input-inner');
                if (inputArea) {
                    inputArea.focus();
                }
            }, 50);
        }

        removeSecretInput() {
            const s = document.getElementById(SECRET_INPUT_ID);
            if (s) s.remove();

            if (this.config.hideOriginalInput) {
                const originalInput = this.getOriginalInput();
                const placeholder = this.getPlaceholder();
                if (originalInput) originalInput.style.display = '';
                if (placeholder) placeholder.style.display = '';
            }
        }

        _injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
        #${SECRET_INPUT_ID}{${this.config.inputWrapperStyles}}
        .secret-input-inner{flex:1;outline:none;font-size:14px;color:#000;white-space:pre-wrap;word-break:break-word;padding:6px 10px;line-height:22px;min-height:22px;}
        .secret-placeholder{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#999;pointer-events:none;font-size:14px;line-height:22px;transition:opacity .15s ease;}
        .secret-send-btn{${this.config.sendButtonStyles}}
        .secret-msg-placeholder{display:inline;padding:0 2px;border-radius:3px;transition:background .2s;}
        .secret-msg-placeholder.secret-decrypting{color:#888 !important;font-style:italic;}
        .secret-msg-placeholder.secret-msg-decrypted{color:#167A52 !important;}
        .secret-msg-placeholder.secret-msg-error{color:#d32f2f !important;background:rgba(211,47,47,.08);}
    `;
            document.head.appendChild(style);
        }

        _bindSecretInputEvents(wrapper) {
            const inputArea = wrapper.querySelector('.secret-input-inner');
            const placeholderEl = wrapper.querySelector('.secret-placeholder');
            const sendBtn = wrapper.querySelector('.secret-send-btn');

            const updatePlaceholder = () => {
                const empty = !inputArea.innerText.trim();
                placeholderEl.style.display = empty ? '' : 'none';
            };

            inputArea.addEventListener('input', updatePlaceholder);
            inputArea.addEventListener('focus', updatePlaceholder);
            inputArea.addEventListener('blur', updatePlaceholder);

            const area = wrapper.querySelector('div:first-child');
            if (area) {
                area.addEventListener('mousedown', (e) => {
                    if (e.target === inputArea || e.target === placeholderEl) {
                        setTimeout(() => { if (document.activeElement !== inputArea) inputArea.focus(); }, 0);
                    }
                });
            }
            updatePlaceholder();

            const send = () => {
                const text = inputArea.innerText.trim();
                if (!text) return;
                this.sendMessage(text);
                inputArea.innerHTML = '';
                updatePlaceholder();
            };
            sendBtn.onclick = send;
            inputArea.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            });
        }

        static detect() { return false; }
    }

    class VKAdapter extends SiteAdapter {
        constructor() {
            super('VK', {
                inputContainerStyles: 'position:absolute;left:48px;right:110px;top:0;z-index:50;'
            });
        }

        findAnchorButton() { return document.querySelector('.StickerEmojiMenuPopper'); }

        getMessagesArea() {
            return document.querySelector('.ConvoMain')
        }

        createButtonWrapper(button) {
            const wrapper = document.createElement('div');
            wrapper.className = 'StickerEmojiMenuPopper';
            wrapper.id = BUTTON_ID;
            button.className = 'ConvoComposer__button';
            button.innerHTML = `<i class="ConvoComposer__buttonIcon secret-lock-icon">${openLockSVG()}</i>`;
            wrapper.appendChild(button);
            return wrapper;
        }

        getInputContainer() {
            const w = document.querySelector('.ConvoComposer__inputWrapper');
            return w ? w.parentElement : null;
        }

        getOriginalInput() { return document.querySelector('.ComposerInput__input[contenteditable="true"]'); }
        getPlaceholder() { return document.querySelector('.ComposerInput__placeholder'); }
        getSendButton() { return document.querySelector('.ConvoComposer__sendButton--submit'); }

        static detect() {
            const h = location.hostname.toLowerCase();
            return /(^|\.)vk\.(com|ru)$/i.test(h) || /vkbroke|vkustc/i.test(h);
        }
    }

    class TelegramAAdapter extends SiteAdapter {
        constructor() {
            super('Telegram-A', {
                buttonStyles: 'width:40px;height:40px;border-radius:50%;background:transparent;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 2px;transition:background 0.2s;',
                inputWrapperStyles: 'display:flex;align-items:center;background:#fff;border:1px solid #dce1e6;border-radius:12px;padding:4px 8px;box-sizing:border-box;min-height:40px;transition:border-color 0.2s,box-shadow 0.2s;width:100%;',
                sendButtonStyles: 'background:#2CB67D;border:0;color:white;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;white-space:nowrap;',
                hideOriginalInput: true
            });
        }

        findAnchorButton() {
            return document.querySelector('.messages-layout')
        }

        getMessagesArea() {
            return document.querySelector('.messages-container') ||
                document.querySelector('.chat-background') ||
                document.body;
        }
        createButtonWrapper(button) {
            button.className = 'Button composer-action-button default translucent round';
            button.style.cssText = this.config.buttonStyles;
            button.innerHTML = `<span class="secret-lock-icon" style="display:flex;">${openLockSVG()}</span>`;
            button.id = BUTTON_ID;
            button.setAttribute('aria-label', 'Секретный чат');
            return button;
        }

        getInputContainer() {
            return document.querySelector('#message-input-text > .input-scroller:not(.clone) > .input-scroller-content');
        }

        getOriginalInput() {
            return document.getElementById('editable-message-text');
        }

        getPlaceholder() {
            return document.querySelector('.placeholder-text');
        }

        getSendButton() {
            return document.querySelector('.main-button');
        }

        static detect() {
            return /web\.telegram\.org/i.test(location.hostname) &&
                document.querySelector('.symbol-menu-button') !== null;
        }
    }

    class TelegramKZAdapter extends SiteAdapter {
        constructor() {
            super('Telegram-KZ', {
                buttonStyles: 'padding:0;width:36px;height:36px;border-radius:50%;background:transparent;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 4px;transition:background 0.2s;',
                inputWrapperStyles: 'display:flex;align-items:center;background:#fff;border:1px solid #dce1e6;border-radius:12px;padding:4px 8px;box-sizing:border-box;min-height:40px;transition:border-color 0.2s,box-shadow 0.2s;width:100%;height:100%;',
                sendButtonStyles: 'background:#2CB67D;border:0;color:white;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;white-space:nowrap;',
                hideOriginalInput: true
            });
        }

        findAnchorButton() {
            return document.querySelector('.toggle-emoticons');
        }

        getMessagesArea() {
            return document.querySelector('.chat')
        }

        createButtonWrapper(button) {
            button.className = 'btn-icon rp';
            button.style.cssText = this.config.buttonStyles;
            button.innerHTML = `<span class="tgico button-icon secret-lock-icon" style="display:flex;">${openLockSVG()}</span>`;
            button.id = BUTTON_ID;
            button.setAttribute('aria-label', 'Секретный чат');
            return button;
        }

        getInputContainer() {
            return document.querySelector('.input-message-container');
        }

        getOriginalInput() {
            return document.querySelector('.input-message-input[contenteditable="true"]:not(.input-field-input-fake)');
        }

        getPlaceholder() { return document.querySelector('.input-field-placeholder'); }
        getSendButton() { return document.querySelector('.btn-send'); }

        static detect() {
            return /web\.telegram\.org/i.test(location.hostname) &&
                document.querySelector('.toggle-emoticons') !== null;
        }
    }

    class MaxAdapter extends SiteAdapter {
        constructor() {
            super('Max', {
                buttonStyles: 'width:36px;height:36px;border-radius:50%;background:transparent;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 4px;transition:background 0.2s;',
                inputWrapperStyles: 'display:flex;align-items:center;background:transparent;border:none;padding:0;box-sizing:border-box;min-height:40px;width:100%;flex:1;',
                sendButtonStyles: 'background:#2CB67D;border:0;color:white;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;white-space:nowrap;',
                hideOriginalInput: true
            });
        }

        findAnchorButton() {
            return document.querySelector('.button[aria-label="Открыть меню стикеров"]');
        }

        getMessagesArea() {
            return document.querySelector('.openedChat')
        }

        createButtonWrapper(button) {
            button.style.cssText = this.config.buttonStyles;
            button.innerHTML = `<span class="secret-lock-icon" style="display:flex;">${openLockSVG()}</span>`;
            button.id = BUTTON_ID;
            button.setAttribute('aria-label', 'Секретный чат');
            return button;
        }

        getInputContainer() {
            return document.querySelector('.input.svelte-1k31az8');
        }

        getOriginalInput() {
            return document.querySelector('.contenteditable.svelte-1k31az8[contenteditable]');
        }

        getPlaceholder() {
            return document.querySelector('.placeholder.svelte-1k31az8');
        }

        getSendButton() {
            return document.querySelector('.button.svelte-1cuof8n[aria-label="Отправить сообщение"]');
        }

        insertSecretInput(wrapper, container) {
            container.appendChild(wrapper);
        }

        triggerSend(originalInput, sendBtn) {
            sendBtn.click();
            originalInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true
            }));
        }

        static detect() {
            const h = location.hostname.toLowerCase();
            return /(^|\.)max\.ru$/i.test(h);
        }
    }

    const ADAPTERS = [VKAdapter, TelegramAAdapter, TelegramKZAdapter, MaxAdapter];
    let currentAdapter = null;
    let isSecretInputActive = false;
    let restoreAttempts = 0;
    let userDisabledAutoEncryption = false;

    function pickAdapter() {
        if (currentAdapter) return currentAdapter;

        for (const A of ADAPTERS) {
            try {
                if (A.detect()) {
                    currentAdapter = new A();
                    // console.log('Secret Chat: Adapter selected —', currentAdapter.name);
                    return currentAdapter;
                }
            } catch (e) { }
        }
        return null;
    }

    function restoreSecretInputIfNeeded() {
        if (!currentAdapter) return;
        if (!isSecretInputActive) return;

        if (document.getElementById(SECRET_INPUT_ID)) {
            restoreAttempts = 0;
            return;
        }

        const messenger = detectMessengerFromUrl();
        const messengerId = extractChatIdFromUrl();

        getCurrentProfileManager().then(pm => {
            const profile = pm.getCurrentProfile();
            const foundChat = findChatByMessengerId(profile, messenger, messengerId);

            if (foundChat) {
                const container = currentAdapter.getInputContainer();
                if (!container) {
                    if (restoreAttempts < 5) {
                        restoreAttempts++;
                        setTimeout(restoreSecretInputIfNeeded, 200);
                    }
                    return;
                }
                currentAdapter.createSecretInput();
                restoreAttempts = 0;
            } else {
                isSecretInputActive = false;
                const lockBtn = document.getElementById(BUTTON_ID);
                if (lockBtn) {
                    lockBtn.classList.remove('secret-active');
                    const icon = lockBtn.querySelector('.secret-lock-icon');
                    if (icon) icon.innerHTML = openLockSVG();
                }
                restoreAttempts = 0;
            }
        });
    }

    function createLockButton() {
        if (!currentAdapter) return;

        const existingBtn = document.getElementById(BUTTON_ID);
        if (existingBtn) {
            checkAutoEncryption();
            return;
        }

        const anchor = currentAdapter.findAnchorButton();
        if (!anchor || !anchor.parentElement) return;

        const button = document.createElement('button');
        button.setAttribute('aria-label', 'Секретный чат');
        const element = currentAdapter.createButtonWrapper(button);

        if (isSecretInputActive) {
            element.classList.add('secret-active');
            const icon = element.querySelector('.secret-lock-icon');
            if (icon) icon.innerHTML = closedLockSVG();
        }

        button.onclick = async () => {
            const active = element.classList.contains('secret-active');
            if (active) {
                currentAdapter.removeSecretInput();
                element.classList.remove('secret-active');
                isSecretInputActive = false;
                userDisabledAutoEncryption = true;
                const icon = element.querySelector('.secret-lock-icon');
                if (icon) icon.innerHTML = openLockSVG();
                return;
            }

            const messenger = detectMessengerFromUrl();
            const messengerId = extractChatIdFromUrl();

            const profileManager = await getCurrentProfileManager();
            const currentProfile = profileManager.getCurrentProfile();

            let foundChat = null;
            if (messenger && messengerId !== null) {
                foundChat = findChatByMessengerId(currentProfile, messenger, messengerId);
            }

            if (foundChat) {
                const icon = element.querySelector('.secret-lock-icon');
                if (icon) icon.innerHTML = closedLockSVG();
                element.classList.add('secret-active');
                isSecretInputActive = true;
                currentAdapter.createSecretInput();
            } else {
                resetLockIcon(element);
                showModal(button);
            }
        };

        currentAdapter.insertLockButton(element, anchor);
        checkAutoEncryption();
    }

    function showModal(lockButton) {
        if (document.getElementById(MODAL_ID)) return;
        injectInviteStyles();

        const overlay = document.createElement('div');
        overlay.className = 'secret-modal-overlay';
        overlay.id = MODAL_ID;
        overlay.innerHTML = `
        <div class="secret-modal-window">
            <div class="secret-modal-text-center">
                <p class="secret-chat-text">Вы не создали защищенный чат, отправить приглашение?</p>
                <div class="secret-chat-buttons">
                    <button id="secret-yes" class="secret-btn secret-btn-primary">Да</button>
                    <button id="secret-no" class="secret-btn secret-btn-secondary">Нет</button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        document.getElementById('secret-yes').onclick = async () => {
            const profileManager = await getCurrentProfileManager();
            const currentProfile = profileManager.getCurrentProfile();
            const publicKey = currentProfile ? currentProfile.publicKey : '';

            const inviteText = `Приглашение в защищенный чат: ${publicKey}`;

            const originalInput = currentAdapter.getOriginalInput();
            if (originalInput) {
                if (currentAdapter.config.hideOriginalInput) {
                    originalInput.style.display = '';
                }
                originalInput.focus();

                if (originalInput.tagName === 'TEXTAREA' || originalInput.tagName === 'INPUT') {
                    originalInput.value = inviteText;
                    originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    originalInput.focus();
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(originalInput);
                    range.deleteContents();

                    const textNode = document.createTextNode(inviteText);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    originalInput.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: inviteText }));
                }

                // Отправляем сообщение сразу после вставки текста
                setTimeout(() => {
                    const sendBtn = currentAdapter.getSendButton();
                    if (sendBtn) {
                        currentAdapter.triggerSend(originalInput, sendBtn);
                    }
                }, 150);
            }

            closeModal();
        };

        document.getElementById('secret-no').onclick = closeModal;
    }

    function closeModal() {
        const m = document.getElementById(MODAL_ID);
        if (m) m.remove();
    }

    function checkAutoEncryption() {
        if (!currentAdapter) return;
        if (userDisabledAutoEncryption) return;
        if (isSecretInputActive) return;

        const messenger = detectMessengerFromUrl();
        const messengerId = extractChatIdFromUrl();

        getCurrentProfileManager().then(pm => {
            const profile = pm.getCurrentProfile();
            if (!profile) return;

            const foundChat = findChatByMessengerId(profile, messenger, messengerId);
            if (!foundChat) return;

            if (foundChat.autoEncryption !== false) {
                const lockBtn = document.getElementById(BUTTON_ID);
                if (!lockBtn) return;

                const icon = lockBtn.querySelector('.secret-lock-icon');
                if (icon) icon.innerHTML = closedLockSVG();
                lockBtn.classList.add('secret-active');
                isSecretInputActive = true;
                currentAdapter.createSecretInput();
            }
        });
    }

    function init() {
        pickAdapter();

        const observer = new MutationObserver(() => {
            if (!currentAdapter) {
                pickAdapter();
                if (currentAdapter) createLockButton();
                return;
            }
            createLockButton();
            restoreSecretInputIfNeeded();
            scanForInvites();
            messageDecryptor.scheduleScan();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        if (currentAdapter) createLockButton();

        setTimeout(() => {
            scanForInvites().catch(() => { });
            messageDecryptor.scanDocument().catch(err => { }
                // console.warn('Secret Chat: initial scan failed', err)
            );
        }, 500);

        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                isSecretInputActive = false;
                userDisabledAutoEncryption = false;
                messageDecryptor.clearCache();
                messageDecryptor.scheduleScan();

                setTimeout(() => {
                    checkAutoEncryption();
                    scanForInvites().catch(() => { });
                }, 300);
            }
        });
        urlObserver.observe(document.body, { subtree: true, childList: true, attributes: true });

        window.addEventListener('popstate', () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                isSecretInputActive = false;
                userDisabledAutoEncryption = false;
                messageDecryptor.clearCache();
                messageDecryptor.scheduleScan();

                setTimeout(() => {
                    checkAutoEncryption();
                    scanForInvites().catch(() => { });
                }, 300);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 