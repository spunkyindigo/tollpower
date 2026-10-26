import { SecretLeakMatch } from '../types';

interface ScanRule {
  name: string;
  severity: 'critical' | 'high' | 'medium';
  pattern: RegExp;
  recommendation: string;
}

const SCAN_RULES: ScanRule[] = [
  {
    name: 'Google Gemini / Cloud API Key',
    severity: 'critical',
    pattern: /AIzaSy[A-Za-z0-9_-]{33}/g,
    recommendation: 'Remove from code immediately and rotate in Google Cloud Console. Store only in server-side environment variables (.env).'
  },
  {
    name: 'GitHub Personal Access Token',
    severity: 'critical',
    pattern: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{50,255}/g,
    recommendation: 'Revoke this token immediately on github.com/settings/tokens. Never commit GitHub PATs.'
  },
  {
    name: 'OpenAI API Key',
    severity: 'critical',
    pattern: /sk-[a-zA-Z0-9_-]{40,64}/g,
    recommendation: 'Revoke this API key immediately in your OpenAI dashboard and use environment variables.'
  },
  {
    name: 'AWS Access Key ID',
    severity: 'critical',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    recommendation: 'Rotate AWS credentials in IAM and use AWS Secrets Manager or IAM roles.'
  },
  {
    name: 'Stripe Secret Key',
    severity: 'critical',
    pattern: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,99}/g,
    recommendation: 'Rotate Stripe API key in the Stripe Dashboard. Never expose secret keys in client-side code.'
  },
  {
    name: 'Private Key Block',
    severity: 'critical',
    pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----/g,
    recommendation: 'Never commit cryptographic private keys to a repository. Add *.pem, *.key, and id_rsa to .gitignore.'
  },
  {
    name: 'Generic Hardcoded Secret Assignment',
    severity: 'high',
    pattern: /(?:api_key|apikey|secret_key|secretkey|auth_token|client_secret)\s*[:=]\s*["']([^"']{12,})["']/gi,
    recommendation: 'Replace hardcoded credentials with process.env or secret manager bindings.'
  },
  {
    name: 'Slack Webhook URL',
    severity: 'high',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[0-9a-zA-Z_]{8}\/B[0-9a-zA-Z_]{8,12}\/[0-9a-zA-Z_]{24}/g,
    recommendation: 'Revoke the webhook URL in Slack settings and inject via environment variables.'
  }
];

export function scanCodeForSecrets(sourceText: string): SecretLeakMatch[] {
  const leaks: SecretLeakMatch[] = [];
  const lines = sourceText.split('\n');

  lines.forEach((line, lineIndex) => {
    SCAN_RULES.forEach(rule => {
      // Reset regex state
      rule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = rule.pattern.exec(line)) !== null) {
        leaks.push({
          rule: rule.name,
          severity: rule.severity,
          match: match[0],
          line: lineIndex + 1,
          snippet: line.trim(),
          recommendation: rule.recommendation
        });
      }
    });
  });

  return leaks;
}
