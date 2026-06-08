# AI 供应商与本地模型接入指南

ReLum 的 AI 助手已经拆分为四层：

- `src/config/aiProviders.js`：供应商预设，负责展示名称、默认地址、默认模型、协议格式和是否需要密钥。
- `src/services/aiConfigStorage.js`：配置清洗与安全校验，允许 HTTPS 云端地址，也允许本机和私有网段 HTTP 地址。
- `src/services/aiConfigService.js`：默认配置、已保存配置和表单配置合并。
- `src/services/aiService.js`：请求适配器，负责把统一的聊天消息转换成不同供应商的请求格式。

这种结构保证 UI、配置安全和 API 协议互相解耦。后期新增供应商时，优先新增预设；只有协议不是 OpenAI 兼容、Ollama、Anthropic 或 Gemini 时，才需要新增请求适配器。

## 已支持类型

| 类型 | 适用场景 | 密钥 | 默认协议 |
| --- | --- | --- | --- |
| DeepSeek | DeepSeek 官方 API | 需要 | OpenAI 兼容 |
| OpenAI | OpenAI Chat Completions | 需要 | OpenAI 兼容 |
| OpenAI 兼容 | OpenRouter、Groq、Mistral、Moonshot、Qwen、私有网关等兼容 `/v1/chat/completions` 的服务 | 视服务而定 | OpenAI 兼容 |
| Ollama 本地 | 本机运行 Ollama | 不需要 | Ollama 原生 `/api/chat` |
| LM Studio 本地 | LM Studio Local Server | 不需要 | OpenAI 兼容 |
| vLLM 本地/私有 | vLLM OpenAI compatible server | 通常不需要 | OpenAI 兼容 |
| LocalAI 本地 | LocalAI OpenAI compatible server | 通常不需要 | OpenAI 兼容 |
| Anthropic Claude | Claude Messages API | 需要 | Anthropic Messages |
| Google Gemini | Gemini generateContent API | 需要 | Gemini |

## 页面配置步骤

1. 打开 `设置 -> AI 模型配置`。
2. 在 `服务商 / 运行方式` 中选择云端供应商、本地服务或 `OpenAI 兼容`。
3. 填写 `API 密钥`。Ollama、LM Studio、vLLM、LocalAI 这类本地服务通常留空。
4. 确认 `API 地址` 和 `模型名称`。切换供应商时，系统会自动填入默认值。
5. 点击 `测试连接`，确认返回正常后点击 `保存配置`。
6. 回到页面右侧 AI 助手开始对话。

## 本地 AI 示例

### Ollama

启动服务：

```bash
ollama serve
```

拉取模型：

```bash
ollama pull llama3.1
```

ReLum 配置：

```text
服务商 / 运行方式：Ollama 本地
API 地址：http://localhost:11434/api/chat
模型名称：llama3.1
API 密钥：留空
```

### LM Studio

1. 在 LM Studio 中下载并加载模型。
2. 打开 `Local Server`。
3. 启动 OpenAI compatible server。

ReLum 配置：

```text
服务商 / 运行方式：LM Studio 本地
API 地址：http://localhost:1234/v1/chat/completions
模型名称：local-model
API 密钥：留空
```

如果 LM Studio 显示了具体模型名，建议把 `local-model` 替换为界面中的模型名。

### vLLM

示例启动命令：

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000
```

ReLum 配置：

```text
服务商 / 运行方式：vLLM 本地/私有
API 地址：http://localhost:8000/v1/chat/completions
模型名称：Qwen/Qwen2.5-7B-Instruct
API 密钥：留空，除非你的网关强制鉴权
```

### LocalAI

ReLum 配置：

```text
服务商 / 运行方式：LocalAI 本地
API 地址：http://localhost:8081/v1/chat/completions
模型名称：你的 LocalAI 模型名
API 密钥：留空，除非你的服务启用了鉴权
```

## 云端与网关示例

### OpenAI 兼容网关

适用于大多数提供 OpenAI Chat Completions 兼容接口的云端或私有网关。

```text
服务商 / 运行方式：OpenAI 兼容
API 地址：https://your-gateway.example/v1/chat/completions
模型名称：供应商模型名
API 密钥：供应商或网关密钥
```

请求体会使用统一格式：

```json
{
  "model": "供应商模型名",
  "messages": [
    { "role": "system", "content": "系统提示词" },
    { "role": "user", "content": "用户消息" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "top_p": 0.95,
  "stream": false
}
```

### Anthropic Claude

```text
服务商 / 运行方式：Anthropic Claude
API 地址：https://api.anthropic.com/v1/messages
模型名称：claude-3-5-sonnet-latest
API 密钥：Anthropic API key
```

### Google Gemini

```text
服务商 / 运行方式：Google Gemini
API 地址：https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
模型名称：gemini-1.5-flash
API 密钥：Gemini API key
```

`{model}` 会被自动替换为 `模型名称`，密钥会自动追加到 query string。

## 安全边界

配置保存前会做以下处理：

- 只保存裁剪后的字符串，避免异常超长输入写入 localStorage。
- 云端地址必须使用 HTTPS。
- HTTP 只允许本机、`.local` 域名和私有网段地址：`localhost`、`127.0.0.1`、`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`。
- 温度、top_p、max_tokens 会被限制到合理范围。
- 本地服务不强制填写 API 密钥，云端官方供应商会强制填写密钥。

## 新增供应商

### 供应商兼容 OpenAI

只需要在 `src/config/aiProviders.js` 添加预设：

```js
myProvider: {
  id: 'my-provider',
  label: 'My Provider',
  apiFormat: 'openai-compatible',
  defaultApiUrl: 'https://api.example.com/v1/chat/completions',
  defaultModel: 'my-model',
  requiresApiKey: true,
  description: 'My Provider OpenAI 兼容接口。',
}
```

然后把它加入 `AI_PROVIDER_OPTIONS`，设置页会自动出现该选项。

### 供应商不是 OpenAI 兼容

1. 在 `src/services/aiService.js` 中新增 `buildMyProviderRequest(config, messages)`。
2. 返回 `{ url, options, parseResponse }`。
3. 把函数加入 `requestBuilders`。
4. 在 `src/config/aiProviders.js` 中新增预设并设置 `apiFormat`。
5. 为请求体、响应解析和配置切换补测试。

测试建议：

```bash
CI=true npm test -- --watchAll=false src/services/aiService.test.js
npm run verify
```
