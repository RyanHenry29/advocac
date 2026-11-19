"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatContext, ChatChip } from "@/lib/chatbot/types";

interface ChatMessage {
  who: "user" | "bot";
  html: string;
  source?: { label: string; verified: string };
  steps?: string[];
}

const STORAGE_KEY = "advocac_chat_context";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

function sanitizeBotHtml(raw: string): string {
  const allowed = ["strong", "em", "br", "p", "ul", "li", "span"];
  const tmp = document.createElement("div");
  tmp.innerHTML = raw;

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || "");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (!allowed.includes(tag)) {
      return Array.from(el.childNodes).map(walk).join("");
    }
    const attrs = tag === "span" && el.className ? ` class="${escapeHtml(el.className)}"` : "";
    const inner = Array.from(el.childNodes).map(walk).join("");
    return `<${tag}${attrs}>${inner}</${tag}>`;
  };

  return Array.from(tmp.childNodes).map(walk).join("");
}

function loadContext(): ChatContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.sessionId && parsed.phase) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveContext(ctx: ChatContext): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {}
}

export function useChatEngine() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<ChatChip[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const contextRef = useRef<ChatContext | null>(loadContext());
  const abortRef = useRef<AbortController | null>(null);

  const boot = useCallback(() => {
    if (contextRef.current) {
      return;
    }

    setMessages([
      {
        who: "bot",
        html: "Olá! Sou o atendimento da <strong>Advocac</strong>. Como posso te ajudar? Selecione um tema ou descreva sua situação."
      }
    ]);
    setChips([
      { label: "Meu CRAF está vencendo", value: "Meu CRAF está vencendo, o que faço?" },
      { label: "Recebi uma exigência", value: "Recebi uma exigência da Polícia Federal, o que fazer?" },
      { label: "Processo indeferido", value: "Meu processo de CRAF foi indeferido, tenho recurso?" },
      { label: "Novo Portal PF", value: "Como funciona o novo Portal da Polícia Federal para CACs?" },
      { label: "Habitualidade", value: "O que é habitualidade e como comprová-la?" },
      { label: "Falar com a equipe", value: "Quero falar direto com a equipe", primary: true }
    ]);
  }, []);

  const send = useCallback(
    async (text: string, chipValue?: string) => {
      const trimmed = (text || "").trim();
      if (!trimmed && !chipValue) return;

      if (trimmed) {
        setMessages((prev) => [
          ...prev,
          { who: "user", html: escapeHtml(trimmed) }
        ]);
      }

      const isHandoff = chipValue === "Quero falar direto com a equipe" || trimmed === "Quero falar direto com a equipe";
      if (isHandoff || chipValue === "__whatsapp__") {
        setMessages((prev) => [
          ...prev,
          {
            who: "bot",
            html: "Certo! Redirecionando para a equipe no <strong>WhatsApp</strong>..."
          }
        ]);
        setChips([]);
        window.open("https://wa.me/5511932290927?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Advocac%20e%20gostaria%20de%20atendimento.", "_blank");
        return;
      }

      setInput("");
      setTyping(true);
      setHandoffUrl(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            message: trimmed,
            chipValue: chipValue || undefined,
            context: contextRef.current || undefined
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        contextRef.current = data.context;
        if (data.context) saveContext(data.context);

        const botHtml = sanitizeBotHtml(data.reply || "");
        setMessages((prev) => [
          ...prev,
          {
            who: "bot",
            html: botHtml,
            source: data.source,
            steps: data.steps
          }
        ]);

        setChips(data.chips || []);
        if (data.handoffUrl) setHandoffUrl(data.handoffUrl);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            who: "bot",
            html: "Ocorreu um problema temporário. Você pode tentar novamente ou falar direto com a equipe no <strong>WhatsApp</strong>.",
          }
        ]);
        setChips([
          { label: "Tentar novamente", value: trimmed || chipValue || "Olá" },
          { label: "Abrir WhatsApp", value: "__whatsapp__", primary: true }
        ]);
      } finally {
        setTyping(false);
      }
    },
    []
  );

  return { messages, chips, input, setInput, typing, handoffUrl, boot, send };
}
