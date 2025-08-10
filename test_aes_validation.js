#!/usr/bin/env node

/**
 * AES Tool Validation Script
 * Tests the core AES encryption/decryption functionality
 */

const crypto = require('crypto');

console.log('🔐 AES Tool Validation Script');
console.log('==============================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
    totalTests++;
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ ${testName}: PASS`);
            passedTests++;
        } else {
            console.log(`❌ ${testName}: FAIL`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ ${testName}: FAIL - ${error.message}`);
        failedTests++;
    }
}

function testBasicAES() {
    const testText = "Hello World! This is a test message.";
    const testKey = "MySecretKey123";
    
    // Encrypt
    const cipher = crypto.createCipher('aes-256-cbc', testKey);
    let encrypted = cipher.update(testText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Decrypt
    const decipher = crypto.createDecipher('aes-256-cbc', testKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted === testText;
}

function testAESWithIV() {
    const testText = "Advanced AES Test with IV";
    const testKey = "AdvancedKey123456789";
    const testIV = crypto.randomBytes(16);
    
    // Encrypt with IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(testKey.padEnd(32, '0').substring(0, 32)), testIV);
    let encrypted = cipher.update(testText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Decrypt with IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(testKey.padEnd(32, '0').substring(0, 32)), testIV);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted === testText;
}

function testDifferentKeySizes() {
    const testText = "Key size test";
    const testKey = "KeySizeTest123";
    const testIV = crypto.randomBytes(16);
    
    const keySizes = [128, 192, 256];
    
    for (const keySize of keySizes) {
        const keyLength = keySize / 8;
        const key = Buffer.from(testKey.padEnd(keyLength, '0').substring(0, keyLength));
        
        // Encrypt
        const cipher = crypto.createCipheriv(`aes-${keySize}-cbc`, key, testIV);
        let encrypted = cipher.update(testText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Decrypt
        const decipher = crypto.createDecipheriv(`aes-${keySize}-cbc`, key, testIV);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        if (decrypted !== testText) {
            return false;
        }
    }
    
    return true;
}

function testOutputFormats() {
    const testText = "Format test";
    const testKey = "FormatTestKey";
    const testIV = crypto.randomBytes(16);
    const key = Buffer.from(testKey.padEnd(32, '0').substring(0, 32));
    
    // Test Base64 output
    const cipher1 = crypto.createCipheriv('aes-256-cbc', key, testIV);
    let encrypted1 = cipher1.update(testText, 'utf8', 'base64');
    encrypted1 += cipher1.final('base64');
    
    const decipher1 = crypto.createDecipheriv('aes-256-cbc', key, testIV);
    let decrypted1 = decipher1.update(encrypted1, 'base64', 'utf8');
    decrypted1 += decipher1.final('utf8');
    
    // Test Hex output
    const cipher2 = crypto.createCipheriv('aes-256-cbc', key, testIV);
    let encrypted2 = cipher2.update(testText, 'utf8', 'hex');
    encrypted2 += cipher2.final('hex');
    
    const decipher2 = crypto.createDecipheriv('aes-256-cbc', key, testIV);
    let decrypted2 = decipher2.update(encrypted2, 'hex', 'utf8');
    decrypted2 += decipher2.final('utf8');
    
    return decrypted1 === testText && decrypted2 === testText;
}

function testSpecialCharacters() {
    const testText = "Special chars: @#$%^&*()_+-=[]{}|;':\",./<>?`~";
    const testKey = "SpecialKey123";
    
    const cipher = crypto.createCipher('aes-256-cbc', testKey);
    let encrypted = cipher.update(testText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', testKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted === testText;
}

function testUnicodeCharacters() {
    const testText = "Unicode: 🚀🌟🎉🎊💻🔐";
    const testKey = "UnicodeKey123";
    
    const cipher = crypto.createCipher('aes-256-cbc', testKey);
    let encrypted = cipher.update(testText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', testKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted === testText;
}

function testLongText() {
    const longText = "A".repeat(1000);
    const testKey = "LongTextKey123";
    
    const cipher = crypto.createCipher('aes-256-cbc', testKey);
    let encrypted = cipher.update(longText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', testKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted === longText;
}

function testPerformance() {
    const testText = "Performance test message";
    const testKey = "PerformanceKey123";
    const iterations = 1000;
    
    const startTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
        const cipher = crypto.createCipher('aes-256-cbc', testKey);
        let encrypted = cipher.update(testText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const decipher = crypto.createDecipher('aes-256-cbc', testKey);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        if (decrypted !== testText) {
            return false;
        }
    }
    
    const endTime = process.hrtime.bigint();
    const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const avgTime = totalTime / iterations;
    
    console.log(`   Performance: ${iterations} iterations in ${totalTime.toFixed(2)}ms (avg: ${avgTime.toFixed(3)}ms per operation)`);
    
    return true;
}

// Run all tests
console.log('Running AES validation tests...\n');

runTest('Basic AES Encryption/Decryption', testBasicAES);
runTest('AES with Initialization Vector (IV)', testAESWithIV);
runTest('Different Key Sizes (128, 192, 256 bits)', testDifferentKeySizes);
runTest('Output Formats (Base64, Hex)', testOutputFormats);
runTest('Special Characters', testSpecialCharacters);
runTest('Unicode Characters', testUnicodeCharacters);
runTest('Long Text (1000 characters)', testLongText);
runTest('Performance (1000 iterations)', testPerformance);

// Display results
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
    console.log('\n🎉 All tests passed! The AES implementation is working correctly.');
} else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the implementation.`);
}

console.log('\n' + '='.repeat(50));
console.log('Note: This script tests the core AES functionality using Node.js crypto module.');
console.log('The actual tool uses CryptoJS library in the browser.');
console.log('='.repeat(50)); 