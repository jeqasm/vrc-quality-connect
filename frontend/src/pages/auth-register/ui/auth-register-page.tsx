import { useQuery } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { getRegistrationInvite, register } from '../../../modules/auth/api/auth-api';
import { useAuth } from '../../../modules/auth/providers/auth-provider';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';

export function AuthRegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inviteQuery = useQuery({
    queryKey: ['auth', 'registration-invite', inviteToken],
    queryFn: () => getRegistrationInvite(inviteToken),
    enabled: inviteToken.length > 0,
  });

  useEffect(() => {
    if (!inviteQuery.data) {
      return;
    }

    setFirstName(inviteQuery.data.firstName ?? '');
    setLastName(inviteQuery.data.lastName ?? '');
  }, [inviteQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteToken) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await register({
        inviteToken,
        firstName,
        lastName,
        email: inviteQuery.data?.email ?? email,
        password,
      });
      auth.setSession(session);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="page-meta">Invite registration</div>
        <h1 className="page-title">Регистрация по ссылке</h1>
        <p className="page-subtitle">
          Аккаунт создается только по приглашению администратора. Роль и отдел уже закреплены в ссылке.
        </p>
      </section>

      <section className="content-card auth-card">
        {!inviteToken ? (
          <EmptyState
            title="Нужна ссылка приглашения"
            message="Открой страницу регистрации по персональной ссылке, которую выдал администратор."
          />
        ) : inviteQuery.isError ? (
          <EmptyState
            title="Ссылка недоступна"
            message={inviteQuery.error instanceof Error ? inviteQuery.error.message : 'Приглашение не найдено'}
          />
        ) : (
          <form className="form-grid" onSubmit={handleSubmit}>
            <div>
              <h2 className="card-title">Создание аккаунта</h2>
              <p className="card-subtitle">
                {inviteQuery.data
                  ? `${inviteQuery.data.accessRole.name} · ${inviteQuery.data.department.name}`
                  : 'Проверяем параметры приглашения...'}
              </p>
            </div>

            <div className="two-column-grid">
              <FormField htmlFor="register-first-name" label="Имя">
                <Input
                  id="register-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="register-last-name" label="Фамилия">
                <Input
                  id="register-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </FormField>
            </div>

            <FormField htmlFor="register-email" label="Email">
              <Input
                id="register-email"
                type="email"
                value={inviteQuery.data?.email ?? email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={Boolean(inviteQuery.data?.email)}
                required
              />
            </FormField>

            <FormField htmlFor="register-password" label="Пароль">
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                required
              />
            </FormField>

            {errorMessage ? <div className="form-inline-notice">{errorMessage}</div> : null}

            <div className="auth-actions">
              <Button type="submit" disabled={isSubmitting || inviteQuery.isLoading}>
                {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
              </Button>
              <Link to="/login" className="auth-inline-link">
                Вернуться ко входу
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
