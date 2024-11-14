import { lazy, Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import Layout from '@/layout'
import AuthGuard from '@/components/Auth/AuthGuard'
import Loading from '@/components/Loading'
import ArticlePage from '@/pages/article'

const Portal = lazy(() => import('@/pages/portal'))
const Auth = lazy(() => import('@/pages/auth'))
const AuthCallback = lazy(() => import('@/pages/auth/callback'))
const Home = lazy(() => import('@/pages/home'))
const NotFound = lazy(() => import('@/pages/404'))
const Profile = lazy(() => import('@/pages/profile'))

const Router = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: (
        <Suspense fallback={<Loading />}>
          <Portal />
        </Suspense>
      ),
    },
    {
      path: '/auth',
      element: (
        <Suspense fallback={<Loading />}>
          <Auth />
        </Suspense>
      ),
    },
    {
      path: '/auth/callback',
      element: (
        <Suspense fallback={<Loading />}>
          <AuthCallback />
        </Suspense>
      ),
    },
    {
      path: '/home',
      element: (
        <AuthGuard>
          <Layout />
        </AuthGuard>
      ),
      children: [
        {
          path: '',
          element: (
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '/user/:userName',
      element: (
        <AuthGuard>
          <Layout />
        </AuthGuard>
      ),
      children: [
        {
          path: '',
          element: (
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: ':userName/:articleSlug',
      element: <ArticlePage />
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<Loading />}>
          <NotFound />
        </Suspense>
      ),
    },
  ])

  return routes
}

export default Router 