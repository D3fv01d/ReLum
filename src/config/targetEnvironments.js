// 靶场环境配置

// 生成随机端口函数 (范围: 10000-65000)
const getRandomPort = () => Math.floor(Math.random() * 55000) + 10000;

const targetEnvironments = {
  // SQL注入漏洞靶场
  'sql-injection': {
    title: 'SQL注入漏洞',
    description: 'SQL注入漏洞实验环境，包含各种SQL注入类型的练习',
    sections: {
      '字符型SQL注入': {
        dockerImage: 'relum/sql-char-injection:latest',
        port: null, // 设置为null，启动时随机分配
        internalPort: 80,
        description: '字符型SQL注入实验环境，适合初学者练习',
        defaultInstall: true
      },
      '数值型SQL注入': {
        dockerImage: 'relum/sql-numeric-injection:latest',
        port: null,
        internalPort: 80,
        description: '数值型SQL注入实验环境，无需引号闭合',
        defaultInstall: true
      },
      '联合注入': {
        dockerImage: 'relum/sql-union-injection:latest',
        port: null,
        internalPort: 80,
        description: '联合查询注入实验环境，练习UNION语句提取数据',
        defaultInstall: true
      },
      '报错注入': {
        dockerImage: 'relum/sql-error-injection:latest',
        port: null,
        internalPort: 80,
        description: '报错注入实验环境，利用数据库错误消息获取信息',
        defaultInstall: false
      },
      '布尔盲注': {
        dockerImage: 'relum/sql-blind-boolean:latest',
        port: null,
        internalPort: 80,
        description: '布尔盲注实验环境，通过真假响应推断数据',
        defaultInstall: false
      },
      '时间盲注': {
        dockerImage: 'relum/sql-blind-time:latest',
        port: null,
        internalPort: 80,
        description: '时间盲注实验环境，利用时间延迟推断数据',
        defaultInstall: false
      },
      '二阶注入': {
        dockerImage: 'relum/sql-second-order:latest',
        port: null,
        internalPort: 80,
        description: '二阶注入实验环境，练习存储和触发注入攻击',
        defaultInstall: false
      },
      '绕过技术': {
        dockerImage: 'relum/sql-bypass:latest',
        port: null,
        internalPort: 80,
        description: 'SQL注入绕过技术实验环境，练习各种绕过防护的方法',
        defaultInstall: false
      }
    }
  },
  
  // XSS跨站脚本漏洞靶场
  'xss': {
    title: '跨站脚本漏洞',
    description: '跨站脚本(XSS)漏洞实验环境，涵盖各种XSS类型和利用方法',
    sections: {
      '反射型跨站脚本': {
        dockerImage: 'relum/xss-reflected:latest',
        port: null,
        internalPort: 80,
        description: '反射型XSS实验环境，练习通过URL参数等触发的XSS',
        defaultInstall: true
      },
      '存储型跨站脚本': {
        dockerImage: 'relum/xss-stored:latest',
        port: null,
        internalPort: 80,
        description: '存储型XSS实验环境，练习持久化存储的XSS攻击',
        defaultInstall: true
      },
      'DOM型跨站脚本': {
        dockerImage: 'relum/xss-dom:latest',
        port: null,
        internalPort: 80,
        description: 'DOM型XSS实验环境，练习客户端JavaScript引起的XSS',
        defaultInstall: false
      },
      '利用XSS平台获取Cookie': {
        dockerImage: 'dogls/xss-demo:1.0',
        port: null,
        internalPort: 80,
        description: 'XSS Cookie窃取实验环境，练习利用XSS窃取用户会话',
        defaultInstall: false
      }
    }
  },
  
  // CSRF跨站请求伪造漏洞靶场
  'csrf': {
    title: '跨站请求伪造漏洞',
    description: '跨站请求伪造(CSRF)漏洞实验环境，练习如何构造和利用CSRF漏洞',
    sections: {
      'GET型CSRF': {
        dockerImage: 'relum/csrf-get:latest',
        port: null,
        internalPort: 80,
        description: 'GET型CSRF实验环境，利用简单请求构造攻击',
        defaultInstall: true
      },
      'POST型CSRF': {
        dockerImage: 'relum/csrf-post:latest',
        port: null,
        internalPort: 80,
        description: 'POST型CSRF实验环境，利用表单提交构造攻击',
        defaultInstall: true
      },
      'CSRF漏洞POC改造': {
        dockerImage: 'relum/csrf-advanced:latest',
        port: null,
        internalPort: 80,
        description: 'CSRF高级利用实验环境，练习复杂CSRF攻击场景',
        defaultInstall: false
      }
    }
  },
  
  // 文件上传漏洞靶场
  'file-upload': {
    title: '任意文件上传漏洞',
    description: '文件上传漏洞实验环境，包含各种上传限制绕过方法的练习',
    sections: {
      'JavaScript校验绕过': {
        dockerImage: 'aicit11/upliad:v1.2',
        port: null,
        internalPort: 6789,
        description: '前端JavaScript校验绕过实验环境',
        defaultInstall: true
      },
      'MIME类型检测绕过': {
        dockerImage: 'relum/upload-mime-bypass:latest',
        port: null,
        internalPort: 80,
        description: 'MIME类型检测绕过实验环境',
        defaultInstall: true
      },
      '扩展名校验绕过': {
        dockerImage: 'relum/upload-ext-bypass:latest',
        port: null,
        internalPort: 80,
        description: '文件扩展名校验绕过实验环境',
        defaultInstall: false
      },
      '文件内容检测绕过': {
        dockerImage: 'relum/upload-content-bypass:latest',
        port: null,
        internalPort: 80,
        description: '文件内容检测绕过实验环境',
        defaultInstall: false
      }
    }
  },
  
  // 文件下载漏洞靶场
  'file-download': {
    title: '任意文件下载漏洞',
    description: '文件下载漏洞实验环境，练习如何利用文件下载漏洞获取敏感信息',
    sections: {
      '路径遍历': {
        dockerImage: 'relum/download-path-traversal:latest',
        port: null,
        internalPort: 80,
        description: '路径遍历漏洞实验环境，练习目录穿越获取敏感文件',
        defaultInstall: true
      },
      '未授权文件下载': {
        dockerImage: 'relum/download-unauth:latest',
        port: null,
        internalPort: 80,
        description: '未授权文件下载漏洞实验环境',
        defaultInstall: true
      },
      '敏感文件获取': {
        dockerImage: 'relum/download-sensitive:latest',
        port: null,
        internalPort: 80,
        description: '敏感文件获取实验环境，练习常见敏感文件的寻找和利用',
        defaultInstall: false
      }
    }
  },
  
  // 命令/代码执行漏洞靶场
  'command-execution': {
    title: '命令/代码执行漏洞',
    description: '命令和代码执行漏洞实验环境，练习如何利用执行类漏洞获取系统控制权',
    sections: {
      '命令执行基础': {
        dockerImage: 'relum/command-exec-basic:latest',
        port: null,
        internalPort: 80,
        description: '基础命令执行漏洞实验环境',
        defaultInstall: true
      },
      '绕过字符串过滤限制': {
        dockerImage: 'relum/command-exec-bypass:latest',
        port: null,
        internalPort: 80,
        description: '命令执行过滤绕过实验环境',
        defaultInstall: true
      },
      '无回显命令执行': {
        dockerImage: 'relum/command-exec-blind:latest',
        port: null,
        internalPort: 80,
        description: '无回显命令执行实验环境，练习盲注技术',
        defaultInstall: false
      },
      '反弹shell': {
        dockerImage: 'relum/command-exec-revshell:latest',
        port: null,
        internalPort: 80,
        description: '反弹shell实验环境，练习建立反向连接',
        defaultInstall: false
      }
    }
  },
  
  // 文件包含漏洞靶场
  'file-inclusion': {
    title: '文件包含漏洞',
    description: '文件包含漏洞实验环境，练习本地和远程文件包含的利用',
    sections: {
      '基础文件包含': {
        dockerImage: 'aicit11/fileinclude:v1.0',
        port: null,
        internalPort: 80,
        description: '基础文件包含漏洞实验环境',
        defaultInstall: true
      },
      '敏感文件读取': {
        dockerImage: 'relum/file-inclusion-sensitive:latest',
        port: null,
        internalPort: 80,
        description: '敏感文件读取实验环境',
        defaultInstall: true
      },
      '日志文件包含': {
        dockerImage: 'relum/file-inclusion-log:latest',
        port: null,
        internalPort: 80,
        description: '日志文件包含实验环境，练习日志毒化技术',
        defaultInstall: false
      },
      'SESSION文件包含': {
        dockerImage: 'relum/file-inclusion-session:latest',
        port: null,
        internalPort: 80,
        description: 'SESSION文件包含实验环境',
        defaultInstall: false
      }
    }
  },
  
  // XXE漏洞靶场
  'xxe': {
    title: 'XML外部实体注入漏洞',
    description: 'XML外部实体注入(XXE)漏洞实验环境，练习如何利用XXE漏洞',
    sections: {
      '有回显的XXE': {
        dockerImage: 'relum/xxe-echo:latest',
        port: null,
        internalPort: 80,
        description: '有回显的XXE漏洞实验环境',
        defaultInstall: true
      },
      '无回显的XXE': {
        dockerImage: 'relum/xxe-blind:latest',
        port: null,
        internalPort: 80,
        description: '无回显的XXE漏洞实验环境，练习带外数据通道技术',
        defaultInstall: false
      }
    }
  },
  
  // 业务逻辑漏洞靶场
  'logic-flaw': {
    title: '业务逻辑漏洞',
    description: '业务逻辑漏洞实验环境，练习如何发现和利用应用程序逻辑缺陷',
    sections: {
      '用户名遍历': {
        dockerImage: 'relum/logic-username-enum:latest',
        port: null,
        internalPort: 80,
        description: '用户名枚举漏洞实验环境',
        defaultInstall: true
      },
      '验证码复用': {
        dockerImage: 'relum/logic-captcha-reuse:latest',
        port: null,
        internalPort: 80,
        description: '验证码复用漏洞实验环境',
        defaultInstall: true
      },
      '支付逻辑': {
        dockerImage: 'relum/logic-payment:latest',
        port: null,
        internalPort: 80,
        description: '支付逻辑漏洞实验环境，练习价格篡改等攻击',
        defaultInstall: false
      },
      '越权访问': {
        dockerImage: 'relum/logic-authz-bypass:latest',
        port: null,
        internalPort: 80,
        description: '横向越权和纵向越权漏洞实验环境',
        defaultInstall: false
      }
    }
  },
  
  // 中间件漏洞靶场
  'middleware': {
    title: '中间件漏洞',
    description: '中间件漏洞实验环境，练习各种Web服务中间件的漏洞利用',
    sections: {
      'Weblogic漏洞利用': {
        dockerImage: 'relum/middleware-weblogic:latest',
        port: null,
        internalPort: 7001,
        description: 'Weblogic典型漏洞利用实验环境',
        defaultInstall: true
      },
      'Tomcat漏洞利用': {
        dockerImage: 'relum/middleware-tomcat:latest',
        port: null,
        internalPort: 8080,
        description: 'Tomcat典型漏洞利用实验环境',
        defaultInstall: true
      },
      'Jboss漏洞利用': {
        dockerImage: 'relum/middleware-jboss:latest',
        port: null,
        internalPort: 8080,
        description: 'Jboss典型漏洞利用实验环境',
        defaultInstall: false
      }
    }
  },
  
  // 组件漏洞靶场
  'components': {
    title: '组件漏洞',
    description: '组件漏洞实验环境，练习常见开源组件的漏洞利用',
    sections: {
      'Shiro漏洞利用': {
        dockerImage: 'relum/component-shiro:latest',
        port: null,
        internalPort: 8080,
        description: 'Apache Shiro漏洞利用实验环境',
        defaultInstall: true
      },
      'Fastjson漏洞利用': {
        dockerImage: 'relum/component-fastjson:latest',
        port: null,
        internalPort: 8080,
        description: 'Fastjson反序列化漏洞利用实验环境',
        defaultInstall: true
      },
      'Log4j漏洞利用': {
        dockerImage: 'relum/component-log4j:latest',
        port: null,
        internalPort: 8080,
        description: 'Log4j远程代码执行漏洞利用实验环境',
        defaultInstall: false
      }
    }
  },
  
  // 框架漏洞靶场
  'frameworks': {
    title: '第三方框架漏洞',
    description: '第三方框架漏洞实验环境，练习各种流行Web框架的漏洞利用',
    sections: {
      'Thinkphp漏洞利用': {
        dockerImage: 'relum/framework-thinkphp:latest',
        port: null,
        internalPort: 80,
        description: 'Thinkphp框架漏洞利用实验环境',
        defaultInstall: true
      },
      'Struts2漏洞利用': {
        dockerImage: 'relum/framework-struts2:latest',
        port: null,
        internalPort: 8080,
        description: 'Struts2框架漏洞利用实验环境',
        defaultInstall: true
      },
      'Spring漏洞利用': {
        dockerImage: 'relum/framework-spring:latest',
        port: null,
        internalPort: 8080,
        description: 'Spring框架漏洞利用实验环境',
        defaultInstall: false
      },
      '若依框架漏洞利用': {
        dockerImage: 'relum/framework-ruoyi:latest',
        port: null,
        internalPort: 80,
        description: '若依框架漏洞利用实验环境',
        defaultInstall: false
      }
    }
  },
  
  // CMS漏洞靶场
  'cms': {
    title: 'CMS漏洞利用实战',
    description: 'CMS漏洞利用实验环境，练习各种常见内容管理系统的漏洞利用',
    sections: {
      'Wordpress漏洞利用': {
        dockerImage: 'relum/cms-wordpress:latest',
        port: null,
        internalPort: 80,
        description: 'Wordpress漏洞利用实验环境',
        defaultInstall: true
      },
      'Drupal漏洞利用': {
        dockerImage: 'relum/cms-drupal:latest',
        port: null,
        internalPort: 80,
        description: 'Drupal漏洞利用实验环境',
        defaultInstall: false
      },
      'Joomla漏洞利用': {
        dockerImage: 'relum/cms-joomla:latest',
        port: null,
        internalPort: 80,
        description: 'Joomla漏洞利用实验环境',
        defaultInstall: false
      }
    }
  },
  
  // 数据库漏洞靶场
  'database': {
    title: '数据库漏洞利用实战',
    description: '数据库漏洞利用实验环境，练习各种数据库服务的漏洞利用',
    sections: {
      'MySQL典型漏洞利用': {
        dockerImage: 'relum/db-mysql:latest',
        port: null,
        internalPort: 3306,
        description: 'MySQL漏洞利用实验环境，练习MySQL安全漏洞利用技术',
        defaultInstall: true
      },
      'Redis典型漏洞利用': {
        dockerImage: 'aicit11/redis:v1.3',
        port: null,
        internalPort: 5000,
        description: 'Redis漏洞利用实验环境，练习Redis未授权访问和安全漏洞利用',
        defaultInstall: true
      },
      'PostgreSQL典型漏洞利用': {
        dockerImage: 'relum/db-postgresql:latest',
        port: null,
        internalPort: 5432,
        description: 'PostgreSQL漏洞利用实验环境，练习PostgreSQL安全漏洞利用',
        defaultInstall: false
      }
    }
  }
};

export { targetEnvironments, getRandomPort as default }; 