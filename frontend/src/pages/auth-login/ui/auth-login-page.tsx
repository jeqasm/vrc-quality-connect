import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { login } from '../../../modules/auth/api/auth-api';
import { useAuth } from '../../../modules/auth/providers/auth-provider';
import { Button } from '../../../shared/ui/button/button';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function AuthLoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await login({ email, password });
      auth.setSession(session);
      navigate(locationState?.from?.pathname ?? '/', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="page-meta">Access foundation</div>
        <h1 className="page-title">VRC Quality Connect</h1>
        <p className="page-subtitle">
          Единый вход для сотрудников, менеджеров и администраторов с правами через роли и группы.
        </p>
      </section>

      <section className="content-card auth-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <h2 className="card-title">Sign in</h2>
            <p className="card-subtitle">Вход выполняется через email-аккаунт.</p>
          </div>

          <FormField htmlFor="login-email" label="Email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
            />
          </FormField>

          <FormField htmlFor="login-password" label="Password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          </FormField>

          {errorMessage ? <div className="form-inline-notice">{errorMessage}</div> : null}

          <div className="auth-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Link to="/register" className="auth-inline-link">
              Регистрация по приглашению
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
