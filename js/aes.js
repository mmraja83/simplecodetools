// AES Encryption/Decryption Tool JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabContents.forEach(content => content.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to target tab and button
            document.getElementById(targetTab).classList.add('active');
            this.classList.add('active');
        });
    });

    // Basic form submission
    const basicForm = document.getElementById('basicForm');
    basicForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processBasicForm();
    });

    // Advanced form submission
    const advancedForm = document.getElementById('advancedForm');
    advancedForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processAdvancedForm();
    });

    // Auto-generate IV if not provided
    const advancedIV = document.getElementById('advancedIV');
    advancedIV.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.value = generateRandomIV();
        }
    });

    // Initialize with auto-generated IV
    if (advancedIV) {
        advancedIV.value = generateRandomIV();
    }
});

function processBasicForm() {
    const operation = document.getElementById('basicOperation').value;
    const text = document.getElementById('basicText').value.trim();
    const key = document.getElementById('basicKey').value.trim();
    const resultDiv = document.getElementById('basicResult');
    const resultText = document.getElementById('basicResultText');

    if (!text || !key) {
        showError('Please enter both text and key.');
        return;
    }

    try {
        let result;
        if (operation === 'encrypt') {
            result = encryptBasic(text, key);
        } else {
            result = decryptBasic(text, key);
        }

        resultText.textContent = result;
        resultDiv.style.display = 'block';
        showSuccess('Operation completed successfully!');
    } catch (error) {
        showError('Error: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

function processAdvancedForm() {
    const operation = document.getElementById('advancedOperation').value;
    const text = document.getElementById('advancedText').value.trim();
    const key = document.getElementById('advancedKey').value.trim();
    const iv = document.getElementById('advancedIV').value.trim();
    const keySize = document.getElementById('keySize').value;
    const mode = document.getElementById('mode').value;
    const padding = document.getElementById('padding').value;
    const outputFormat = document.getElementById('outputFormat').value;

    const resultDiv = document.getElementById('advancedResult');
    const resultText = document.getElementById('advancedResultText');
    const advancedInfo = document.getElementById('advancedInfo');

    if (!text || !key) {
        showError('Please enter both text and key.');
        return;
    }

    try {
        let result, info;
        if (operation === 'encrypt') {
            result = encryptAdvanced(text, key, iv, keySize, mode, padding, outputFormat);
            info = `Key Size: ${keySize} bits\nMode: ${mode}\nPadding: ${padding}\nOutput Format: ${outputFormat}\nIV: ${iv}`;
        } else {
            result = decryptAdvanced(text, key, iv, keySize, mode, padding, outputFormat);
            info = `Key Size: ${keySize} bits\nMode: ${mode}\nPadding: ${padding}\nInput Format: ${outputFormat}\nIV: ${iv}`;
        }

        resultText.textContent = result;
        advancedInfo.textContent = info;
        resultDiv.style.display = 'block';
        showSuccess('Advanced operation completed successfully!');
    } catch (error) {
        showError('Error: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

function encryptBasic(text, key) {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, key);
        return encrypted.toString();
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
}

function decryptBasic(encryptedText, key) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!result) {
            throw new Error('Decryption failed. Check your key and encrypted text.');
        }
        
        return result;
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

function encryptAdvanced(text, key, iv, keySize, mode, padding, outputFormat) {
    try {
        // Prepare key and IV
        const keyObj = CryptoJS.enc.Utf8.parse(key.padEnd(keySize / 8, '0').substring(0, keySize / 8));
        const ivObj = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').substring(0, 16));

        // Configure encryption options
        const options = {
            iv: ivObj,
            mode: CryptoJS.mode[mode],
            padding: CryptoJS.pad[padding]
        };

        // Encrypt
        const encrypted = CryptoJS.AES.encrypt(text, keyObj, options);

        // Format output
        switch (outputFormat) {
            case 'Base64':
                return encrypted.toString();
            case 'Hex':
                return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
            case 'Utf8':
                return encrypted.ciphertext.toString(CryptoJS.enc.Utf8);
            default:
                return encrypted.toString();
        }
    } catch (error) {
        throw new Error('Advanced encryption failed: ' + error.message);
    }
}

function decryptAdvanced(encryptedText, key, iv, keySize, mode, padding, outputFormat) {
    try {
        // Prepare key and IV
        const keyObj = CryptoJS.enc.Utf8.parse(key.padEnd(keySize / 8, '\0').substring(0, keySize / 8));
        const ivObj = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '\0').substring(0, 16));

        // Configure decryption options
        const options = {
            iv: ivObj,
            mode: CryptoJS.mode[mode],
            padding: CryptoJS.pad[padding]
        };

        let decrypted;
        
        if (outputFormat === 'Base64') {
            // For Base64 input, use the direct decrypt method
            decrypted = CryptoJS.AES.decrypt(encryptedText, keyObj, options);
        } else {
            // For other formats, create a CipherParams object
            let ciphertext;
            switch (outputFormat) {
                case 'Hex':
                    ciphertext = CryptoJS.enc.Hex.parse(encryptedText);
                    break;
                case 'Utf8':
                default:
                    ciphertext = CryptoJS.enc.Utf8.parse(encryptedText);
            }
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: ciphertext
            });
            decrypted = CryptoJS.AES.decrypt(cipherParams, keyObj, options);
        }

        // Convert the decrypted data to a UTF-8 string
        const result = decrypted.toString(CryptoJS.enc.Utf8);

        if (!result) {
            throw new Error('Decryption failed. Please check your key, IV, and that the input is properly formatted.');
        }

        return result;
    } catch (error) {
        throw new Error('Advanced decryption failed: ' + error.message);
    }
}

function generateRandomIV() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function clearBasicForm() {
    document.getElementById('basicText').value = '';
    document.getElementById('basicKey').value = '';
    document.getElementById('basicResult').style.display = 'none';
}

function clearAdvancedForm() {
    document.getElementById('advancedText').value = '';
    document.getElementById('advancedKey').value = '';
    document.getElementById('advancedIV').value = generateRandomIV();
    document.getElementById('advancedResult').style.display = 'none';
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(elementId);
        }).catch(() => {
            fallbackCopyTextToClipboard(text, elementId);
        });
    } else {
        fallbackCopyTextToClipboard(text, elementId);
    }
}

function fallbackCopyTextToClipboard(text, elementId) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(elementId);
    } catch (err) {
        showError('Failed to copy text');
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(elementId) {
    const copyBtn = document.querySelector(`#${elementId}`).nextElementSibling;
    const originalText = copyBtn.textContent;
    
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 2000);
}

function showSuccess(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
}

function showError(message) {
    // You can implement a toast notification here
    console.error('Error:', message);
    alert(message);
} 