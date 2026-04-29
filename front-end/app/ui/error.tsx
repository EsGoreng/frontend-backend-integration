"use client";

export default function Errors({ error, reset }) {
  return (
    <div className="error-page">
      <h2>Something Wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset()}>Try Again</button>
    </div>
  );
}
