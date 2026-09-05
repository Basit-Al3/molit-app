"use client";

import { useActionState, useEffect, useRef } from "react";
import { addExpenseAction, type AddState } from "@/app/app/actions";

export function AddExpenseForm() {
  const [state, action, pending] = useActionState<AddState, FormData>(addExpenseAction, null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok && ref.current) ref.current.value = "";
  }, [state]);

  return (
    <form action={action} className="flex flex-col sm:flex-row gap-2">
      <input
        ref={ref}
        name="text"
        className="field"
        placeholder="coffee 250   ·   uber 600, lunch 900   ·   dinner 1200 yesterday"
        autoComplete="off"
        aria-label="Add an expense, exactly like you'd text it"
        required
      />
      <button className="btn btn-ink" type="submit" disabled={pending}>
        {pending ? "Logging…" : "Log it"}
      </button>
      {state && (
        <p className={`sm:hidden text-sm ${state.ok ? "text-ink-2" : "text-red"}`} role="status">
          {state.message}
        </p>
      )}
      {state && (
        <p className={`hidden sm:block self-center text-sm min-w-40 ${state.ok ? "text-ink-2" : "text-red"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
