import { combineReducers } from '@reduxjs/toolkit'
import { authSlice } from './features/auth/authSlice'
import { profileSlice } from './features/profile/profileSlice'
import { productSlice } from './features/products/productSlice'
import authReducer from './features/auth/authReducer'

const rootReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [profileSlice.reducerPath]: profileSlice.reducer,
  [productSlice.reducerPath]: productSlice.reducer,
  auth: authReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer

