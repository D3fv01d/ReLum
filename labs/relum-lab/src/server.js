const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');
const { URL, URLSearchParams } = require('url');
const { createScenario, toPublicScenario } = require('./scenarios');

const DEFAULT_PORT = 8080;
const MAX_BODY_BYTES = 64 * 1024;
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
};

const text = (res, statusCode, payload, contentType = 'text/plain; charset=utf-8') => {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let size = 0;
  let body = '';

  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    size += Buffer.byteLength(chunk);
    if (size > MAX_BODY_BYTES) {
      reject(new Error('请求体超过 64 KB 限制'));
      req.destroy();
      return;
    }
    body += chunk;
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

const parseActionBody = async (req) => {
  const rawBody = await readBody(req);
  const contentType = String(req.headers['content-type'] || '');

  if (contentType.includes('application/json')) {
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    return {
      input: typeof parsed.input === 'string' ? parsed.input : JSON.stringify(parsed.input ?? ''),
      raw: parsed,
    };
  }

  const params = new URLSearchParams(rawBody);
  return {
    input: params.get('input') || rawBody,
    raw: Object.fromEntries(params),
  };
};

const parseJsonInput = (input) => {
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const safeFileName = (value) => (
  path.basename(String(value || 'upload.bin')).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120)
);

const wait = (milliseconds) => {
  const buffer = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(buffer), 0, 0, milliseconds);
};

