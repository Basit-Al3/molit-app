"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "./logo";
import { demoReply, initialDemoState, type DemoState } from "@/lib/demo";

type Msg = { id: number; from: "you" | "molit"; text: string };

const SCRIPT = ["coffee 350", "uber 600, lunch 900", "month"];
const SUGGESTIONS = ["chai 80", "dinner 1200 yesterday", "$4.50 latte", "undo"];

/**
 * A real conversation with the real parser, running in the browser, inside a
 * phone. Plays a short script, then hands the keyboard to the visitor.
 */
export function ChatDemo() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [live, setLive] = useState(false);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const nextId = () => ++idRef.current;

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: nextId(), from: "you", text: trimmed }]);
    setTyping(true);
    const { reply, state: next } = demoReply(trimmed, stateRef.current);
    stateRef.current = next;
    setState(next);
    const delay = 450 + Math.min(900, reply.length * 6);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), from: "molit", text: reply }]);
    }, delay);
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const timers: number[] = [];
    let t = reduce ? 0 : 700;
    SCRIPT.forEach((line, i) => {
      timers.push(window.setTimeout(() => !cancelled && send(line), t));
      t += reduce ? 50 : 2200 + i * 300;
    });
    timers.push(window.setTimeout(() => !cancelled && setLive(true), t + 400));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="phone w-[300px] sm:w-[330px] mx-auto">
      <div className="phone-screen">
        <div className="phone-island" aria-hidden />
        {/* status bar */}
        <div className="flex items-center justify-between px-6 pt-3.5 pb-1 text-[11px] font-semibold">
          <span>9:41</span>
          <span className="flex items-center gap-1" aria-hidden>
            <span className="inline-block w-3.5 h-2 rounded-[2px] border border-ink relative">
              <span className="absolute inset-[1px] right-[3px] bg-ink rounded-[1px]" />
            </span>
          </span>
        </div>
        {/* chat header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line bg-paper-2/70">
          <span className="text-muted text-lg leading-none" aria-hidden>
            ‹
          </span>
          <Mark size={34} tile="ink" />
          <div className="leading-tight">
            <div className="font-semibold text-[13px]">Molit</div>
            <div className="text-[10.5px] text-muted">{live ? "your turn · real parser" : "online"}</div>
          </div>
        </div>
        {/* messages */}
        <div ref={scrollRef} className="px-3 py-3 space-y-2 h-[330px] overflow-y-auto dotgrid" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`flex pop ${m.from === "you" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[84%] whitespace-pre-line text-[12.5px] leading-snug px-3 py-2 shadow-sm ${m.from === "you" ? "bubble-you" : "bubble-molit"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start pop">
              <div className="bubble-molit px-3 py-2.5 typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
        {/* composer */}
        <form
          className="px-3 pt-2 pb-2 flex items-center gap-2 border-t border-line bg-paper"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
            setInput("");
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!live}
            className="flex-1 min-w-0 rounded-full border border-line-strong bg-white/60 px-3.5 py-2 text-[13px] outline-none focus:border-ink disabled:opacity-60"
            placeholder={live ? "Type what you spent…" : "Watching…"}
            aria-label="Try Molit: type an expense"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!live}
            className="w-9 h-9 rounded-full bg-ink text-lime grid place-items-center disabled:opacity-40 hover:bg-lime hover:text-ink transition-colors"
            aria-label="Send"
          >
            ↑
          </button>
        </form>
        <div className="px-3 pb-3 flex gap-1.5 flex-wrap bg-paper min-h-8">
          {live &&
            SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-line-strong hover:bg-ink hover:text-paper transition-colors"
              >
                {s}
              </button>
            ))}
        </div>
        <div className="mx-auto mb-2 w-28 h-1.5 rounded-full bg-ink/80" aria-hidden />
      </div>
    </div>
  );
}
