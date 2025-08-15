import { Article, ArticleVersion } from '@/types/dto';

export const mockArticles: Article[] = [
  {
    articleID: 1,
    userID: 1,
    title: 'React 18 新特性详解',
    slug: 'react-18-new-features',
    status: 'publish',
    tags: ['React', 'JavaScript', '前端'],
    views: 1250,
    likes: 89,
    comments: 23,
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    articleID: 2,
    userID: 1,
    title: 'TypeScript 高级类型技巧',
    slug: 'typescript-advanced-types',
    status: 'publish',
    tags: ['TypeScript', 'JavaScript', '编程'],
    views: 890,
    likes: 67,
    comments: 15,
    publishedAt: '2024-01-12T09:00:00Z',
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
  {
    articleID: 3,
    userID: 1,
    title: 'Next.js 13 App Router 指南',
    slug: 'nextjs-13-app-router-guide',
    status: 'draft',
    tags: ['Next.js', 'React', '前端框架'],
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: '2024-01-20T11:45:00Z',
    updatedAt: '2024-01-20T11:45:00Z',
  },
  {
    articleID: 4,
    userID: 1,
    title: 'Tailwind CSS 最佳实践',
    slug: 'tailwind-css-best-practices',
    status: 'publish',
    tags: ['CSS', 'Tailwind', '前端'],
    views: 2100,
    likes: 156,
    comments: 34,
    publishedAt: '2024-01-05T08:30:00Z',
    createdAt: '2024-01-01T10:15:00Z',
    updatedAt: '2024-01-05T08:30:00Z',
  },
  {
    articleID: 5,
    userID: 1,
    title: '现代前端开发工具链',
    slug: 'modern-frontend-toolchain',
    status: 'publish',
    tags: ['前端', '工具', '开发'],
    views: 750,
    likes: 45,
    comments: 12,
    publishedAt: '2024-01-18T14:20:00Z',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
  {
    articleID: 6,
    userID: 1,
    title: 'Vue 3 Composition API 深度解析',
    slug: 'vue-3-composition-api-deep-dive',
    status: 'draft',
    tags: ['Vue', 'JavaScript', '前端框架'],
    views: 0,
    likes: 0,
    comments: 0,
    createdAt: '2024-01-22T13:10:00Z',
    updatedAt: '2024-01-22T13:10:00Z',
  },
];

export const mockArticleVersions: Record<number, ArticleVersion[]> = {
  1: [
    {
      versionID: 1,
      articleID: 1,
      version: 1,
      content: `# React 18 新特性详解

React 18 带来了许多激动人心的新特性，让我们一起来探索这些改进。

## 1. 自动批处理 (Automatic Batching)

React 18 引入了自动批处理，这意味着多个状态更新会被自动合并到一次重新渲染中，从而提高性能。

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    setCount(c => c + 1); // 不会触发重新渲染
    setFlag(f => !f);     // 不会触发重新渲染
    // 只有在这里才会触发一次重新渲染
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>
        Count: {count}
      </h1>
    </div>
  );
}
\`\`\`

## 2. Suspense 的改进

Suspense 现在支持服务端渲染，并且可以更好地处理数据获取。

\`\`\`jsx
function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}
\`\`\`

## 3. 并发特性

React 18 引入了并发渲染，允许 React 中断和恢复渲染工作。

\`\`\`jsx
import { startTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  function handleClick() {
    startTransition(() => {
      setCount(c => c + 1);
    });
  }

  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleClick}>
        Count: {count}
      </button>
    </div>
  );
}
\`\`\`

## 总结

React 18 的这些新特性为开发者提供了更好的性能和用户体验。建议在生产环境中逐步采用这些特性。`,
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
    },
    {
      versionID: 2,
      articleID: 1,
      version: 2,
      content: `# React 18 新特性详解

React 18 带来了许多激动人心的新特性，让我们一起来探索这些改进。

## 1. 自动批处理 (Automatic Batching)

React 18 引入了自动批处理，这意味着多个状态更新会被自动合并到一次重新渲染中，从而提高性能。

\`\`\`jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    setCount(c => c + 1); // 不会触发重新渲染
    setFlag(f => !f);     // 不会触发重新渲染
    // 只有在这里才会触发一次重新渲染
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>
        Count: {count}
      </h1>
    </div>
  );
}
\`\`\`

## 2. Suspense 的改进

Suspense 现在支持服务端渲染，并且可以更好地处理数据获取。

\`\`\`jsx
function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}
\`\`\`

## 3. 并发特性

React 18 引入了并发渲染，允许 React 中断和恢复渲染工作。

\`\`\`jsx
import { startTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  function handleClick() {
    startTransition(() => {
      setCount(c => c + 1);
    });
  }

  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleClick}>
        Count: {count}
      </button>
    </div>
  );
}
\`\`\`

## 4. 新的 Hooks

React 18 还引入了一些新的 Hooks：

- \`useId()\`: 生成唯一 ID
- \`useDeferredValue()\`: 延迟更新值
- \`useSyncExternalStore()\`: 同步外部存储

## 总结

React 18 的这些新特性为开发者提供了更好的性能和用户体验。建议在生产环境中逐步采用这些特性。

## 迁移指南

如果你正在从 React 17 迁移到 React 18，请参考官方迁移指南。`,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  2: [
    {
      versionID: 3,
      articleID: 2,
      version: 1,
      content: `# TypeScript 高级类型技巧

TypeScript 提供了强大的类型系统，让我们探索一些高级类型技巧。

## 1. 条件类型

条件类型允许我们根据输入类型选择输出类型。

\`\`\`typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type Result1 = NonNullable<string | number | null>; // string | number
type Result2 = NonNullable<string | null | undefined>; // string
\`\`\`

## 2. 映射类型

映射类型允许我们从一个类型创建另一个类型。

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
\`\`\`

## 3. 模板字面量类型

TypeScript 4.1 引入了模板字面量类型。

\`\`\`typescript
type EventName<T extends string> = \`\${T}Changed\`;
type T0 = EventName<'foo'>; // 'fooChanged'

type Concat<S1 extends string, S2 extends string> = \`\${S1}\${S2}\`;
type T1 = Concat<'Hello', 'World'>; // 'HelloWorld'
\`\`\`

## 总结

这些高级类型技巧可以帮助我们编写更安全、更灵活的 TypeScript 代码。`,
      createdAt: '2024-01-08T16:20:00Z',
      updatedAt: '2024-01-12T09:00:00Z',
    },
  ],
};

export const mockPageInfo = {
  currentPage: 1,
  pageSize: 20,
  total: 6,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};