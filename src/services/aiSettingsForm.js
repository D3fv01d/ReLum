const DEFAULT_FORM_PARAMETERS = {
  temperature: '0.7',
  max_tokens: '1000',
  top_p: '0.95',
};

export const buildConfigFromForm = (formData) => ({
  apiKey: formData.apiKey.trim(),
  apiUrl: formData.apiUrl.trim(),
  model: formData.model.trim(),
  systemPrompt: formData.systemPrompt,
  parameters: {
    temperature: parseFloat(formData.temperature) || 0.7,
    max_tokens: parseInt(formData.max_tokens, 10) || 1000,
    top_p: parseFloat(formData.top_p) || 0.95,
  },
});

export const buildFormDataFromConfig = (config) => ({
  apiKey: config.apiKey || '',
  apiUrl: config.apiUrl || '',
  model: config.model || '',
  systemPrompt: config.systemPrompt || '',
  temperature: config.parameters?.temperature?.toString() || DEFAULT_FORM_PARAMETERS.temperature,
  max_tokens: config.parameters?.max_tokens?.toString() || DEFAULT_FORM_PARAMETERS.max_tokens,
  top_p: config.parameters?.top_p?.toString() || DEFAULT_FORM_PARAMETERS.top_p,
});
