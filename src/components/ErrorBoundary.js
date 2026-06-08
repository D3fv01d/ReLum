import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight, faHouse, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error('React渲染错误:', error, info);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (!hasError) {
      return children;
    }

    return (
      <main className="min-h-screen bg-[#1A1A1A] px-4 py-10 text-white">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">页面暂时无法显示</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300">
            当前页面遇到渲染异常，可以刷新页面或返回首页继续使用。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <FontAwesomeIcon icon={faArrowRotateRight} aria-hidden="true" />
              刷新页面
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-gray-100 transition hover:border-blue-400 hover:text-blue-200"
            >
              <FontAwesomeIcon icon={faHouse} aria-hidden="true" />
              返回首页
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && error && (
            <pre className="mt-8 max-h-48 w-full overflow-auto rounded-md border border-red-500/30 bg-black/40 p-4 text-left text-xs text-red-100">
              {error.message}
            </pre>
          )}
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
