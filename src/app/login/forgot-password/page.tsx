'use client';

export default function ForgotPassword() {
  return (
    <main>
      <h1>Reset password</h1>

      <form className="d-flex flex-col gap-1">
        <div className="d-flex flex-col">
          <label htmlFor="new-password">New password</label>
          <input type="password" id="new-password"></input>
        </div>

        <div className="d-flex flex-col">
          <label htmlFor="confirm-password">Confirm password</label>
          <input type="password" id="confirm-password"></input>
        </div>
        <button className="btn btn-primary mt-1" type="submit">
          Reset password
        </button>
      </form>
    </main>
  );
}
