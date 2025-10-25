'use client';
import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';

export default function LogIn() {
  const { currentUser, loading: userLoading, signInUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && currentUser) router.push('/');
  }, [currentUser, userLoading, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const { success, error } = await signInUser(email, password);

    if (success) {
      router.push('/');
    } else {
      setErrorMsg(error?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <main>
      <h1>Welcome back!</h1>

      <form className="d-flex flex-col gap-1" onSubmit={handleSubmit}>
        <div className="d-flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          ></input>
        </div>

        <div className="d-flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          ></input>
          <Link className="link small-text" href="/login/forgot-password">
            Forgot password?
          </Link>
        </div>

        {errorMsg !== null && <p className="error-text small-text">{errorMsg}</p>}

        <button className="btn btn-primary mt-1" type="submit">
          Log in
        </button>
      </form>

      <p className="small-text mt-1">
        Don't have an account?{' '}
        <Link className="link" href="/sign-up">
          Sign up
        </Link>
      </p>
    </main>
  );
}