const createSqlRuntime = (scenario, flag) => {
  const { DatabaseSync } = require('node:sqlite');
  const database = new DatabaseSync(':memory:');

  database.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, bio TEXT);
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT);
    CREATE TABLE vault (secret TEXT);
  `);

  const insertUser = database.prepare('INSERT INTO users (id, username, bio) VALUES (?, ?, ?)');
  insertUser.run(1, 'alice', 'security learner');
  insertUser.run(2, 'admin', 'local administrator');
  insertUser.run(99, 'vault', flag);
  database.prepare('INSERT INTO products (id, name, description) VALUES (?, ?, ?)').run(1, 'notebook', 'training notes');
  database.prepare('INSERT INTO vault (secret) VALUES (?)').run(scenario.index >= 4 && scenario.index <= 5 ? scenario.proof : flag);

  return database;
};

const createRuntimeState = (scenario, flag, challengeDir) => {
  fs.mkdirSync(path.join(challengeDir, 'public'), { recursive: true });
  fs.mkdirSync(path.join(challengeDir, 'private'), { recursive: true });
  fs.mkdirSync(path.join(challengeDir, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(challengeDir, 'sessions'), { recursive: true });
  fs.mkdirSync(path.join(challengeDir, 'uploads'), { recursive: true });

  fs.writeFileSync(path.join(challengeDir, 'flag.txt'), `${flag}\n`, { mode: 0o640 });
  fs.writeFileSync(path.join(challengeDir, 'public', 'readme.txt'), 'ReLum local lab public file\n');
  fs.writeFileSync(path.join(challengeDir, 'private', 'report.txt'), `restricted report\n${flag}\n`);
  fs.writeFileSync(path.join(challengeDir, 'logs', 'access.log'), `127.0.0.1 GET / index\npoisoned-marker ${flag}\n`);
  fs.writeFileSync(path.join(challengeDir, 'sessions', 'sess_training'), `user=guest\nproof=${flag}\n`);

  return {
    solved: false,
    solvedAt: null,
    storedValue: '',
    xssPayload: '',
    accountEmail: 'learner@relum.local',
    sql: scenario.engine === 'sql' ? createSqlRuntime(scenario, flag) : null,
  };
};

const createResult = (state, flag, message, output = '', solved = false, extra = {}) => {
  if (solved) {
    state.solved = true;
    state.solvedAt = state.solvedAt || new Date().toISOString();
  }

  return {
    ok: true,
    solved: state.solved,
    message,
    output,
    ...(state.solved ? { flag } : {}),
    ...extra,
  };
};

const runSql = (scenario, state, flag, input) => {
  const trimmedInput = input.trim();

  if (trimmedInput === `answer:${scenario.proof}` && scenario.index >= 4 && scenario.index <= 5) {
    return createResult(state, flag, '盲注结果正确。', scenario.proof, true);
  }

  if (scenario.index === 6) {
    const request = parseJsonInput(input);
    if (typeof request.store === 'string') {
      state.storedValue = request.store.slice(0, 500);
      return createResult(state, flag, '输入已写入资料字段。请在下一步触发报表查询。');
    }

    if (request.trigger === true) {
      const sql = `SELECT username, bio FROM users WHERE username = '${state.storedValue}'`;
      const rows = state.sql.prepare(sql).all();
      const output = JSON.stringify(rows, null, 2);
      return createResult(state, flag, '报表查询已执行。', output, output.includes(flag));
    }

    return createResult(state, flag, '先提交 {"store":"..."}，再提交 {"trigger":true}。');
  }

  if (scenario.index === 3 && /relum_error\s*\(/i.test(trimmedInput) && /vault/i.test(trimmedInput)) {
    return createResult(
      state,
      flag,
      '数据库错误被应用直接回显。',
      `SQLITE_ERROR: relum_error: ${flag}`,
      true
    );
  }

  try {
    let sql;
    if (scenario.index === 0) {
      sql = `SELECT username, bio FROM users WHERE username = '${trimmedInput}'`;
    } else if (scenario.index === 1) {
      sql = `SELECT id, username, bio FROM users WHERE id = ${trimmedInput}`;
    } else if (scenario.index === 2) {
      sql = `SELECT name, description FROM products WHERE id = '${trimmedInput}'`;
    } else if (scenario.index === 3) {
      sql = `SELECT username FROM users WHERE username = '${trimmedInput}'`;
    } else if (scenario.index === 4 || scenario.index === 5) {
      sql = `SELECT CASE WHEN (${trimmedInput}) THEN 1 ELSE 0 END AS verdict`;
    } else {
      if (/\b(?:OR|UNION)\b|--|#|\s/.test(trimmedInput)) {
        return createResult(state, flag, '输入被关键字过滤器拒绝。', 'blocked by filter');
      }
      sql = `SELECT username, bio FROM users WHERE username = '${trimmedInput}'`;
    }

    const startedAt = Date.now();
    const rows = state.sql.prepare(sql).all();
    if (scenario.index === 5 && Number(rows[0]?.verdict) === 1) {
      wait(350);
    }
    const elapsed = Date.now() - startedAt;
    const output = JSON.stringify({ sql, rows, elapsedMs: elapsed }, null, 2);

    return createResult(state, flag, '查询执行完成。', output, output.includes(flag));
  } catch (error) {
    return createResult(state, flag, '数据库返回错误。', error.message);
  }
};

const runXss = (scenario, state, flag, input) => {
  state.xssPayload = input.slice(0, 4000);
  const openUrl = scenario.index === 2
    ? `/victim#${encodeURIComponent(state.xssPayload)}`
    : `/victim?input=${encodeURIComponent(state.xssPayload)}`;

  return createResult(
    state,
    flag,
    'payload 已进入受害者页面。需要浏览器真实执行并访问收集端点。',
    openUrl,
    false,
    { openUrl }
  );
};

const runCsrf = (scenario, state, flag, input) => {
  const request = scenario.index === 0
    ? Object.fromEntries(new URLSearchParams(input.includes('?') ? input.split('?').slice(1).join('?') : input))
    : Object.fromEntries(new URLSearchParams(input));
  const hasTokenProof = input.includes(scenario.proof);
  const changed = request.email === 'attacker@relum.local' && (scenario.index < 2 || hasTokenProof);

  if (changed) {
    state.accountEmail = request.email;
  }

  return createResult(
    state,
    flag,
    changed ? '状态变更请求已使用受害者会话执行。' : '请求未满足当前状态变更条件。',
    JSON.stringify({ email: state.accountEmail, tokenRequired: scenario.index === 2 }, null, 2),
    changed
  );
};

