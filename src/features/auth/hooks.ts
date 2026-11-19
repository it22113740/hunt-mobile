import {
  changePassword,
  login,
  registerAccount,
  requestPasswordReset,
  resendSignup,
  resetPassword,
  verifySignup,
} from '@/features/auth/api';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegister() {
  return useMutation({ mutationFn: registerAccount });
}

export function useVerifySignup() {
  return useMutation({ mutationFn: verifySignup });
}

export function useResendSignup() {
  return useMutation({ mutationFn: resendSignup });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
