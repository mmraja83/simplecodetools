// MD5 Hashing Tool JavaScript

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

    // File input handling
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    const fileUpload = document.querySelector('.file-upload');
    fileUpload.addEventListener('dragover', handleDragOver);
    fileUpload.addEventListener('drop', handleDrop);
});

function processBasicForm() {
    const text = document.getElementById('basicText').value.trim();
    const resultDiv = document.getElementById('basicResult');
    const resultText = document.getElementById('basicResultText');

    if (!text) {
        showError('Please enter text to hash.');
        return;
    }

    try {
        const hash = generateMD5(text);
        resultText.textContent = hash;
        resultDiv.style.display = 'block';
        showSuccess('MD5 hash generated successfully!');
    } catch (error) {
        showError('Error: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

async function processAdvancedForm() {
    const text = document.getElementById('advancedText').value.trim();
    const file = document.getElementById('fileInput').files[0];
    const hashFormat = document.getElementById('hashFormat').value;
    const encoding = document.getElementById('encoding').value;
    const salt = document.getElementById('salt').value.trim();
    const iterations = parseInt(document.getElementById('iterations').value);

    const resultDiv = document.getElementById('advancedResult');
    const resultText = document.getElementById('advancedResultText');
    const advancedInfo = document.getElementById('advancedInfo');

    if (!text && !file) {
        showError('Please enter text or select a file to hash.');
        return;
    }

    try {
        let inputData, hash, info;
        
        if (file) {
            // Process file
            inputData = file;
            hash = await generateFileMD5(file, hashFormat, salt, iterations);
            info = `File: ${file.name}\nSize: ${formatFileSize(file.size)}\nHash Format: ${hashFormat}\nSalt: ${salt || 'None'}\nIterations: ${iterations}`;
        } else {
            // Process text
            inputData = text;
            hash = generateAdvancedMD5(text, hashFormat, encoding, salt, iterations);
            info = `Text Length: ${text.length} characters\nEncoding: ${encoding}\nHash Format: ${hashFormat}\nSalt: ${salt || 'None'}\nIterations: ${iterations}`;
        }

        resultText.textContent = hash;
        advancedInfo.textContent = info;
        resultDiv.style.display = 'block';
        showSuccess('Advanced MD5 hash generated successfully!');
    } catch (error) {
        showError('Error: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

function generateMD5(text) {
    try {
        return CryptoJS.MD5(text).toString();
    } catch (error) {
        throw new Error('MD5 generation failed: ' + error.message);
    }
}

function generateAdvancedMD5(text, format, encoding, salt, iterations) {
    try {
        let data = text;
        
        // Apply encoding if specified
        if (encoding !== 'UTF-8') {
            data = applyEncoding(text, encoding);
        }
        
        // Apply salt if provided
        if (salt) {
            data = salt + data;
        }
        
        // Apply iterations
        let hash = CryptoJS.MD5(data);
        for (let i = 1; i < iterations; i++) {
            hash = CryptoJS.MD5(hash);
        }
        
        // Format output
        switch (format) {
            case 'hex':
                return hash.toString();
            case 'base64':
                return hash.toString(CryptoJS.enc.Base64);
            case 'binary':
                return hash.toString(CryptoJS.enc.Latin1);
            default:
                return hash.toString();
        }
    } catch (error) {
        throw new Error('Advanced MD5 generation failed: ' + error.message);
    }
}

async function generateFileMD5(file, format, salt, iterations) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let data = e.target.result;
                
                // Convert ArrayBuffer to WordArray for CryptoJS
                const wordArray = CryptoJS.lib.WordArray.create(data);
                
                // Apply salt if provided
                if (salt) {
                    const saltArray = CryptoJS.enc.Utf8.parse(salt);
                    data = saltArray.concat(wordArray);
                } else {
                    data = wordArray;
                }
                
                // Apply iterations
                let hash = CryptoJS.MD5(data);
                for (let i = 1; i < iterations; i++) {
                    hash = CryptoJS.MD5(hash);
                }
                
                // Format output
                let result;
                switch (format) {
                    case 'hex':
                        result = hash.toString();
                        break;
                    case 'base64':
                        result = hash.toString(CryptoJS.enc.Base64);
                        break;
                    case 'binary':
                        result = hash.toString(CryptoJS.enc.Latin1);
                        break;
                    default:
                        result = hash.toString();
                }
                
                resolve(result);
            } catch (error) {
                reject(new Error('File MD5 generation failed: ' + error.message));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

function applyEncoding(text, encoding) {
    try {
        switch (encoding) {
            case 'ASCII':
                return text.replace(/[^\x00-\x7F]/g, '');
            case 'ISO-8859-1':
                return unescape(encodeURIComponent(text));
            case 'UTF-8':
            default:
                return text;
        }
    } catch (error) {
        console.warn('Encoding conversion failed, using original text:', error);
        return text;
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        showFileInfo(file);
        // Clear text input when file is selected
        document.getElementById('advancedText').value = '';
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('fileInput').files = files;
        showFileInfo(files[0]);
        // Clear text input when file is dropped
        document.getElementById('advancedText').value = '';
    }
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function verifyHash() {
    const verifyHash = document.getElementById('verifyHash').value.trim();
    const basicText = document.getElementById('basicText').value.trim();
    const advancedText = document.getElementById('advancedText').value.trim();
    const file = document.getElementById('fileInput').files[0];
    
    if (!verifyHash) {
        showError('Please enter a hash to verify.');
        return;
    }
    
    let inputData;
    if (basicText) {
        inputData = basicText;
    } else if (advancedText) {
        inputData = advancedText;
    } else if (file) {
        inputData = file;
    } else {
        showError('Please enter text or select a file to verify against.');
        return;
    }
    
    try {
        let generatedHash;
        if (file) {
            // For files, we need to generate hash asynchronously
            generateFileMD5(file, 'hex', '', 1).then(hash => {
                verifyHashResult(hash, verifyHash);
            }).catch(error => {
                showError('Error generating file hash: ' + error.message);
            });
        } else {
            // For text
            generatedHash = generateMD5(inputData);
            verifyHashResult(generatedHash, verifyHash);
        }
    } catch (error) {
        showError('Error during verification: ' + error.message);
    }
}

function verifyHashResult(generatedHash, verifyHash) {
    const verificationResult = document.getElementById('verificationResult');
    const verificationText = document.getElementById('verificationText');
    
    const isMatch = generatedHash.toLowerCase() === verifyHash.toLowerCase();
    
    if (isMatch) {
        verificationText.textContent = '✅ Hash verification successful! The hashes match.';
        verificationText.style.color = 'var(--success-color)';
        verificationText.style.borderColor = 'var(--success-color)';
    } else {
        verificationText.textContent = `❌ Hash verification failed!\nGenerated Hash: ${generatedHash}\nProvided Hash: ${verifyHash}`;
        verificationText.style.color = 'var(--error-color)';
        verificationText.style.borderColor = 'var(--error-color)';
    }
    
    verificationResult.style.display = 'block';
}

function clearBasicForm() {
    document.getElementById('basicText').value = '';
    document.getElementById('basicResult').style.display = 'none';
}

function clearAdvancedForm() {
    document.getElementById('advancedText').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('salt').value = '';
    document.getElementById('verificationResult').style.display = 'none';
    document.getElementById('advancedResult').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
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
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-family: inherit;
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
} 