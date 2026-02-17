import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { resetPasswordSchema, ResetPasswordFormData } from '@helpers/schemas'
import { useResetPasswordMutation } from '@store/features/auth/authSlice'
import { eSnack, sSnack } from '@hooks/useToast'

const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const { id = '', passwordResetToken = '' } = (location.state as { id?: string; passwordResetToken?: string }) ?? {}

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!id || !passwordResetToken) {
      eSnack('Invalid reset link. Please request a new password reset.')
      navigate('/auth/forgot-password', { replace: true })
      return
    }
    try {
      const result = await resetPassword({
        id,
        passwordResetToken,
        newPassword: data.newPassword.trim(),
      }).unwrap()
      if (result?.message) sSnack(result.message)
      navigate('/auth/login', { replace: true })
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; error?: string }
      const errorMessage = err?.data?.message || err?.error || 'Failed to reset password'
      eSnack(errorMessage)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-8 2xl:w-[30%] xl:w-[40%] lg:w-[50%] md:w-[60%] sm:w-[80%] xs:max-w-[90%]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center font-ManropeBold">
        Reset Password
      </h1>
      <p className="text-gray-600 text-center mb-6 font-Manrope">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <Input
              label="New Password"
              type="password"
              placeholder="New Password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.newPassword?.message}
              showPasswordToggle
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.confirmPassword?.message}
              showPasswordToggle
            />
          )}
        />

        <Button type="submit" fullWidth disabled={isLoading} loader={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-Manrope">
          Remember your password?{' '}
          <Link to="/auth/login" className="text-primary font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordForm
