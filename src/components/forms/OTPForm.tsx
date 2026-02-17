import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import OtpInput from 'react-otp-input'
import { Button } from '@components/buttons'
import { useVerifyOTPMutation, useVerifyPasswordOTPMutation } from '@store/features/auth/authSlice'
import { setProfileData } from '@store/features/auth/authReducer'
import { useLazyGetProfileQuery } from '@store/features/profile/profileSlice'
import { useAppDispatch } from '@hooks/redux'
import { eSnack, sSnack } from '@hooks/useToast'

const OTPForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation()
  const [verifyPasswordOTP, { isLoading: isPasswordVerifyLoading }] = useVerifyPasswordOTPMutation()
  const [getProfile] = useLazyGetProfileQuery()

  const { email = '', fromForgotPassword = false } = (location.state as { email?: string; fromForgotPassword?: boolean }) ?? {}
  const isLoading = isVerifyLoading || isPasswordVerifyLoading
  
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60) // 60 seconds = 01:00
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async () => {
    if (otp.length !== 4 || !email) return
    try {
      if (fromForgotPassword) {
        const result = await verifyPasswordOTP({ email, otp }).unwrap()
        const data = result?.data as { _id?: string; id?: string; passwordResetToken?: string; token?: string } | undefined
        const id = data?._id ?? data?.id ?? ''
        const passwordResetToken = data?.passwordResetToken ?? data?.token ?? ''
        if (result?.message) sSnack(result.message)
        navigate('/auth/reset-password', { state: { id, passwordResetToken }, replace: true })
        return
      }
      const result = await verifyOTP({ email, otp }).unwrap()
      let authToken = ''
      if (result?.data) {
        const { token, ...profileData } = result.data as { token?: string; [k: string]: unknown }
        authToken = token || ''
        dispatch(setProfileData({
          profileData: profileData as unknown as import('@store/features/auth/auth.types').ProfileData,
          token: authToken,
        }))
      }
      try {
        const profileResult = await getProfile(undefined).unwrap()
        if (profileResult?.data) {
          dispatch(setProfileData({
            profileData: profileResult.data as import('@store/features/auth/auth.types').ProfileData,
            token: authToken,
          }))
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError)
      }
      if (result?.message || result?.data?.message) {
        sSnack(result?.message || result?.data?.message)
      }
      navigate('')
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; error?: string }
      const errorMessage = err?.data?.message || err?.error || 'Verification failed'
      eSnack(errorMessage)
    }
  }

  const handleResend = () => {
    console.log('Resending OTP...')
    setTimer(60)
    setCanResend(false)
    setOtp('')
    // Handle resend OTP logic here
  }

  return (
    <div className="bg-white rounded-lg p-6 md:p-8 2xl:w-[30%] xl:w-[40%] lg:w-[50%] md:w-[60%] sm:w-[80%] xs:max-w-[90%]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center font-ManropeBold">
        OTP
      </h1>
      <p className="text-gray-600 text-center mb-8 font-Manrope">
        Enter the verification code sent to {email || 'your email'}.
      </p>

      <div className="space-y-6">
        <div className="flex justify-center">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            renderSeparator={<span className="mx-2"></span>}
            renderInput={(props) => (
              <input
                {...props}
                className="min-w-[40px] min-h-[40px] md:min-w-[80px] md:min-h-[80px] text-center text-xl font-ManropeBold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              />
            )}
            inputType="number"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-Manrope">
            You will receive the code soon. Please wait{' '}
            <span className="font-ManropeBold">{formatTime(timer)}</span> to resend the code.
          </p>
        </div>

        <Button
          type="button"
          fullWidth
          disabled={otp.length !== 4 || !email || isLoading}
          loader={isLoading}
          onClick={handleVerify}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-Manrope">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-ManropeBold hover:underline"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-primary font-ManropeBold">Resend Code</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPForm
