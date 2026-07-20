"use client";

import { useEffect, useState } from "react";

type Message = {
  id: number;
  content: string;
  created_at: string;
};

type State =
  | { status: "loading" }
  | { status: "ok"; message: Message; ms: number }
  | { status: "error"; error: string };

export default function Home() {
  const [state, setState] = useState<State>({ status: "loading" });

  async function load() {
    setState({ status: "loading" });
    const started = performance.now();
    try {
      const res = await fetch("/api/message");
      const body = await res.json();
      const ms = Math.round(performance.now() - started);

      if (!res.ok) {
        setState({ status: "error", error: body.error ?? `HTTP ${res.status}` });
        return;
      }
      setState({ status: "ok", message: body, ms });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "request failed",
      });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="wrap">
      <h1>aKe infra smoke test</h1>

      <ol className="chain">
        <li>Browser</li>
        <li>Next.js route handler (server-side)</li>
        <li>Go API</li>
        <li>Postgres</li>
      </ol>

      <section className="card" aria-live="polite">
        {state.status === "loading" && <p className="muted">กำลังโหลด…</p>}

        {state.status === "error" && (
          <>
            <p className="label err">ไม่สำเร็จ</p>
            <p className="mono">{state.error}</p>
          </>
        )}

        {state.status === "ok" && (
          <>
            <p className="label ok">สำเร็จ · {state.ms}ms</p>
            <p className="content">{state.message.content}</p>
            <p className="mono muted">
              id {state.message.id} · {state.message.created_at}
            </p>
          </>
        )}
      </section>

      <button onClick={() => void load()} disabled={state.status === "loading"}>
        เรียกอีกครั้ง
      </button>
    </main>
  );
}
