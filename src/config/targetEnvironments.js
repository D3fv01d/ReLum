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
        defaultInstall: true,
        flag: 'flag{sql_char_injection_6e7df9a}'
      },
      '数值型SQL注入': {
        dockerImage: 'relum/sql-numeric-injection:latest',
        port: null,
        internalPort: 80,
        description: '数值型SQL注入实验环境，无需引号闭合',
        defaultInstall: true,
        flag: 'flag{sql_numeric_injection_9c34b2d}'
      },
      '联合注入': {
        dockerImage: 'relum/sql-union-injection:latest',
        port: null,
        internalPort: 80,
        description: '联合查询注入实验环境，练习UNION语句提取数据',
        defaultInstall: true,
        flag: 'flag{sql_union_injection_2a57f8c}'
      },
      '报错注入': {
        dockerImage: 'relum/sql-error-injection:latest',
        port: null,
        internalPort: 80,
        description: '报错注入实验环境，利用数据库错误消息获取信息',
        defaultInstall: false,
        flag: 'flag{sql_error_injection_8d19e6b}'
      },
      '布尔盲注': {
        dockerImage: 'relum/sql-blind-boolean:latest',
        port: null,
        internalPort: 80,
        description: '布尔盲注实验环境，通过真假响应推断数据',
        defaultInstall: false,
        flag: 'flag{sql_blind_boolean_3c46a7d}'
      },
      '时间盲注': {
        dockerImage: 'relum/sql-blind-time:latest',
        port: null,
        internalPort: 80,
        description: '时间盲注实验环境，利用时间延迟推断数据',
        defaultInstall: false,
        flag: 'flag{sql_blind_time_5f82c9e}'
      },
      '二阶注入': {
        dockerImage: 'relum/sql-second-order:latest',
        port: null,
        internalPort: 80,
        description: '二阶注入实验环境，练习存储和触发注入攻击',
        defaultInstall: false,
        flag: 'flag{sql_second_order_7b93d5a}'
      },
      '绕过技术': {
        dockerImage: 'relum/sql-bypass:latest',
        port: null,
        internalPort: 80,
        description: 'SQL注入绕过技术实验环境，练习各种绕过防护的方法',
        defaultInstall: false,
        flag: 'flag{sql_bypass_techniques_1e74f3c}'
      }
    }
  },
  
  // XSS跨站脚本漏洞靶场
  'xss': {
    title: '跨站脚本漏洞',
    description: '跨站脚本(XSS)漏洞实验环境，涵盖各种XSS类型和利用方法',
    sections: {
      '反射型跨站脚本': {
        dockerImage: 'dogls/xss-reflect:latest',
        port: null,
        internalPort: 5000,
        description: '反射型XSS实验环境，练习通过URL参数等触发的XSS',
        defaultInstall: true,
        flag: 'CTF{94a375e3d6eecc6d}'
      },
      '存储型跨站脚本': {
        dockerImage: 'dogls/xss-storage:latest',
        port: null,
        internalPort: 5000,
        description: '存储型XSS实验环境，练习持久化存储的XSS攻击',
        defaultInstall: true,
        flag: 'flag{this_is_a_fake_flag_for_demo}'
      },
      'DOM型跨站脚本': {
        dockerImage: 'dogls/xss-dom:latest',
        port: null,
        internalPort: 5000,
        description: 'DOM型XSS实验环境，练习客户端JavaScript引起的XSS',
        defaultInstall: false,
        flag: 'FLAG{DOM_XSS_SUCCESS}'
      },
      '利用XSS平台获取Cookie': {
        dockerImage: 'dogls/xss-demo:1.0',
        port: null,
        internalPort: 80,
        description: 'XSS Cookie窃取实验环境，练习利用XSS窃取用户会话',
        defaultInstall: false,
        flag: 'flag{xss_cookie_stealer_9e57b3d}'
      }
    }
  },
  
  // CSRF跨站请求伪造漏洞靶场
  'csrf': {
    title: '跨站请求伪造漏洞',
    description: '跨站请求伪造(CSRF)漏洞实验环境，练习如何构造和利用CSRF漏洞',
    sections: {
      'GET型CSRF': {
        dockerImage: 'dogls/csrf-get:latest',
        port: null,
        internalPort: 5000,
        description: 'GET型CSRF实验环境，利用简单请求构造攻击',
        defaultInstall: true,
        flag: 'flag{H0w_T0_Use_Flask_For_Web_Dev}'
      },
      'POST型CSRF': {
        dockerImage: 'dogls/csrf-post:latest',
        port: null,
        internalPort: 5000,
        description: 'POST型CSRF实验环境，利用表单提交构造攻击',
        defaultInstall: true,
        flag: 'flag{H0w_T0_Use_Flask_For_Web_Dev}'
      },
      'CSRF Token窃取': {
        dockerImage: 'dogls/csrf-token:latest',
        port: null,
        internalPort: 5000,
        description: 'CSRF Token窃取实验环境，练习绕过Token防护的攻击方法',
        defaultInstall: false,
        flag: 'FLAG{CSRF_ATTACK_SUCCESSFUL}'
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
        defaultInstall: true,
        flag: 'flag{upload_js_bypass_4a73c9e}'
      },
      'MIME类型检测绕过': {
        dockerImage: 'relum/upload-mime-bypass:latest',
        port: null,
        internalPort: 80,
        description: 'MIME类型检测绕过实验环境',
        defaultInstall: true,
        flag: 'flag{upload_mime_bypass_2b86f5d}'
      },
      '扩展名校验绕过': {
        dockerImage: 'relum/upload-ext-bypass:latest',
        port: null,
        internalPort: 80,
        description: '文件扩展名校验绕过实验环境',
        defaultInstall: false,
        flag: 'flag{upload_ext_bypass_9c51a7e}'
      },
      '文件内容检测绕过': {
        dockerImage: 'relum/upload-content-bypass:latest',
        port: null,
        internalPort: 80,
        description: '文件内容检测绕过实验环境',
        defaultInstall: false,
        flag: 'flag{upload_content_bypass_6e42b8f}'
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
        defaultInstall: true,
        flag: 'flag{download_path_traversal_8d52f7a}'
      },
      '未授权文件下载': {
        dockerImage: 'relum/download-unauth:latest',
        port: null,
        internalPort: 80,
        description: '未授权文件下载漏洞实验环境',
        defaultInstall: true,
        flag: 'flag{download_unauth_access_3e91c6b}'
      },
      '敏感文件获取': {
        dockerImage: 'relum/download-sensitive:latest',
        port: null,
        internalPort: 80,
        description: '敏感文件获取实验环境，练习常见敏感文件的寻找和利用',
        defaultInstall: false,
        flag: 'flag{download_sensitive_files_7a45d9c}'
      }
    }
  },
  
  // 命令/代码执行漏洞靶场
  'command-execution': {
    title: '命令/代码执行漏洞',
    description: '命令和代码执行漏洞实验环境，练习如何利用执行类漏洞获取系统控制权',
    sections: {
      'PHP命令执行': {
        dockerImage: 'dogls/php-exec:latest',
        port: null,
        internalPort: 80,
        description: 'PHP命令执行漏洞实验环境',
        defaultInstall: true,
        flag: 'FLAG{PHP_C0mm4nd_Ex3cut10n_Vuln3r4b1l1ty}'
      },
      'Java命令执行': {
        dockerImage: 'dogls/java-exec:latest',
        port: null,
        internalPort: 8080,
        description: 'Java命令执行漏洞实验环境',
        defaultInstall: true,
        flag: 'FLAG{J4v4_D3s3r14l1z4t10n_4nd_RCE}'
      },
      'Python模板注入': {
        dockerImage: 'dogls/python-ssti:latest',
        port: null,
        internalPort: 5000,
        description: 'Python模板注入命令执行实验环境',
        defaultInstall: false,
        flag: 'FLAG{SSTI_Vuln3r4b1l1ty_T3mpl4t3_1nj3ct10n}'
      },
      '反弹shell': {
        dockerImage: 'relum/command-exec-revshell:latest',
        port: null,
        internalPort: 80,
        description: '反弹shell实验环境，练习建立反向连接',
        defaultInstall: false,
        flag: 'flag{command_revshell_5c83a9f}'
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
        defaultInstall: true,
        flag: 'flag{LFI_basic_achieved_78a6dd1}'
      },
      '敏感文件读取': {
        dockerImage: 'relum/file-inclusion-sensitive:latest',
        port: null,
        internalPort: 80,
        description: '敏感文件读取实验环境',
        defaultInstall: true,
        flag: 'flag{LFI_sensitive_read_6bc12e5}'
      },
      '日志文件包含': {
        dockerImage: 'relum/file-inclusion-log:latest',
        port: null,
        internalPort: 80,
        description: '日志文件包含实验环境，练习日志毒化技术',
        defaultInstall: false,
        flag: 'flag{LFI_log_poisoning_3fa7e19}'
      },
      'SESSION文件包含': {
        dockerImage: 'relum/file-inclusion-session:latest',
        port: null,
        internalPort: 80,
        description: 'SESSION文件包含实验环境',
        defaultInstall: false,
        flag: 'flag{LFI_session_include_2d8f4c3}'
      }
    }
  },
  
  // XXE漏洞靶场
  'xxe': {
    title: 'XML外部实体注入漏洞',
    description: 'XML外部实体注入(XXE)漏洞实验环境，练习如何利用XXE漏洞',
    sections: {
      '有回显的XXE': {
        dockerImage: 'dogls/xxe-withecho:latest',
        port: null,
        internalPort: 5000,
        description: '有回显的XXE漏洞实验环境',
        defaultInstall: true,
        flag: 'flag{XXE_is_pwned_dd328f11a9}'
      },
      '无回显的XXE': {
        dockerImage: 'dogls/xxe-withoutecho:latest',
        port: null,
        internalPort: 5000,
        description: '无回显的XXE漏洞实验环境，练习带外数据通道技术',
        defaultInstall: false,
        flag: 'flag{XXE_is_pwned_dd328f11a9}'
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
        defaultInstall: true,
        flag: 'flag{logic_username_enum_9d27a3b}'
      },
      '验证码复用': {
        dockerImage: 'relum/logic-captcha-reuse:latest',
        port: null,
        internalPort: 80,
        description: '验证码复用漏洞实验环境',
        defaultInstall: true,
        flag: 'flag{logic_captcha_reuse_5e18f7c}'
      },
      '支付逻辑': {
        dockerImage: 'relum/logic-payment:latest',
        port: null,
        internalPort: 80,
        description: '支付逻辑漏洞实验环境，练习价格篡改等攻击',
        defaultInstall: false,
        flag: 'flag{logic_payment_bypass_7c31d9e}'
      },
      '越权访问': {
        dockerImage: 'relum/logic-authz-bypass:latest',
        port: null,
        internalPort: 80,
        description: '横向越权和纵向越权漏洞实验环境',
        defaultInstall: false,
        flag: 'flag{logic_authz_bypass_2a94f6b}'
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
        defaultInstall: true,
        flag: 'flag{weblogic_vuln_pwned_3c58b7d}'
      },
      'Tomcat漏洞利用': {
        dockerImage: 'relum/middleware-tomcat:latest',
        port: null,
        internalPort: 8080,
        description: 'Tomcat典型漏洞利用实验环境',
        defaultInstall: true,
        flag: 'flag{tomcat_vuln_pwned_7f42a19}'
      },
      'Jboss漏洞利用': {
        dockerImage: 'relum/middleware-jboss:latest',
        port: null,
        internalPort: 8080,
        description: 'Jboss典型漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{jboss_vuln_pwned_8e25d6c}'
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
        defaultInstall: true,
        flag: 'flag{shiro_vuln_pwned_5d74b3e}'
      },
      'Fastjson漏洞利用': {
        dockerImage: 'relum/component-fastjson:latest',
        port: null,
        internalPort: 8080,
        description: 'Fastjson反序列化漏洞利用实验环境',
        defaultInstall: true,
        flag: 'flag{fastjson_vuln_pwned_1a69c4f}'
      },
      'Log4j漏洞利用': {
        dockerImage: 'relum/component-log4j:latest',
        port: null,
        internalPort: 8080,
        description: 'Log4j远程代码执行漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{log4j_vuln_pwned_9b23a7d}'
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
        defaultInstall: true,
        flag: 'flag{thinkphp_vuln_pwned_2e91c8a}'
      },
      'Struts2漏洞利用': {
        dockerImage: 'relum/framework-struts2:latest',
        port: null,
        internalPort: 8080,
        description: 'Struts2框架漏洞利用实验环境',
        defaultInstall: true,
        flag: 'flag{struts2_vuln_pwned_4f82d9b}'
      },
      'Spring漏洞利用': {
        dockerImage: 'relum/framework-spring:latest',
        port: null,
        internalPort: 8080,
        description: 'Spring框架漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{spring_vuln_pwned_7c46e3a}'
      },
      '若依框架漏洞利用': {
        dockerImage: 'relum/framework-ruoyi:latest',
        port: null,
        internalPort: 80,
        description: '若依框架漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{ruoyi_vuln_pwned_9d37f2b}'
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
        defaultInstall: true,
        flag: 'flag{wordpress_vuln_pwned_6a54d1c}'
      },
      'Drupal漏洞利用': {
        dockerImage: 'relum/cms-drupal:latest',
        port: null,
        internalPort: 80,
        description: 'Drupal漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{drupal_vuln_pwned_3b85e7f}'
      },
      'Joomla漏洞利用': {
        dockerImage: 'relum/cms-joomla:latest',
        port: null,
        internalPort: 80,
        description: 'Joomla漏洞利用实验环境',
        defaultInstall: false,
        flag: 'flag{joomla_vuln_pwned_5c91d8e}'
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
        defaultInstall: true,
        flag: 'flag{mysql_vuln_pwned_8e47a2c}'
      },
      'Redis典型漏洞利用': {
        dockerImage: 'aicit11/redis:v1.3',
        port: null,
        internalPort: 5000,
        description: 'Redis漏洞利用实验环境，练习Redis未授权访问和安全漏洞利用',
        defaultInstall: true,
        flag: 'flag{redis_vuln_pwned_7d39f1b}'
      },
      'PostgreSQL典型漏洞利用': {
        dockerImage: 'relum/db-postgresql:latest',
        port: null,
        internalPort: 5432,
        description: 'PostgreSQL漏洞利用实验环境，练习PostgreSQL安全漏洞利用',
        defaultInstall: false,
        flag: 'flag{postgresql_vuln_pwned_2c78b4a}'
      }
    }
  }
};

export { targetEnvironments, getRandomPort as default }; 