const { challengeCatalog } = require('./challengeCatalog');

const LOCAL_LAB_IMAGE = 'relum/local-lab:latest';
const LOCAL_LAB_INTERNAL_PORT = 8080;
const LOCAL_LAB_DOCKER_PARAMS = [
  '--read-only',
  '--tmpfs',
  '/tmp:rw,noexec,nosuid,size=64m,uid=10001,gid=10001,mode=0750',
  '--tmpfs',
  '/challenge:rw,noexec,nosuid,size=16m,uid=10001,gid=10001,mode=0750',
  '--cap-drop=ALL',
  '--security-opt=no-new-privileges',
  '--memory=192m',
  '--cpus=0.75',
  '--pids-limit=96',
].join(' ');

const normalizeContainerSegment = (value) => (
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const createSectionTarget = (knowledgeId, sectionTitle, sectionIndex) => ({
  dockerImage: LOCAL_LAB_IMAGE,
  localBuildContext: '.',
  localDockerfile: 'labs/relum-lab/Dockerfile',
  port: null,
  internalPort: LOCAL_LAB_INTERNAL_PORT,
  containerName: `relum-lab-${normalizeContainerSegment(knowledgeId)}-${sectionIndex + 1}`,
  description: `${sectionTitle}独立本地实验环境`,
  defaultInstall: true,
  env: [
    `RELUM_KNOWLEDGE_ID=${knowledgeId}`,
    `RELUM_SECTION_TITLE=${sectionTitle}`,
    `RELUM_CHALLENGE_ID=${knowledgeId}:${sectionIndex + 1}`,
    'RELUM_LAB_ISOLATED=1',
    'RELUM_CHALLENGE_DIR=/challenge',
  ],
  dockerParams: LOCAL_LAB_DOCKER_PARAMS,
});

const targetEnvironments = Object.fromEntries(
  Object.entries(challengeCatalog).map(([knowledgeId, category]) => ([
    knowledgeId,
    {
      title: category.title,
      description: `${category.title}本地隔离靶场`,
      sections: Object.fromEntries(
        category.sections.map((sectionTitle, sectionIndex) => ([
          sectionTitle,
          createSectionTarget(knowledgeId, sectionTitle, sectionIndex),
        ]))
      ),
    },
  ]))
);

module.exports = {
  LOCAL_LAB_IMAGE,
  targetEnvironments,
};
