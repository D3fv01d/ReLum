const elements = {
  actionButton: document.getElementById('action-button'),
  actionForm: document.getElementById('action-form'),
  artifact: document.getElementById('artifact'),
  artifactBlock: document.getElementById('artifact-block'),
  categoryTitle: document.getElementById('category-title'),
  challengeInput: document.getElementById('challenge-input'),
  challengeTitle: document.getElementById('challenge-title'),
  engineTag: document.getElementById('engine-tag'),
  flagPanel: document.getElementById('flag-panel'),
  flagValue: document.getElementById('flag-value'),
  hint: document.getElementById('hint'),
  inputLabel: document.getElementById('input-label'),
  mission: document.getElementById('mission'),
  previewFrame: document.getElementById('preview-frame'),
  previewLink: document.getElementById('preview-link'),
  result: document.getElementById('result'),
  resultMessage: document.getElementById('result-message'),
  resultOutput: document.getElementById('result-output'),
  resultState: document.getElementById('result-state'),
  runtimeStatus: document.getElementById('runtime-status'),
};

const showFlag = (flag) => {
  if (!flag) return;
  elements.flagValue.textContent = flag;
  elements.flagPanel.hidden = false;
  elements.runtimeStatus.textContent = '已完成';
  elements.runtimeStatus.classList.add('complete');
};

const showResult = (payload) => {
  elements.result.hidden = false;
  elements.resultMessage.textContent = payload.message || '';
  elements.resultOutput.textContent = payload.output || '';
  elements.resultOutput.hidden = !payload.output;
  elements.resultState.textContent = payload.solved ? '通过' : '未通过';
  elements.resultState.className = payload.solved ? 'success' : '';

  if (payload.openUrl) {
    elements.previewLink.href = payload.openUrl;
    elements.previewLink.hidden = false;
    elements.previewFrame.src = payload.openUrl;
    elements.previewFrame.hidden = false;
  }

  showFlag(payload.flag);
};

const loadScenario = async () => {
  const [scenarioResponse, artifactResponse] = await Promise.all([
    fetch('/api/scenario', { cache: 'no-store' }),
    fetch('/artifact', { cache: 'no-store' }),
  ]);

  if (!scenarioResponse.ok) {
    throw new Error('题目配置加载失败');
  }

  const scenario = await scenarioResponse.json();
  elements.categoryTitle.textContent = scenario.categoryTitle;
  elements.challengeTitle.textContent = scenario.sectionTitle;
  elements.engineTag.textContent = scenario.engine;
  elements.mission.textContent = scenario.mission;
  elements.hint.textContent = scenario.hint;
  elements.inputLabel.textContent = scenario.inputLabel;
  elements.actionButton.textContent = scenario.actionLabel;
  elements.runtimeStatus.textContent = '环境就绪';

  if (scenario.hasArtifact && artifactResponse.ok) {
    elements.artifact.textContent = await artifactResponse.text();
    elements.artifactBlock.hidden = false;
  }
};

const pollStatus = async () => {
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    if (!response.ok) return;
    const status = await response.json();
    showFlag(status.flag);
  } catch {
    // The next poll will retry while the local container remains open.
  }
};

elements.actionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.actionButton.disabled = true;
  elements.actionButton.textContent = '执行中';

  try {
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: elements.challengeInput.value }),
    });
    const payload = await response.json();
    showResult(payload);
  } catch (error) {
    showResult({ message: error.message, output: '', solved: false });
  } finally {
    elements.actionButton.disabled = false;
    const scenario = await fetch('/api/scenario', { cache: 'no-store' }).then((response) => response.json());
    elements.actionButton.textContent = scenario.actionLabel;
  }
});

loadScenario().catch((error) => {
  elements.runtimeStatus.textContent = '载入失败';
  showResult({ message: error.message, output: '', solved: false });
});

setInterval(pollStatus, 1200);
