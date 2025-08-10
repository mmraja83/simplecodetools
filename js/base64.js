// Base64 Encoding/Decoding Tool JavaScript

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
});

function processBasicForm() {
    const operation = document.getElementById('basicOperation').value;
    const text = document.getElementById('basicText').value.trim();
    const resultDiv = document.getElementById('basicResult');
    const resultText = document.getElementById('basicResultText');

    if (!text) {
        showError('Please enter text to process.');
        return;
    }

    try {
        let result;
        if (operation === 'encode') {
            result = encodeBasic(text);
        } else {
            result = decodeBasic(text);
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
    const encodingType = document.getElementById('encodingType').value;
    const lineBreaks = document.getElementById('lineBreaks').value;
    const inputFormat = document.getElementById('inputFormat').value;
    const outputFormat = document.getElementById('outputFormat').value;

    const resultDiv = document.getElementById('advancedResult');
    const resultText = document.getElementById('advancedResultText');
    const advancedInfo = document.getElementById('advancedInfo');

    if (!text) {
        showError('Please enter text to process.');
        return;
    }

    try {
        let result, info;
        if (operation === 'encode') {
            result = encodeAdvanced(text, encodingType, lineBreaks, inputFormat, outputFormat);
            info = `Encoding Type: ${encodingType}\nLine Breaks: ${lineBreaks === 'none' ? 'None' : `Every ${lineBreaks} characters`}\nInput Format: ${inputFormat}\nOutput Format: ${outputFormat}`;
        } else {
            result = decodeAdvanced(text, encodingType, lineBreaks, inputFormat, outputFormat);
            info = `Encoding Type: ${encodingType}\nLine Breaks: ${lineBreaks === 'none' ? 'None' : `Every ${lineBreaks} characters`}\nInput Format: ${inputFormat}\nOutput Format: ${outputFormat}`;
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

function encodeBasic(text) {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
        throw new Error('Encoding failed: ' + error.message);
    }
}

function decodeBasic(encodedText) {
    try {
        return decodeURIComponent(escape(atob(encodedText)));
    } catch (error) {
        throw new Error('Decoding failed: ' + error.message);
    }
}

function encodeAdvanced(text, encodingType, lineBreaks, inputFormat, outputFormat) {
    try {
        let processedText = text;
        
        // Handle input format conversion
        switch (inputFormat) {
            case 'hex':
                processedText = hexToText(text);
                break;
            case 'binary':
                processedText = binaryToText(text);
                break;
            case 'text':
            default:
                // Text is already in the right format
                break;
        }

        // Encode to Base64
        let encoded = btoa(unescape(encodeURIComponent(processedText)));

        // Apply encoding type modifications
        switch (encodingType) {
            case 'urlsafe':
                encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
                break;
            case 'mime':
                // MIME encoding is just standard Base64 with line breaks
                break;
            case 'standard':
            default:
                // Standard Base64
                break;
        }

        // Apply line breaks
        if (lineBreaks !== 'none') {
            const breakSize = parseInt(lineBreaks);
            encoded = encoded.match(new RegExp(`.{1,${breakSize}}`, 'g')).join('\n');
        }

        // Convert output format if needed
        if (outputFormat !== 'base64') {
            return convertOutputFormat(encoded, outputFormat);
        }

        return encoded;
    } catch (error) {
        throw new Error('Advanced encoding failed: ' + error.message);
    }
}

function decodeAdvanced(encodedText, encodingType, lineBreaks, inputFormat, outputFormat) {
    try {
        let processedText = encodedText;
        
        // Remove line breaks if they exist
        if (lineBreaks !== 'none') {
            processedText = processedText.replace(/\n/g, '');
        }

        // Handle encoding type modifications
        switch (encodingType) {
            case 'urlsafe':
                processedText = processedText.replace(/-/g, '+').replace(/_/g, '/');
                break;
            case 'mime':
            case 'standard':
            default:
                // Standard Base64
                break;
        }

        // Decode from Base64
        let decoded = decodeURIComponent(escape(atob(processedText)));

        // Convert output format if needed
        if (outputFormat !== 'text') {
            return convertOutputFormat(decoded, outputFormat);
        }

        return decoded;
    } catch (error) {
        throw new Error('Advanced decoding failed: ' + error.message);
    }
}

function hexToText(hex) {
    try {
        // Remove any spaces or separators
        hex = hex.replace(/\s/g, '');
        
        // Check if hex string is valid
        if (!/^[0-9A-Fa-f]*$/.test(hex)) {
            throw new Error('Invalid hexadecimal string');
        }
        
        // Convert hex to text
        let result = '';
        for (let i = 0; i < hex.length; i += 2) {
            const byte = parseInt(hex.substr(i, 2), 16);
            result += String.fromCharCode(byte);
        }
        return result;
    } catch (error) {
        throw new Error('Invalid hexadecimal input: ' + error.message);
    }
}

function binaryToText(binary) {
    try {
        // Remove any spaces or separators
        binary = binary.replace(/\s/g, '');
        
        // Check if binary string is valid
        if (!/^[01]*$/.test(binary)) {
            throw new Error('Invalid binary string');
        }
        
        // Ensure binary string length is multiple of 8
        if (binary.length % 8 !== 0) {
            throw new Error('Binary string length must be multiple of 8');
        }
        
        // Convert binary to text
        let result = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            const charCode = parseInt(byte, 2);
            result += String.fromCharCode(charCode);
        }
        return result;
    } catch (error) {
        throw new Error('Invalid binary input: ' + error.message);
    }
}

function convertOutputFormat(text, format) {
    switch (format) {
        case 'hex':
            return text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        case 'binary':
            return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        case 'text':
        default:
            return text;
    }
}

function clearBasicForm() {
    document.getElementById('basicText').value = '';
    document.getElementById('basicResult').style.display = 'none';
}

function clearAdvancedForm() {
    document.getElementById('advancedText').value = '';
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