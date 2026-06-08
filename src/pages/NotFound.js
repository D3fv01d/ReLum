import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[70vh] items-center px-4 py-10">
      <section className="max-w-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-blue-300">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">页面不存在</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          当前地址没有匹配的 ReLum 页面，请返回首页继续学习或从导航进入目标模块。
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          返回首页
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
