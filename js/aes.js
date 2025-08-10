// AES Encryption/Decryption Tool JavaScript

// Toggle password visibility
function togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    const eyeIcon = button.querySelector('.eye-icon');
    if (type === 'password') {
        eyeIcon.textContent = '👁️';
        button.setAttribute('aria-label', 'Show password');
    } else {
        eyeIcon.textContent = '🔒';
        button.setAttribute('aria-label', 'Hide password');
    }
}

// Toggle output format visibility based on operation
function toggleOutputFormatVisibility(operation) {
    const outputFormatGroup = document.getElementById('outputFormatGroup');
    if (outputFormatGroup) {
        outputFormatGroup.style.display = operation === 'encrypt' ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize password toggles
    document.querySelectorAll('.toggle-password').forEach(button => {
        const input = button.closest('.password-container').querySelector('input');
        button.addEventListener('click', () => togglePasswordVisibility(input, button));
    });
    
    // Toggle output format when operation changes
    const operationSelects = document.querySelectorAll('select[id$="Operation"]');
    operationSelects.forEach(select => {
        select.addEventListener('change', () => {
            toggleOutputFormatVisibility(select.value);
        });
        // Initialize visibility
        toggleOutputFormatVisibility(select.value);
    });
    
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

    if (!text) {
        showError('Please enter some text to process');
        return;
    }

    if (!key) {
        showError('Please enter a secret key');
        return;
    }

    try {
        let result;
        if (operation === 'encrypt') {
            // For basic encryption, use default settings (CBC, Pkcs7, 256-bit key)
            const iv = generateRandomIV();
            result = encryptAdvanced(text, key, iv, 256, 'CBC', 'Pkcs7', 'Base64');
        } else {
            // For decryption, use Base64 input format
            result = decryptBasic(text, key);
        }

        resultText.textContent = result;
        resultDiv.style.display = 'block';
        showSuccess('Operation completed successfully!');
    } catch (error) {
        showError('An error occurred: ' + error.message);
        console.error(error);
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
            // For encryption, use the selected output format
            result = encryptAdvanced(text, key, iv, keySize, mode, padding, outputFormat);
            info = `Key Size: ${keySize} bits\nMode: ${mode}\nPadding: ${padding}\nOutput Format: ${outputFormat}\nIV: ${iv}`;
        } else {
            // For decryption, use the selected output format to determine input format
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

// Helper function to process key and IV consistently
function processKeyAndIV(key, iv, keySize) {
    // Process key - ensure it's exactly keySize/8 bytes long
    let keyBytes = CryptoJS.enc.Utf8.parse(key);
    const keySizeBytes = keySize / 8;
    
    // If key is shorter than required, pad with zeros
    if (keyBytes.words.length * 4 < keySizeBytes) {
        const padding = new Array(keySizeBytes - (keyBytes.sigBytes % keySizeBytes)).join('\0');
        keyBytes = CryptoJS.enc.Utf8.parse(key + padding);
    }
    // If key is longer than required, truncate
    if (keyBytes.sigBytes > keySizeBytes) {
        keyBytes.sigBytes = keySizeBytes;
    }
    
    // Process IV - ensure it's exactly 16 bytes
    let ivBytes = CryptoJS.enc.Utf8.parse(iv);
    const ivSizeBytes = 16;
    
    // If IV is shorter than required, pad with zeros
    if (ivBytes.words.length * 4 < ivSizeBytes) {
        const padding = new Array(ivSizeBytes - (ivBytes.sigBytes % ivSizeBytes)).join('\0');
        ivBytes = CryptoJS.enc.Utf8.parse(iv + padding);
    }
    // If IV is longer than required, truncate
    if (ivBytes.sigBytes > ivSizeBytes) {
        ivBytes.sigBytes = ivSizeBytes;
    }
    
    return {
        key: keyBytes,
        iv: ivBytes
    };
}

function encryptAdvanced(text, key, iv, keySize, mode, padding, outputFormat) {
    try {
        // Process key and IV consistently
        const { key: keyObj, iv: ivObj } = processKeyAndIV(key, iv, keySize);

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
        // Process key and IV consistently using the same helper function as encryption
        const { key: keyObj, iv: ivObj } = processKeyAndIV(key, iv, keySize);

        // Configure decryption options
        const options = {
            iv: ivObj,
            mode: CryptoJS.mode[mode],
            padding: CryptoJS.pad[padding]
        };

        let decrypted;
        
        // Handle different input formats
        if (outputFormat === 'Base64') {
            // For Base64 input, use the direct decrypt method
            decrypted = CryptoJS.AES.decrypt(encryptedText, keyObj, options);
        } else if (outputFormat === 'Hex') {
            // For Hex input, parse and create CipherParams
            const parsedHex = CryptoJS.enc.Hex.parse(encryptedText);
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: parsedHex,
                key: keyObj,
                iv: ivObj,
                algorithm: CryptoJS.algo.AES,
                mode: options.mode,
                padding: options.padding
            });
            decrypted = CryptoJS.AES.decrypt(cipherParams, keyObj, options);
        } else {
            // For UTF-8 input, parse and create CipherParams
            const parsedUtf8 = CryptoJS.enc.Utf8.parse(encryptedText);
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: parsedUtf8,
                key: keyObj,
                iv: ivObj,
                algorithm: CryptoJS.algo.AES,
                mode: options.mode,
                padding: options.padding
            });
            decrypted = CryptoJS.AES.decrypt(cipherParams, keyObj, options);
        }

        // Try to convert the decrypted data to a UTF-8 string
        let result;
        try {
            result = decrypted.toString(CryptoJS.enc.Utf8);
            
            // If result is empty but decrypted data exists, try to handle it differently
            if (!result && decrypted.sigBytes > 0) {
                // Try to get the raw words and convert manually
                const words = decrypted.words;
                const sigBytes = decrypted.sigBytes;
                const resultArray = [];
                
                for (let i = 0; i < sigBytes; i++) {
                    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    resultArray.push(String.fromCharCode(byte));
                }
                
                result = resultArray.join('');
            }
        } catch (e) {
            // If string conversion fails, try to get raw bytes
            const words = decrypted.words;
            const sigBytes = decrypted.sigBytes;
            const resultArray = [];
            
            for (let i = 0; i < sigBytes; i++) {
                const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                resultArray.push(String.fromCharCode(byte));
            }
            
            result = resultArray.join('');
        }

        if (!result) {
            // If we still don't have a result, try one more approach
            try {
                const words = decrypted.words;
                const sigBytes = decrypted.sigBytes;
                const resultArray = [];
                
                for (let i = 0; i < sigBytes; i++) {
                    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    if (byte > 0) {  // Only include non-null bytes
                        resultArray.push(String.fromCharCode(byte));
                    }
                }
                
                result = resultArray.join('');
                
                if (!result) {
                    throw new Error('Decryption resulted in empty output');
                }
            } catch (e) {
                // Provide detailed error information
                const error = new Error('Decryption failed. Please verify:');
                error.details = {
                    keyLength: key.length,
                    keySize: keySize,
                    ivLength: iv.length,
                    inputLength: encryptedText.length,
                    outputFormat: outputFormat,
                    decryptedLength: decrypted ? decrypted.sigBytes : 0,
                    error: e.message
                };
                throw error;
            }
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