const runUpload = (scenario, state, flag, input, challengeDir) => {
  const upload = parseJsonInput(input);
  const filename = safeFileName(upload.filename);
  const mime = String(upload.mime || 'application/octet-stream');
  const content = String(upload.content || '');
  const lowerName = filename.toLowerCase();
  let accepted = false;

  if (scenario.index === 0) {
    accepted = lowerName.endsWith('.php') && content.includes('RELUM_PROBE');
  } else if (scenario.index === 1) {
    accepted = mime === 'image/png' && lowerName.endsWith('.php') && content.includes('RELUM_PROBE');
  } else if (scenario.index === 2) {
    accepted = /\.php\.(?:jpg|png)$/.test(lowerName) && content.includes('RELUM_PROBE');
  } else if (scenario.index === 3) {
    accepted = content.startsWith('PNG') && content.includes('RELUM_PROBE');
  } else if (scenario.index === 4) {
    accepted = /^image\//.test(mime) && /metadata.*RELUM_PROBE/is.test(content);
  } else {
    accepted = lowerName === 'race.php' && content.includes('RELUM_PROBE');
  }

  if (!accepted) {
    return createResult(state, flag, '上传被当前校验链拒绝。', JSON.stringify({ filename, mime }, null, 2));
  }

  const storedPath = path.join(challengeDir, 'uploads', filename);
  fs.writeFileSync(storedPath, content);
  return createResult(
    state,
    flag,
    '文件已落盘，服务端二次处理触发了训练标记。',
    `${storedPath}\n${flag}`,
    true
  );
};

const runFileRead = (scenario, state, flag, input, challengeDir) => {
  let requested = input.trim();
  if (scenario.index >= 3) {
    try {
      requested = decodeURIComponent(decodeURIComponent(requested));
    } catch {
      return createResult(state, flag, '路径编码无效。');
    }
  }

  let encodeOutput = false;
  const filterPrefix = 'php://filter/convert.base64-encode/resource=';
  if (requested.startsWith(filterPrefix)) {
    encodeOutput = true;
    requested = requested.slice(filterPrefix.length);
  }

  requested = requested.replace(/\0.*$/, '');
  const publicRoot = path.join(challengeDir, 'public');
  const resolvedPath = path.isAbsolute(requested)
    ? requested
    : path.resolve(publicRoot, requested);

  try {
    const content = fs.readFileSync(resolvedPath, 'utf8');
    const output = encodeOutput ? Buffer.from(content).toString('base64') : content;
    const solved = content.includes(flag);
    return createResult(state, flag, '文件读取完成。', output, solved);
  } catch (error) {
    return createResult(state, flag, '文件读取失败。', error.code || error.message);
  }
};

const runCommand = (scenario, state, flag, input, isolated) => new Promise((resolve) => {
  if (!isolated) {
    resolve(createResult(
      state,
      flag,
      '命令类靶场只能在隔离容器内运行。',
      'RELUM_LAB_ISOLATED=1 is required'
    ));
    return;
  }

  const candidate = input.trim().slice(0, 400);
  let command = `printf 'PING ${candidate}\\n'`;

  if (scenario.index === 2 && candidate.includes('/challenge/flag.txt')) {
    command = 'cat /challenge/flag.txt';
  } else if (candidate) {
    command = `printf 'PING '; ${candidate}`;
  }

  execFile('/bin/sh', ['-c', command], {
    timeout: 1500,
    maxBuffer: 32 * 1024,
    env: { PATH: '/usr/local/bin:/usr/bin:/bin' },
  }, (error, stdout, stderr) => {
    const output = `${stdout || ''}${stderr || ''}`.trim();
    resolve(createResult(
      state,
      flag,
      error ? '命令执行结束并返回错误。' : '功能命令执行完成。',
      output,
      output.includes(flag)
    ));
  });
});

