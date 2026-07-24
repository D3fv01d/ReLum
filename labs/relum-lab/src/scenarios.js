const crypto = require('crypto');
const { challengeCatalog } = require('../../../src/shared/challengeCatalog');

const profileByCategory = {
  'sql-injection': {
    engine: 'sql',
    inputLabel: 'SQL 参数值',
    actionLabel: '发送查询',
    mission: '利用当前 SQL 上下文读取隐藏记录。数据库查询由靶场真实执行。',
    hint: '先建立正常请求基线，再使用真假条件、闭合、UNION 或二阶段触发验证输入如何改变查询。',
  },
  xss: {
    engine: 'xss',
    inputLabel: 'HTML / JavaScript payload',
    actionLabel: '保存并打开预览',
    mission: '让浏览器在受控受害者页面执行脚本，并把 admin_token 发送到同源收集端点。',
    hint: "目标端点为 /api/xss/collect?proof=，可以读取 document.cookie 后发送。",
  },
  csrf: {
    engine: 'csrf',
    inputLabel: '伪造请求参数',
    actionLabel: '提交伪造请求',
    mission: '在只依赖 Cookie 会话的状态变更接口中，把账户邮箱改为 attacker@relum.local。',
    hint: 'GET 题提交完整查询字符串；POST 题提交 application/x-www-form-urlencoded 请求体。',
  },
  'file-upload': {
    engine: 'upload',
    inputLabel: '上传描述 JSON',
    actionLabel: '上传文件',
    mission: '针对当前校验层构造上传对象，让服务端保存并执行带有 RELUM_PROBE 标记的文件。',
    hint: '格式示例：{"filename":"probe.php","mime":"image/png","content":"PNG RELUM_PROBE"}。',
  },
  'file-download': {
    engine: 'file-read',
    inputLabel: '文件名或路径',
    actionLabel: '下载文件',
    mission: '绕过文件边界读取仅存在于容器内的 /challenge/flag.txt。',
    hint: '关注路径规范化顺序、编码次数、对象权限与服务端实际根目录。',
  },
  'command-execution': {
    engine: 'command',
    inputLabel: '命令参数',
    actionLabel: '执行功能',
    mission: '利用解释器边界执行额外命令，读取 /challenge/flag.txt。',
    hint: '靶场位于隔离容器中，命令长度和执行时间受限；从命令分隔符或模板表达式入手。',
  },
  'file-inclusion': {
    engine: 'file-read',
    inputLabel: '待包含的页面路径',
    actionLabel: '包含页面',
    mission: '利用包含路径处理缺陷读取 /challenge/flag.txt。',
    hint: '根据题目尝试相对路径、编码、伪协议、日志或会话文件入口。',
  },
  xxe: {
    engine: 'xxe',
    inputLabel: 'XML 文档',
    actionLabel: '解析 XML',
    mission: '定义外部实体并读取 file:///challenge/flag.txt。',
    hint: '提交包含 DOCTYPE、ENTITY 和实体引用的完整 XML；无回显题需要使用日志通道。',
  },
  'logic-vulnerabilities': {
    engine: 'logic',
    inputLabel: '业务请求 JSON',
    actionLabel: '执行业务请求',
    mission: '利用当前业务流程的状态或权限缺陷完成非预期操作。',
    hint: '比较不同账号、对象、次数、金额和流程顺序；不要只检查单个字段。',
  },
  authentication: {
    engine: 'auth',
    inputLabel: '认证请求 JSON',
    actionLabel: '提交认证请求',
    mission: '绕过当前认证或会话控制，取得管理员会话。',
    hint: '检查默认凭据、MFA 状态、会话标识和重置流程是否与用户身份绑定。',
  },
  'access-control': {
    engine: 'access',
    inputLabel: '访问请求 JSON',
    actionLabel: '访问资源',
    mission: '使用低权限身份访问其他用户、管理员或其他租户的数据。',
    hint: '修改对象 ID、角色、功能路径或租户标识，服务端必须独立执行授权判断。',
  },
  ssrf: {
    engine: 'ssrf',
    inputLabel: '服务端请求 URL',
    actionLabel: '请求 URL',
    mission: '利用服务端代请求能力访问仅容器内部可见的元数据端点。',
    hint: '内部目标为 http://127.0.0.1:8080/internal/metadata，部分题存在字符串过滤。',
  },
  'api-security': {
    engine: 'api',
    inputLabel: 'API 请求 JSON',
    actionLabel: '发送 API 请求',
    mission: '利用对象授权、字段绑定、查询复杂度或速率控制缺陷读取受保护数据。',
    hint: '从 id、role、fields、query、limit 等接口参数建立最小对照。',
  },
  deserialization: {
    engine: 'deserialize',
    inputLabel: '序列化对象',
    actionLabel: '恢复对象',
    mission: '构造对象数据触发不安全类型恢复或绕过签名版本控制。',
    hint: '寻找类型标记、魔术方法、pickle opcode 或未纳入签名的数据字段。',
  },
  'jwt-oauth': {
    engine: 'token',
    inputLabel: '令牌或授权请求',
    actionLabel: '验证令牌',
    mission: '利用签名、密钥、重定向或 scope 校验缺陷取得 admin 权限。',
    hint: '检查 alg、kid、redirect_uri、scope 和过期时间是否由服务端按预期约束。',
  },
  'linux-wargame': {
    engine: 'linux',
    inputLabel: '最终答案',
    actionLabel: '提交答案',
    mission: '阅读给定终端工件并提取本关证明字符串。',
    hint: '使用文件导航、权限判断、管道和重定向思路分析工件。',
  },
  cryptography: {
    engine: 'crypto',
    inputLabel: '解码或验证结果',
    actionLabel: '提交结果',
    mission: '分析给定编码、哈希、密文或签名材料，恢复证明字符串。',
    hint: '先判断数据属于编码、哈希、加密还是签名，再选择相应方法。',
  },
  'binary-reversing': {
    engine: 'artifact',
    inputLabel: '程序分析结果',
    actionLabel: '提交分析结果',
    mission: '从程序头、字符串、调试记录或编译保护信息中定位证明字符串。',
    hint: '把静态证据和运行时证据分开记录，再验证关键假设。',
  },
  forensics: {
    engine: 'forensics',
    inputLabel: '调查结论',
    actionLabel: '提交结论',
    mission: '从文件、流量或日志工件中提取唯一的事件指标。',
    hint: '先固定时间范围和数据源，再关联主机、账号、IP 与哈希。',
  },
  'blue-team-dfir': {
    engine: 'forensics',
    inputLabel: '调查结论',
    actionLabel: '提交结论',
    mission: '根据告警和证据完成分诊、收集、遏制或复盘判断。',
    hint: '答案来自证据，不要把处置建议当成已经发生的事实。',
  },
  'threat-hunting': {
    engine: 'detection',
    inputLabel: '规则或映射结果',
    actionLabel: '验证检测',
    mission: '从狩猎数据中形成可验证的规则、TTP 映射或调优结论。',
    hint: '使用高信号字段构建条件，并确认规则同时覆盖真阳性和基线流量。',
  },
};

