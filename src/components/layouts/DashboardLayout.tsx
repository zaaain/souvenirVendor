import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { selectToken, selectIsAuthenticated, selectProfileData, setProfileData } from '@store/features/auth/authReducer'
import { useGetProfileQuery } from '@store/features/profile/profileSlice'
import { useLogout } from '@hooks/useLogout'
import Sidebar from '@components/sidebar/Sidebar'
import Header from '@components/header/Header'
import { StatusBlockedModal } from '@components/modal'
import type { VendorStatus } from '@components/modal'
import type { ProfileData } from '@store/features/auth/auth.types'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const profileData = useAppSelector(selectProfileData)
  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !token || !isAuthenticated,
    refetchOnMountOrArgChange: true,
  })
  const handleLogout = useLogout()

  // Sync latest profile (including status) from API to Redux when dashboard loads
  useEffect(() => {
    if (profileResponse?.data && token) {
      dispatch(setProfileData({
        profileData: profileResponse.data as ProfileData,
        token,
      }))
    }
  }, [profileResponse?.data, token, dispatch])

  const showStatusModal =
    profileData?.status === 'pending' || profileData?.status === 'rejected'
  const statusForModal: VendorStatus | null = profileData?.status === 'pending'
    ? 'pending'
    : profileData?.status === 'rejected'
      ? 'rejected'
      : null

  useEffect(() => {
    // Check if token exists and user is authenticated
    if (!token || !isAuthenticated) {
      handleLogout()
    }
  }, [token, isAuthenticated, handleLogout])

  // Function to handle unauthorized API responses
  // This can be called from API interceptors or components
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      if (event.detail?.status === 401 || event.detail?.status === 403) {
        handleLogout()
      }
    }

    window.addEventListener('unauthorized' as any, handleUnauthorized as EventListener)
    
    return () => {
      window.removeEventListener('unauthorized' as any, handleUnauthorized as EventListener)
    }
  }, [handleLogout])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="dashboard-content">
        <Header onMenuClick={toggleSidebar} />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}
      {showStatusModal && statusForModal && (
        <StatusBlockedModal
          isOpen={true}
          status={statusForModal}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default DashboardLayout

