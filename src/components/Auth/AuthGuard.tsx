import { FC, ReactNode, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/store'
import { ROUTE_PATHS } from '@/constants'

interface AuthGuardProps {
  children: ReactNode
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/auth')) {
      navigate(ROUTE_PATHS.HOME, { replace: true })
    }
  }, [isAuthenticated, location, navigate])

  if (location.pathname === '/auth/callback') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.AUTH} state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default AuthGuard 