'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/userContext';

export default function SignUp() {
  const { signUpNewUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success, error } = await signUpNewUser(email, password, displayName);

    if (success) {
      alert('Account created successfully! Check your email.');
    } else {
      alert(`Error: ${error?.message}`);
    }
  };

  return (
    <main>
      <h1>Sign up today!</h1>

      <form className="d-flex flex-col gap-1" onSubmit={handleSubmit}>
        <div className="d-flex flex-col">
          <label htmlFor="display-name">Display name</label>
          <input
            type="text"
            id="display-name"
            onChange={e => setDisplayName(e.target.value)}
            required
          ></input>
        </div>

        <div className="d-flex flex-col">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" onChange={e => setEmail(e.target.value)} required></input>
        </div>

        <div className="d-flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={e => setPassword(e.target.value)}
            required
          ></input>
        </div>
        <button className="btn btn-primary mt-1" type="submit">
          Sign up
        </button>
      </form>

      <p className="small-text mt-1">
        Already have an account?{' '}
        <Link className="link" href="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
