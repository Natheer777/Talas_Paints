import { InMemoryRateLimitStore } from '../infrastructure/services/InMemoryRateLimitStore';
import { RateLimitService } from '../application/services/RateLimitService';
import { RateLimitConfig } from '../domian/value-objects/RateLimitConfig';

// npx ts-node src/tests/rateLimitTests.ts
// .\test-rate-limit.ps1

async function testBasicRateLimiting() {
    console.log('\n=== Test 1: Basic Rate Limiting ===');

    const store = new InMemoryRateLimitStore();
    const service = new RateLimitService(store);

    const config = new RateLimitConfig({
        windowMs: 60000, // 1 minute
        maxRequests: 5,
    });

    const key = 'test:user:123';

    // Make 7 requests
    for (let i = 1; i <= 7; i++) {
        const result = await service.checkRateLimit(key, config);
        console.log(`Request ${i}:`, {
            allowed: result.isAllowed,
            remaining: result.remaining,
            current: result.current,
        });
    }

    store.stopCleanup();
}

async function testWindowReset() {
    console.log('\n=== Test 2: Window Reset ===');

    const store = new InMemoryRateLimitStore();
    const service = new RateLimitService(store);

    const config = new RateLimitConfig({
        windowMs: 2000, // 2 seconds
        maxRequests: 3,
    });

    const key = 'test:window:reset';

    // First batch
    console.log('First batch (should succeed):');
    for (let i = 1; i <= 3; i++) {
        const result = await service.checkRateLimit(key, config);
        console.log(`  Request ${i}: allowed=${result.isAllowed}, remaining=${result.remaining}`);
    }

    // Fourth request (should fail)
    console.log('Fourth request (should fail):');
    const failResult = await service.checkRateLimit(key, config);
    console.log(`  Request 4: allowed=${failResult.isAllowed}, retryAfter=${failResult.retryAfter}s`);

    // Wait for window to reset
    console.log('Waiting 2 seconds for window reset...');
    await new Promise(resolve => setTimeout(resolve, 2100));

    // Try again (should succeed)
    console.log('After window reset (should succeed):');
    const successResult = await service.checkRateLimit(key, config);
    console.log(`  Request 5: allowed=${successResult.isAllowed}, remaining=${successResult.remaining}`);

    store.stopCleanup();
}


async function testMultipleKeys() {
    console.log('\n=== Test 3: Multiple Keys (Different Users) ===');

    const store = new InMemoryRateLimitStore();
    const service = new RateLimitService(store);

    const config = new RateLimitConfig({
        windowMs: 60000,
        maxRequests: 3,
    });

    const user1 = 'test:user:1';
    const user2 = 'test:user:2';

    // User 1 makes 4 requests
    console.log('User 1 requests:');
    for (let i = 1; i <= 4; i++) {
        const result = await service.checkRateLimit(user1, config);
        console.log(`  Request ${i}: allowed=${result.isAllowed}`);
    }

    // User 2 makes 2 requests (should still work)
    console.log('User 2 requests:');
    for (let i = 1; i <= 2; i++) {
        const result = await service.checkRateLimit(user2, config);
        console.log(`  Request ${i}: allowed=${result.isAllowed}`);
    }

    store.stopCleanup();
}


async function testReset() {
    console.log('\n=== Test 4: Reset Functionality ===');

    const store = new InMemoryRateLimitStore();
    const service = new RateLimitService(store);

    const config = new RateLimitConfig({
        windowMs: 60000,
        maxRequests: 2,
    });

    const key = 'test:reset';

    // Use up the limit
    console.log('Using up the limit:');
    await service.checkRateLimit(key, config);
    await service.checkRateLimit(key, config);
    const blockedResult = await service.checkRateLimit(key, config);
    console.log(`  Third request: allowed=${blockedResult.isAllowed}`);

    // Reset the limit
    console.log('Resetting the limit...');
    await service.resetLimit(key);

    // Try again (should work)
    const afterResetResult = await service.checkRateLimit(key, config);
    console.log(`  After reset: allowed=${afterResetResult.isAllowed}, remaining=${afterResetResult.remaining}`);

    store.stopCleanup();
}


async function testCleanup() {
    console.log('\n=== Test 5: Cleanup Functionality ===');

    const store = new InMemoryRateLimitStore(1000); // Cleanup every 1 second
    const service = new RateLimitService(store);

    const config = new RateLimitConfig({
        windowMs: 1500, // 1.5 seconds
        maxRequests: 5,
    });

    // Create multiple entries
    console.log('Creating entries for 5 different keys...');
    for (let i = 1; i <= 5; i++) {
        await service.checkRateLimit(`test:cleanup:${i}`, config);
    }

    console.log(`Store size: ${store.getSize()}`);

    // Wait for entries to expire and cleanup to run
    console.log('Waiting 2.5 seconds for cleanup...');
    await new Promise(resolve => setTimeout(resolve, 2500));

    console.log(`Store size after cleanup: ${store.getSize()}`);

    store.stopCleanup();
}


async function testDifferentConfigurations() {
    console.log('\n=== Test 6: Different Configurations ===');

    const store = new InMemoryRateLimitStore();
    const service = new RateLimitService(store);

    // Test factory methods
    const configs = {
        strict: RateLimitConfig.createStrictConfig(),
        moderate: RateLimitConfig.createModerateConfig(),
        lenient: RateLimitConfig.createLenientConfig(),
        auth: RateLimitConfig.createAuthConfig(),
        write: RateLimitConfig.createWriteOperationConfig(),
    };

    console.log('Configuration limits:');
    console.log(`  Strict: ${configs.strict.maxRequests} requests / ${configs.strict.windowMs}ms`);
    console.log(`  Moderate: ${configs.moderate.maxRequests} requests / ${configs.moderate.windowMs}ms`);
    console.log(`  Lenient: ${configs.lenient.maxRequests} requests / ${configs.lenient.windowMs}ms`);
    console.log(`  Auth: ${configs.auth.maxRequests} requests / ${configs.auth.windowMs}ms`);
    console.log(`  Write: ${configs.write.maxRequests} requests / ${configs.write.windowMs}ms`);

    store.stopCleanup();
}


async function testKeyGeneration() {
    console.log('\n=== Test 7: Key Generation Strategies ===');

    // Mock request object
    const mockRequest = {
        headers: {
            'x-forwarded-for': '192.168.1.100',
        },
        socket: {
            remoteAddress: '127.0.0.1',
        },
    };

    const ipKey = RateLimitService.generateKey(mockRequest as any, 'api');
    const userKey = RateLimitService.generateUserKey('user123', 'authenticated');
    const apiKeyKey = RateLimitService.generateApiKeyKey('abc123', 'external');

    console.log('Generated keys:');
    console.log(`  IP-based: ${ipKey}`);
    console.log(`  User-based: ${userKey}`);
    console.log(`  API key-based: ${apiKeyKey}`);
}


async function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Rate Limiting Test Suite             ║');
    console.log('╚════════════════════════════════════════╝');

    try {
        await testBasicRateLimiting();
        await testWindowReset();
        await testMultipleKeys();
        await testReset();
        await testCleanup();
        await testDifferentConfigurations();
        await testKeyGeneration();

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

// Export for use in other test files
export {
    testBasicRateLimiting,
    testWindowReset,
    testMultipleKeys,
    testReset,
    testCleanup,
    testDifferentConfigurations,
    testKeyGeneration,
    runAllTests,
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}
