// Verify an already-built AAB. Never accepts an unsigned jar's zero exit status.
import { X509Certificate, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function normalizeFingerprint(value = '') {
  const fingerprint = value.replaceAll(':', '').toUpperCase();
  if (!/^[0-9A-F]{64}$/.test(fingerprint)) throw new Error('Provide the owned upload certificate SHA-256 (64 hex characters).');
  return fingerprint;
}

export function requireVerifiedSignature(output) {
  if (!output.includes('jar verified.') || /unsigned entries|jar is unsigned/i.test(output)) {
    throw new Error('Bundle is unsigned, partially signed, or its signature could not be verified.');
  }
}

export function verifyBundle(artifact, expectedFingerprint) {
  const expected = normalizeFingerprint(expectedFingerprint);
  if (!artifact.endsWith('.aab')) throw new Error('Expected an Android App Bundle (.aab).');
  const run = (command, args) => execFileSync(command, ['-J-Duser.language=en', '-J-Duser.country=US', ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, LC_ALL: 'C' },
  });
  requireVerifiedSignature(run('jarsigner', ['-verify', artifact]));
  const pem = run('keytool', ['-printcert', '-rfc', '-jarfile', artifact]);
  const certificates = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ?? [];
  // Upload identities are self-signed. Reject ambiguous/multiple signer output.
  if (certificates.length !== 1) throw new Error('Expected one self-signed upload certificate.');
  const certificate = new X509Certificate(certificates[0]);
  if (/CN\s*=\s*Android Debug/i.test(certificate.subject)) throw new Error('Android Debug signing is forbidden for release.');
  const now = Date.now();
  if (now < Date.parse(certificate.validFrom) || now >= Date.parse(certificate.validTo)) throw new Error('Upload certificate is not currently valid.');
  if (normalizeFingerprint(certificate.fingerprint256) !== expected) throw new Error('Bundle signer does not match the owned upload certificate.');
  return {
    artifact: resolve(artifact), sha256: createHash('sha256').update(readFileSync(artifact)).digest('hex'),
    uploadCertificateSha256: expected,
    scope: 'Signature only. Manifest, device QA, store declarations and release authorization remain separate gates.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(verifyBundle(process.argv[2] ?? '', process.env.ANDROID_UPLOAD_CERT_SHA256), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Signature verification failed');
    process.exitCode = 1;
  }
}