const runXxe = (scenario, state, flag, input, challengeDir) => {
  const entityMatch = input.match(/<!ENTITY\s+([A-Za-z][\w.-]*)\s+SYSTEM\s+["']file:\/\/([^"']+)["']\s*>/i);
  if (!entityMatch) {
    return createResult(state, flag, 'XML 已解析，但未发现可处理的外部文件实体。');
  }

  const [, entityName, filePath] = entityMatch;
  const resolved = filePath.startsWith('/') ? filePath : path.join(challengeDir, filePath);
  try {
    const fileContent = fs.readFileSync(resolved, 'utf8');
    const expanded = input.replace(new RegExp(`&${entityName};`, 'g'), fileContent);
    const output = scenario.index === 0
      ? expanded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : `parser-log entity=${entityName} value=${fileContent.trim()}`;
    return createResult(state, flag, 'XML 实体解析完成。', output, output.includes(flag));
  } catch (error) {
    return createResult(state, flag, '外部实体读取失败。', error.code || error.message);
  }
};

const runLogic = (scenario, state, flag, input) => {
  const data = parseJsonInput(input);
  const predicates = [
    data.username === 'admin',
    data.token === 'WELCOME' && Number(data.times) >= 2,
    data.captcha === '2468' && Number(data.attempts) >= 2,
    Number(data.price) <= 0,
    String(data.objectId) === '1002',
    data.role === 'admin',
    String(data.path || '').includes('private'),
    /(?:'|")\s*or\s+/i.test(String(data.username || '')),
    data.resetUser === 'admin' && data.email === 'attacker@relum.local',
    data.username === 'admin' && data.password === '',
  ];
  const solved = Boolean(predicates[scenario.index]);
  return createResult(
    state,
    flag,
    solved ? '业务流程接受了非预期状态。' : '业务请求已处理，但未越过目标边界。',
    JSON.stringify({ accepted: solved, index: scenario.index }, null, 2),
    solved
  );
};

const runAuth = (scenario, state, flag, input) => {
  const data = parseJsonInput(input);
  const predicates = [
    data.username === 'admin' && data.password === 'admin123',
    data.username === 'admin' && (data.mfa === '000000' || data.skipMfa === true),
    data.sessionId === 'fixed-session' && data.username === 'admin',
    data.resetUser === 'admin' && data.token === 'guest-reset-token',
  ];
  const solved = Boolean(predicates[scenario.index]);
  return createResult(
    state,
    flag,
    solved ? '管理员会话已签发。' : '认证失败。',
    solved ? 'role=admin session=training-admin' : 'role=anonymous',
    solved
  );
};

const runAccess = (scenario, state, flag, input) => {
  const data = parseJsonInput(input);
  const predicates = [
    String(data.objectId) === '1002',
    data.role === 'admin',
    String(data.path) === '/admin/export',
    data.tenant === 'beta' && data.objectId === 'invoice-7',
  ];
  const solved = Boolean(predicates[scenario.index]);
  return createResult(
    state,
    flag,
    solved ? '服务端返回了越权资源。' : '当前身份只能访问自己的资源。',
    JSON.stringify({ currentUser: '1001', authorized: solved }, null, 2),
    solved
  );
};

const runApi = (scenario, state, flag, input) => {
  const data = parseJsonInput(input);
  const predicates = [
    String(data.id) === '1002',
    data.role === 'admin' || data.isAdmin === true,
    /secret|vault|admin/i.test(String(data.query || '')),
    Number(data.requests) > 20 || data.verboseErrors === true,
  ];
  const solved = Boolean(predicates[scenario.index]);
  return createResult(
    state,
    flag,
    solved ? 'API 返回了不应暴露的数据。' : 'API 请求完成，未触达目标数据。',
    JSON.stringify({ acceptedFields: Object.keys(data), protectedData: solved ? flag : '[redacted]' }, null, 2),
    solved
  );
};

const runDeserialize = (scenario, state, flag, input) => {
  const predicates = [
    /(?:Runtime|ProcessBuilder|TemplatesImpl)/i.test(input),
    /(?:__wakeup|__destruct|O:\d+:)/i.test(input),
    /(?:pickle|GLOBAL|REDUCE|cos\s+system)/i.test(input),
    /"version"\s*:\s*0/.test(input) && /"signature"\s*:\s*"valid"/.test(input),
  ];
  const solved = Boolean(predicates[scenario.index]);
  return createResult(
    state,
    flag,
    solved ? '对象恢复触发了受控危险行为。' : '对象已拒绝或仅恢复为普通数据。',
    solved ? `deserialization proof\n${flag}` : 'safe object',
    solved
  );
};

const decodeJwtPart = (value) => {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    return {};
  }
};

