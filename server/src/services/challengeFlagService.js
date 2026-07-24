const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { targetEnvironments } = require('../../../src/shared/targetEnvironments');
const { ensureStorageDir } = require('./targetStorage');

const SECRET_FILE_NAME = '.flag-secret';
const MIN_SECRET_LENGTH = 32;
const FLAG_DIGEST_LENGTH = 20;
const INJECTED_FLAG_NAMES = new Set(['FLAG', 'RELUM_FLAG']);

let cachedSecret = null;

const getChallengeKey = (knowledgeId, sectionTitle) => (
  `${knowledgeId}\u0000${sectionTitle}`
);

const getChallengeDefinition = (knowledgeId, sectionTitle) => {
  const target = targetEnvironments[knowledgeId]?.sections?.[sectionTitle];

  if (!target) {
    return null;
  }

  return {
    knowledgeId,
    sectionTitle,
    target,
  };
};

const listChallengeDefinitions = () => (
  Object.entries(targetEnvironments).flatMap(([knowledgeId, category]) => (
    Object.entries(category.sections || {}).map(([sectionTitle, target]) => ({
      knowledgeId,
      sectionTitle,
      target,
    }))
  ))
);

const createSecret = () => crypto.randomBytes(32).toString('hex');

const readSecretFile = (secretPath) => {
  try {
    const secret = fs.readFileSync(secretPath, 'utf8').trim();
    return secret.length >= MIN_SECRET_LENGTH ? secret : null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const getInstallationSecret = () => {
  if (cachedSecret) {
    return cachedSecret;
  }

  const configuredSecret = String(process.env.RELUM_FLAG_SECRET || '').trim();
  if (configuredSecret) {
    if (configuredSecret.length < MIN_SECRET_LENGTH) {
      throw new Error(`RELUM_FLAG_SECRET 长度不能少于 ${MIN_SECRET_LENGTH} 个字符`);
    }

    cachedSecret = configuredSecret;
    return cachedSecret;
  }

  const secretPath = path.join(ensureStorageDir(), SECRET_FILE_NAME);
  const storedSecret = readSecretFile(secretPath);
  if (storedSecret) {
    cachedSecret = storedSecret;
    return cachedSecret;
  }

  const generatedSecret = createSecret();

  try {
    fs.writeFileSync(secretPath, generatedSecret, {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    });
    cachedSecret = generatedSecret;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }

    cachedSecret = readSecretFile(secretPath);
  }

  if (!cachedSecret) {
    throw new Error('无法初始化本地 flag 密钥');
  }

  return cachedSecret;
};

const normalizeSlug = (value) => (
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32) || 'challenge'
);

const deriveChallengeFlag = (secret, knowledgeId, sectionTitle) => {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(getChallengeKey(knowledgeId, sectionTitle))
    .digest('hex')
    .slice(0, FLAG_DIGEST_LENGTH);

  return `flag{relum_${normalizeSlug(knowledgeId)}_${digest}}`;
};

const getChallengeFlag = (knowledgeId, sectionTitle, secret = getInstallationSecret()) => {
  if (!getChallengeDefinition(knowledgeId, sectionTitle)) {
    return null;
  }

  return deriveChallengeFlag(secret, knowledgeId, sectionTitle);
};

const isInjectedFlagEntry = (entry) => {
  const [name] = String(entry).split('=', 1);
  return INJECTED_FLAG_NAMES.has(name);
};

const buildChallengeTarget = (knowledgeId, sectionTitle, secret = getInstallationSecret()) => {
  const challenge = getChallengeDefinition(knowledgeId, sectionTitle);
  if (!challenge) {
    return null;
  }

  const flag = deriveChallengeFlag(secret, knowledgeId, sectionTitle);
  const existingEnvironment = Array.isArray(challenge.target.env)
    ? challenge.target.env.filter((entry) => !isInjectedFlagEntry(entry))
    : [];

  return {
    ...challenge.target,
    env: [
      ...existingEnvironment,
      `RELUM_FLAG=${flag}`,
      `FLAG=${flag}`,
    ],
  };
};

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyChallengeFlag = (
  knowledgeId,
  sectionTitle,
  submittedFlag,
  secret = getInstallationSecret()
) => {
  const expectedFlag = getChallengeFlag(knowledgeId, sectionTitle, secret);
  if (!expectedFlag || typeof submittedFlag !== 'string') {
    return false;
  }

  return safeEqual(expectedFlag, submittedFlag.trim());
};

module.exports = {
  buildChallengeTarget,
  deriveChallengeFlag,
  getChallengeDefinition,
  getChallengeFlag,
  getInstallationSecret,
  listChallengeDefinitions,
  verifyChallengeFlag,
};
