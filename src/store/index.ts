import { configureStore } from '@reduxjs/toolkit'
import userReducer, { setTokens } from './slices/userSlice'
import { getStoredTokens } from '@/utils/auth'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

// 在应用启动时从 localStorage 加载 token
const { accessToken, refreshToken } = getStoredTokens()
if (accessToken && refreshToken) {
  store.dispatch(setTokens({ accessToken, refreshToken }))
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 