const runToken = (scenario, state, flag, input) => {
  let solved = false;
  let details = {};

  if (scenario.index <= 1) {
    const [encodedHeader = '', encodedPayload = '', signature = ''] = input.trim().split('.');
    const header = decodeJwtPart(encodedHeader);
    const payload = decodeJwtPart(encodedPayload);
    details = { header, payload };

    if (scenario.index === 0) {
      solved = header.alg === 'none' && payload.role === 'admin' && signature === '';
    } else {
      const expected = crypto
        .createHmac('sha256', 'secret')
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
      solved = payload.role === 'admin' && signature === expected;
    }
  } else if (scenario.index === 2) {
    const data = parseJsonInput(input);
    solved = /^https?:\/\/attacker\.local\//.test(String(data.redirectUri || data.redirect_uri || ''));
    details = data;
  } else {
    const data = parseJsonInput(input);
    solved = String(data.scope || '').split(/\s+/).includes('admin') && Number(data.expiresIn) > 86400;
    details = data;
  }

  return createResult(
    state,
    flag,
    solved ? '令牌被错误地授予管理员权限。' : '令牌未通过目标条件。',
    JSON.stringify(details, null, 2),
    solved
  );
};

const runGenericAnswer = (scenario, state, flag, input) => {
  const solved = crypto.timingSafeEqual(
    Buffer.from(input.trim().padEnd(scenario.answer.length, '\0').slice(0, scenario.answer.length)),
    Buffer.from(scenario.answer)
  ) && input.trim().length === scenario.answer.length;

  return createResult(
    state,
    flag,
    solved ? '工件分析结果正确。' : '结果不匹配，请回到工件重新建立证据链。',
    solved ? scenario.answer : 'incorrect',
    solved
  );
};

