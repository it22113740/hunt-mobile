import { AuthScaffold, FormError, InlineLink, TextLink } from '@/features/auth/components/auth-scaffold';
import { PrimaryButton } from '@/features/auth/components/primary-button';
import { TextField } from '@/features/auth/components/text-field';
import { useResendSignup, useVerifySignup } from '@/features/auth/hooks';
import { verifyEmailSchema, type VerifyEmailValues } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email ?? '';
  const establishSession = useAuthStore((state) => state.establishSession);
  const verify = useVerifySignup();
  const resend = useResendSignup();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: initialEmail, otp: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);
    try {
      const session = await verify.mutateAsync(values);
      await establishSession(session.accessToken);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'That code didn’t work. Request a new one and try again.'));
    }
  });

  const onResend = async () => {
    const email = form.getValues('email').trim();
    if (!verifyEmailSchema.shape.email.safeParse(email).success) {
      setFormError('Enter the email you signed up with.');
      return;
    }
    setFormError(null);
    setNotice(null);
    try {
      const result = await resend.mutateAsync(email);
      setNotice(result.message);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not send a new code. Try again.'));
    }
  };

  return (
    <AuthScaffold
      title="Check your email."
      subtitle="Enter the 6-digit code we sent. The account is created once the code matches."
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/register'))}
      footer={
        <TextLink
          label="Wrong email?"
          action="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/register'))}
        />
      }>
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={form.control}
        name="otp"
        render={({ field, fieldState }) => (
          <TextField
            label="Code"
            value={field.value}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 6))}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
          />
        )}
      />
      <FormError message={formError} />
      <FormError message={notice} tone="info" />
      <PrimaryButton label="Confirm email" onPress={onSubmit} loading={verify.isPending} />
      <InlineLink
        label={resend.isPending ? 'Sending…' : 'Send a new code'}
        align="center"
        onPress={() => {
          void onResend();
        }}
      />
    </AuthScaffold>
  );
}
