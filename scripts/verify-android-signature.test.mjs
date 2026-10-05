import { test } from 'node:test';
import assert from 'node:assert/strict';
import { X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeFingerprint, requireVerifiedSignature, verifyBundle } from './verify-android-signature.mjs';

test('requires an explicit complete certificate pin', () => {
  for (const invalid of [undefined, '', 'abc', 'G'.repeat(64)]) assert.throws(() => normalizeFingerprint(invalid));
  assert.equal(normalizeFingerprint(Array(32).fill('ab').join(':')), 'AB'.repeat(32));
});
test('rejects unsigned jars even when jarsigner would exit zero', () => {
  assert.throws(() => requireVerifiedSignature('no manifest.\njar is unsigned.'));
  assert.throws(() => requireVerifiedSignature(''));
});
test('rejects partially signed bundles and missing verification marker', () => {
  assert.throws(() => requireVerifiedSignature('jar verified.\nThis jar contains unsigned entries which have not been integrity-checked.'));
  assert.throws(() => requireVerifiedSignature('jarsigner: java.lang.SecurityException'));
});
test('accepts complete verification with expected self-signed certificate warnings', () => {
  assert.doesNotThrow(() => requireVerifiedSignature('jar verified.\nWarning: This jar contains entries whose signer certificate is self-signed.'));
});
test('rejects other artifact types before invoking Java', () => {
  assert.throws(() => verifyBundle('app.apk', 'AB'.repeat(32)), /App Bundle/);
});

// Synthetic JAR/AAB fixture only: temporary test certificate, never a release key.
test('verifies real signed bytes and rejects wrong, incomplete and tampered signatures', () => {
  const root = mkdtempSync(join(tmpdir(), 'wakestate-signature-test-'));
  const env = { ...process.env, FIXTURE_PASSWORD: 'synthetic-fixture-only' };
  const run = (command, args) => execFileSync(command, args, { cwd: root, env, encoding: 'utf8', stdio: 'pipe' });
  try {
    run('keytool', ['-genkeypair', '-alias', 'synthetic', '-keyalg', 'RSA', '-keysize', '2048',
      '-validity', '2', '-dname', 'CN=WakeState Synthetic Test', '-keystore', 'fixture.p12',
      '-storetype', 'PKCS12', '-storepass:env', 'FIXTURE_PASSWORD', '-keypass:env', 'FIXTURE_PASSWORD', '-noprompt']);
    const pem = run('keytool', ['-exportcert', '-rfc', '-alias', 'synthetic', '-keystore', 'fixture.p12', '-storepass:env', 'FIXTURE_PASSWORD']);
    const pin = new X509Certificate(pem).fingerprint256;
    writeFileSync(join(root, 'payload.txt'), 'synthetic data');
    run('jar', ['--create', '--file', 'signed.aab', 'payload.txt']);
    // An unsigned archive exits zero in jarsigner but must fail our gate.
    assert.throws(() => verifyBundle(join(root, 'signed.aab'), pin), /unsigned/);
    run('jarsigner', ['-keystore', 'fixture.p12', '-storepass:env', 'FIXTURE_PASSWORD', 'signed.aab', 'synthetic']);
    const result = verifyBundle(join(root, 'signed.aab'), pin);
    assert.equal(result.uploadCertificateSha256, normalizeFingerprint(pin));
    assert.match(result.sha256, /^[a-f0-9]{64}$/);
    assert.throws(() => verifyBundle(join(root, 'signed.aab'), '00'.repeat(32)), /does not match/);
    copyFileSync(join(root, 'signed.aab'), join(root, 'partial.aab'));
    writeFileSync(join(root, 'unsigned.txt'), 'not signed');
    run('jar', ['--update', '--file', 'partial.aab', 'unsigned.txt']);
    assert.throws(() => verifyBundle(join(root, 'partial.aab'), pin), /partially signed/);
    writeFileSync(join(root, 'payload.txt'), 'changed signed bytes');
    run('jar', ['--update', '--file', 'signed.aab', 'payload.txt']);
    assert.throws(() => verifyBundle(join(root, 'signed.aab'), pin));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