const platformCategories = new Set([
  'middleware',
  'components',
  'frameworks',
  'cms',
  'database',
  'cloud-container',
  'cve-reproduction',
]);

const toSlug = (value) => (
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const digest = (value, length = 10) => (
  crypto.createHash('sha256').update(value).digest('hex').slice(0, length)
);

const createProof = (knowledgeId, sectionTitle) => (
  `proof-${toSlug(knowledgeId)}-${digest(`${knowledgeId}:${sectionTitle}`, 8)}`
);

const createArtifact = ({ engine, index, knowledgeId, proof, sectionTitle }) => {
  if (engine === 'crypto') {
    if (index === 0) {
      return {
        answer: proof,
        artifact: `encoding=base64\nvalue=${Buffer.from(proof).toString('base64')}`,
      };
    }

    if (index === 1) {
      return {
        answer: proof,
        artifact: [
          'algorithm=sha256',
          `digest=${crypto.createHash('sha256').update(proof).digest('hex')}`,
          `candidates=guest,admin,${proof},password123`,
        ].join('\n'),
      };
    }

    if (index === 2) {
      const key = 23;
      const cipher = Buffer.from(proof)
        .map((byte) => byte ^ key)
        .toString('hex');
      return {
        answer: proof,
        artifact: `algorithm=xor\nkey=${key}\ncipher_hex=${cipher}`,
      };
    }

    return {
      answer: proof,
      artifact: [
        'signature_a=valid',
        'signature_b=valid',
        'nonce_a=184467',
        'nonce_b=184467',
        `recovered_message=${Buffer.from(proof).toString('base64')}`,
        'finding=nonce reused',
      ].join('\n'),
    };
  }

  if (engine === 'linux') {
    const artifacts = [
      `$ pwd\n/home/player\n$ find . -maxdepth 2 -type f\n./notes/start.txt\n./.cache/${proof}.txt`,
      `-rw-r----- 1 root analysts 64 Jul 24 10:03 evidence.txt\nuid=1001(player) gid=1001(player) groups=1001(player),1002(analysts)\ncontent=${proof}`,
      `access.log:\nnoise alpha\nrelum event ${proof}\nnoise omega\nsuggested_pipeline=grep relum access.log | cut -d' ' -f3-`,
      `level=04\nprevious_answer=${proof}\nnext_step=record the command, input and output`,
    ];
    return { answer: proof, artifact: artifacts[index] || artifacts[0] };
  }

  if (engine === 'forensics') {
    const artifacts = [
      `2026-07-24T09:14:02Z host=ws-17 action=download sha256=${digest(proof, 32)}\n2026-07-24T09:14:07Z host=ws-17 marker=${proof}`,
      `packet 41 src=10.10.8.4 dst=10.10.8.9 method=POST uri=/sync\npacket 42 header=X-Incident-Proof:${proof}`,
      `09:02 login user=lin src=10.0.0.8\n09:07 process=powershell parent=winword\n09:08 outbound=198.51.100.24 marker=${proof}`,
      `ioc_type=domain value=cdn-update.invalid\nconfidence=high\ncase_proof=${proof}`,
    ];
    return { answer: proof, artifact: artifacts[index % artifacts.length] };
  }

  if (engine === 'detection') {
    const artifacts = [
      `process.name=powershell process.command_line="-enc JAB" user=alex label=malicious\nexpected_hunt_id=${proof}`,
      `title: Suspicious Script Interpreter\nselection:\n  process.command_line|contains: '-enc'\nfalsepositive: admin automation\nrule_test_proof: ${proof}`,
      `technique=T1059.001\nsource=process_creation\nmapping_proof=${proof}`,
      `baseline_count=418\nalert_count=37\ntrue_positive=3\nrecommended_exclusion=parent_image: trusted-agent\nproof=${proof}`,
    ];
    return { answer: proof, artifact: artifacts[index % artifacts.length] };
  }

  if (engine === 'artifact') {
    const hex = Buffer.from(`RELUM:${proof}`).toString('hex').match(/.{1,32}/g).join('\n');
    return {
      answer: proof,
      artifact: [
        `file=challenge-${index + 1}.bin`,
        'format=ELF64',
        'section=.rodata',
        hex,
        `analysis_target=${sectionTitle}`,
      ].join('\n'),
    };
  }

  const liveArtifacts = {
    sql: [
      'database=SQLite\npublic_table=users\nhidden_table=vault\nobjective=make the application return the hidden secret',
      'database=SQLite\ninput_context=number\nhidden_row_id=99',
      'database=SQLite\npublic_query_columns=2\nhidden_table=vault(secret)',
      'database=SQLite\nerror_channel=enabled\ncustom_probe=relum_error(expression)',
      'database=SQLite\nresponse=true|false\nsubmit_format=answer:<recovered value>',
      'database=SQLite\nresponse_time=condition dependent\nsubmit_format=answer:<recovered value>',
      'database=SQLite\nflow=store profile -> trigger report\ninput_format={"store":"value"} then {"trigger":true}',
      'database=SQLite\nfilter=case-sensitive keyword blacklist\ncomments are normalized after filtering',
    ][index],
    xss: 'victim=/victim\ncollector=/api/xss/collect?proof=<document.cookie>\ncookie=admin_token (not HttpOnly in this lab)',
    csrf: 'victim_session=automatic\ntarget_email=attacker@relum.local\nstate_endpoint=/api/csrf/state',
    upload: 'input_format={"filename":"name","mime":"type","content":"data"}\nexecution_marker=RELUM_PROBE',
    'file-read': 'public_root=/challenge/public\ntarget=/challenge/flag.txt\ninput is resolved by the vulnerable application',
    command: 'application_command=ping -c 1 <input>\ntarget=/challenge/flag.txt\nexecution_timeout=1500ms',
    xxe: 'parser=training XML entity resolver\ntarget=file:///challenge/flag.txt\nexternal_network_entities=disabled',
    logic: 'input_format=JSON\nusers=guest,analyst,admin\nprotected_object=1002\ntarget_role=admin',
    auth: 'input_format=JSON\nusers=guest,admin\nsession_cookie=lab_session',
    access: 'input_format=JSON\ncurrent_user=1001\nother_user=1002\nadmin_path=/admin/export',
    ssrf: 'internal_target=http://127.0.0.1:8080/internal/metadata\nexternal network access is disabled',
    api: 'input_format=JSON\ncurrent_user=1001\nprotected_object=1002\nadmin_field=role',
    deserialize: 'accepted_formats=java-like,php-like,pickle-like,signed-json\nnetwork callbacks are disabled',
    token: 'issuer=relum-local\nbaseline_role=user\nweak_training_secret=secret\ncallback_allowlist=http://client.local/callback',
  };

  if (liveArtifacts[engine]) {
    return {
      answer: proof,
      artifact: liveArtifacts[engine],
    };
  }

  if (platformCategories.has(knowledgeId)) {
    return {
      answer: proof,
      artifact: [
        `asset=${toSlug(knowledgeId)}-node-${index + 1}`,
        `topic=${sectionTitle}`,
        `version=training-${index + 1}.0`,
        `exposure=${index % 2 === 0 ? 'management endpoint enabled' : 'default credential retained'}`,
        `response_header=X-Relum-Proof: ${proof}`,
        'scope=isolated miniature reproduction; no vendor binary included',
      ].join('\n'),
    };
  }

  return {
    answer: proof,
    artifact: `topic=${sectionTitle}\nproof=${proof}\nsource=isolated local lab`,
  };
};

const getProfile = (knowledgeId) => {
  if (profileByCategory[knowledgeId]) {
    return profileByCategory[knowledgeId];
  }

  if (platformCategories.has(knowledgeId)) {
    return {
      engine: 'artifact',
      inputLabel: '分析结论',
      actionLabel: '提交结论',
      mission: '分析隔离的微型复现环境，确认版本、配置或响应证据。',
      hint: '此类题使用最小复现而非完整历史产品，重点验证漏洞根因和识别方法。',
    };
  }

  throw new Error(`未配置靶场类别: ${knowledgeId}`);
};

const createScenario = (knowledgeId, sectionTitle) => {
  const category = challengeCatalog[knowledgeId];
  const index = category?.sections.indexOf(sectionTitle) ?? -1;

  if (!category || index < 0) {
    return null;
  }

  const profile = getProfile(knowledgeId);
  const proof = createProof(knowledgeId, sectionTitle);
  const artifactData = createArtifact({
    engine: profile.engine,
    index,
    knowledgeId,
    proof,
    sectionTitle,
  });

  return {
    id: `${knowledgeId}:${index + 1}`,
    knowledgeId,
    categoryTitle: category.title,
    sectionTitle,
    index,
    engine: profile.engine,
    mission: `${profile.mission} 当前场景：${sectionTitle}。`,
    hint: profile.hint,
    inputLabel: profile.inputLabel,
    actionLabel: profile.actionLabel,
    artifact: artifactData.artifact,
    answer: artifactData.answer,
    proof,
  };
};

const toPublicScenario = (scenario) => ({
  id: scenario.id,
  knowledgeId: scenario.knowledgeId,
  categoryTitle: scenario.categoryTitle,
  sectionTitle: scenario.sectionTitle,
  engine: scenario.engine,
  mission: scenario.mission,
  hint: scenario.hint,
  inputLabel: scenario.inputLabel,
  actionLabel: scenario.actionLabel,
  hasArtifact: Boolean(scenario.artifact),
});

module.exports = {
  createProof,
  createScenario,
  toPublicScenario,
};
