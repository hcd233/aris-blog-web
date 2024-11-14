import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  accessToken: string | null
  refreshToken: string | null
  userInfo: any | null
  isAuthenticated: boolean
}

const initialState: UserState = {
  accessToken: null,
  refreshToken: null,
  userInfo: null,
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
    },
    setUserInfo: (state, action: PayloadAction<any>) => {
      state.userInfo = action.payload
    },
    logout: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.userInfo = null
      state.isAuthenticated = false
    },
  },
})

export const { setTokens, setUserInfo, logout } = userSlice.actions
export default userSlice.reducer 