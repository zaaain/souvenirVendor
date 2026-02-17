export interface User {
  id: string
  email: string
  name: string
}

export interface ProfileData {
  _id: string
  email: string
  firstname: string
  lastname: string
  status: string
  profilePicture?: string
  createdAt: string
  updatedAt: string
  _v: number
}

export interface AuthState {
  user: User | null
  token: string | null
  profileData: ProfileData | null
  isAuthenticated: boolean
  isLoading: boolean
}