const createLabServer = (options = {}) => {
  const knowledgeId = options.knowledgeId || process.env.RELUM_KNOWLEDGE_ID;
  const sectionTitle = options.sectionTitle || process.env.RELUM_SECTION_TITLE;
  const flag = options.flag || process.env.RELUM_FLAG || process.env.FLAG;
  const port = Number(options.port ?? process.env.PORT ?? DEFAULT_PORT);
  const isolated = options.isolated ?? process.env.RELUM_LAB_ISOLATED === '1';
  const challengeDir = path.resolve(
    options.challengeDir ||
    process.env.RELUM_CHALLENGE_DIR ||
    path.join('/tmp', `relum-lab-${process.pid}`)
  );
  const scenario = createScenario(knowledgeId, sectionTitle);

  if (!scenario) {
    throw new Error(`未知靶场题目: ${knowledgeId}/${sectionTitle}`);
  }
  if (!flag || !/^flag\{[^}]+\}$/.test(flag)) {
    throw new Error('RELUM_FLAG 未注入或格式无效');
  }

  const state = createRuntimeState(scenario, flag, challengeDir);

  const executeAction = async (input) => {
    switch (scenario.engine) {
      case 'sql':
        return runSql(scenario, state, flag, input);
      case 'xss':
        return runXss(scenario, state, flag, input);
      case 'csrf':
        return runCsrf(scenario, state, flag, input);
      case 'upload':
        return runUpload(scenario, state, flag, input, challengeDir);
      case 'file-read':
        return runFileRead(scenario, state, flag, input, challengeDir);
      case 'command':
        return runCommand(scenario, state, flag, input, isolated);
      case 'xxe':
        return runXxe(scenario, state, flag, input, challengeDir);
      case 'logic':
        return runLogic(scenario, state, flag, input);
      case 'auth':
        return runAuth(scenario, state, flag, input);
      case 'access':
        return runAccess(scenario, state, flag, input);
      case 'api':
        return runApi(scenario, state, flag, input);
      case 'deserialize':
        return runDeserialize(scenario, state, flag, input);
      case 'token':
        return runToken(scenario, state, flag, input);
      case 'ssrf': {
        let target = input.trim();
        try {
          target = decodeURIComponent(target);
        } catch {
          return createResult(state, flag, 'URL 编码无效。');
        }

        if (/169\.254\.169\.254|127\.0\.0\.1|localhost/.test(target)) {
          target = `http://127.0.0.1:${port}/internal/metadata`;
        } else {
          return createResult(state, flag, '出站请求被训练环境限制为本机内部地址。');
        }

        try {
          const response = await fetch(target, { redirect: 'follow' });
          const output = await response.text();
          return createResult(state, flag, '服务端请求完成。', output, output.includes(flag));
        } catch (error) {
          return createResult(state, flag, '服务端请求失败。', error.message);
        }
      }
      default:
        return runGenericAnswer(scenario, state, flag, input);
    }
  };

  const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);

    try {
      if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
        json(res, 200, { status: 'ok', scenarioId: scenario.id });
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/api/scenario') {
        json(res, 200, toPublicScenario(scenario));
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/api/status') {
        json(res, 200, {
          solved: state.solved,
          solvedAt: state.solvedAt,
          ...(state.solved ? { flag } : {}),
        });
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/artifact') {
        text(res, 200, `${scenario.artifact}\n`);
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/internal/metadata') {
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) {
          text(res, 403, 'internal only');
          return;
        }
        text(res, 200, `role=training-metadata\n${flag}\n`);
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/api/csrf/state') {
        json(res, 200, {
          email: state.accountEmail,
          token: scenario.index === 2 ? scenario.proof : undefined,
        });
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/api/xss/collect') {
        const proof = requestUrl.searchParams.get('proof') || '';
        const solved = proof.includes(scenario.proof);
        const result = createResult(
          state,
          flag,
          solved ? '浏览器脚本已回传管理员 Cookie。' : '未收到有效的管理员 Cookie。',
          proof,
          solved
        );
        json(res, solved ? 200 : 422, result);
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/victim') {
        const reflected = requestUrl.searchParams.get('input') || state.xssPayload;
        const sink = scenario.index === 2
          ? '<div id="sink"></div><script>document.getElementById("sink").innerHTML = decodeURIComponent(location.hash.slice(1));</script>'
          : `<div id="sink">${reflected}</div>`;
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'Set-Cookie': `admin_token=${scenario.proof}; Path=/; SameSite=Lax`,
        });
        res.end(`<!doctype html><html><head><meta charset="utf-8"><title>ReLum Victim</title></head><body><h1>受害者预览</h1>${sink}</body></html>`);
        return;
      }

      if (req.method === 'POST' && requestUrl.pathname === '/api/action') {
        const action = await parseActionBody(req);
        const result = await executeAction(action.input);
        json(res, 200, result);
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/app.js') {
        text(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, 'app.js'), 'utf8'), 'text/javascript; charset=utf-8');
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/styles.css') {
        text(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, 'styles.css'), 'utf8'), 'text/css; charset=utf-8');
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/') {
        text(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8'), 'text/html; charset=utf-8');
        return;
      }

      json(res, 404, { error: 'not_found' });
    } catch (error) {
      json(res, 400, { error: 'request_failed', message: error.message });
    }
  });

  return {
    challengeDir,
    scenario,
    server,
    state,
    start: () => new Promise((resolve) => {
      server.listen(port, '0.0.0.0', () => resolve(server.address()));
    }),
    stop: () => new Promise((resolve, reject) => {
      state.sql?.close();
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
};

if (require.main === module) {
  const runtime = createLabServer();
  runtime.start().then((address) => {
    console.log(`ReLum lab ${runtime.scenario.id} listening on ${address.port}`);
  });
}

module.exports = {
  createLabServer,
};
