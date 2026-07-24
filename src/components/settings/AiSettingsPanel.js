import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faUndo,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import {
  AI_PROVIDER_OPTIONS,
  getAiProviderPreset,
} from '../../config/aiProviders';
import aiService from '../../services/aiService';
import {
  buildCandidateAiConfig,
  getActiveAiConfig,
  saveAiConfig,
} from '../../services/aiConfigService';
import { buildConfigFromForm, buildFormDataFromConfig } from '../../services/aiSettingsForm';

function AiSettingsPanel() {
  // 状态变量
  const [formData, setFormData] = useState(() => buildFormDataFromConfig(getActiveAiConfig()));

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const providerPreset = getAiProviderPreset(formData.provider);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 清除之前的测试结果
    setTestResult(null);
  };

  const handleProviderChange = (event) => {
    const provider = event.target.value;
    const nextPreset = getAiProviderPreset(provider);

    setFormData({
      ...formData,
      provider,
      apiUrl: nextPreset.defaultApiUrl || formData.apiUrl,
      model: nextPreset.defaultModel || formData.model,
      apiKey: nextPreset.requiresApiKey ? formData.apiKey : '',
    });
    setTestResult(null);
    setSaveResult(null);
  };

  // 保存配置
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const nextConfig = saveAiConfig(buildConfigFromForm(formData));
      setFormData(buildFormDataFromConfig(nextConfig));

      setSaveResult({
        success: true,
        message: '配置已成功保存',
      });

      // 3秒后清除保存结果消息
      setTimeout(() => {
        setSaveResult(null);
      }, 3000);
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveResult({
        success: false,
        message: `保存失败: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData(buildFormDataFromConfig(getActiveAiConfig()));
    setTestResult(null);
    setSaveResult(null);
  };

  // 测试API连接
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // 测试连接
      const success = await aiService.testConnection(buildCandidateAiConfig(buildConfigFromForm(formData)));

      if (success) {
        setTestResult({
          success: true,
          message: 'API连接测试成功！',
        });
      } else {
        setTestResult({
          success: false,
          message: 'API连接测试失败，请检查配置。',
        });
      }

    } catch (error) {
      console.error('API测试失败:', error);
      setTestResult({
        success: false,
        message: `API测试失败: ${error.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };


  return (
        <div className="settings-panel ai-settings-panel">
          <div className="settings-panel-heading">
            <div>
              <p className="section-kicker">模型连接</p>
              <h2>AI 服务</h2>
            </div>
          </div>

          <form onSubmit={handleSave} className="settings-form">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="provider">
                服务商 / 运行方式
              </label>
              <select
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleProviderChange}
                className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
              >
                {AI_PROVIDER_OPTIONS.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {providerPreset.description}
              </p>
            </div>

            {/* API密钥 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="apiKey">
                API 密钥 {providerPreset.requiresApiKey ? <span className="text-red-500">*</span> : <span className="text-gray-500">（本地服务可留空）</span>}
              </label>
              <div className="flex">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E1E1E] border border-[#444] rounded-l-md px-3 py-2 text-white"
                  placeholder={providerPreset.requiresApiKey ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' : '本地模型通常无需填写'}
                  required={providerPreset.requiresApiKey}
                />
                <button
                  type="button"
                  className="bg-[#1E1E1E] border border-[#444] border-l-0 rounded-r-md px-3 text-gray-300 hover:text-white"
                  aria-label={showApiKey ? '隐藏 API 密钥' : '显示 API 密钥'}
                  onClick={() => setShowApiKey(visible => !visible)}
                >
                  <FontAwesomeIcon icon={showApiKey ? faEyeSlash : faEye} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                云端模型请填写服务商密钥；Ollama、LM Studio、vLLM、LocalAI 等本地服务通常留空。
              </p>
            </div>

            {/* API URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="apiUrl">
                API 接口地址
              </label>
              <input
                type="text"
                id="apiUrl"
                name="apiUrl"
                value={formData.apiUrl}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
                placeholder={providerPreset.defaultApiUrl || 'https://your-provider.example/v1/chat/completions'}
              />
            </div>

            {/* 模型选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="model">
                模型
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
                placeholder={providerPreset.defaultModel || 'model-name'}
              />
            </div>

            {/* 系统提示词 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="systemPrompt">
                系统提示词
              </label>
              <textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white h-24"
                placeholder="你是一个网络安全专家，可以回答用户关于网络安全的问题..."
              />
            </div>

            {/* 参数设置 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="temperature">
                  温度 (Temperature)
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">值越高，回答越随机（0-1）</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="max_tokens">
                  最大Token数
                </label>
                <input
                  type="number"
                  id="max_tokens"
                  name="max_tokens"
                  min="100"
                  max="4000"
                  step="100"
                  value={formData.max_tokens}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="top_p">
                  Top P
                </label>
                <input
                  type="number"
                  id="top_p"
                  name="top_p"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.top_p}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E1E1E] border border-[#444] rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={`mb-4 p-3 rounded-md ${testResult.success ? 'bg-green-700/20' : 'bg-red-700/20'}`}>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={testResult.success ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${testResult.success ? 'text-green-500' : 'text-red-500'}`}
                  />
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            {/* 保存结果 */}
            {saveResult && (
              <div className={`mb-4 p-3 rounded-md ${saveResult.success ? 'bg-green-700/20' : 'bg-red-700/20'}`}>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={saveResult.success ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${saveResult.success ? 'text-green-500' : 'text-red-500'}`}
                  />
                  <span>{saveResult.message}</span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || (providerPreset.requiresApiKey && !formData.apiKey)}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isTesting || (providerPreset.requiresApiKey && !formData.apiKey) ? 'bg-blue-800/50 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'
                }`}
              >
                {isTesting ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <span>测试连接</span>
                )}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isSaving ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isSaving ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    保存配置
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                <FontAwesomeIcon icon={faUndo} className="mr-2" />
                重置
              </button>
            </div>
          </form>

        </div>
  );
}

export default AiSettingsPanel;
