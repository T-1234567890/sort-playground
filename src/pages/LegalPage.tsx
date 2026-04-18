import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import privacyMarkdown from "../legal/privacy.md?raw";
import termsMarkdown from "../legal/terms.md?raw";

type LegalPageProps = {
  type: "privacy" | "terms";
  dark: boolean;
  onToggleDark: () => void;
};

export function LegalPage({ type, dark, onToggleDark }: LegalPageProps) {
  const { t } = useTranslation();
  const markdown = type === "privacy" ? privacyMarkdown : termsMarkdown;
  const title = type === "privacy" ? t("legal.privacy") : t("legal.terms");

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("legal.back")}
        </a>

        <article className="mt-10 rounded-lg bg-white/70 p-6 shadow-soft ring-1 ring-zinc-950/5 backdrop-blur-xl dark:bg-white/8 dark:ring-white/10 sm:p-8">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 border-t border-zinc-950/10 pt-6 text-2xl font-semibold tracking-tight text-zinc-950 dark:border-white/10 dark:text-zinc-50">
                  {children}
                </h2>
              ),
              p: ({ children }) => <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">{children}</p>,
              ul: ({ children }) => (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li className="pl-1">{children}</li>,
              a: ({ children, href }) => (
                <a href={href} className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
                  {children}
                </a>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
        <h1 className="sr-only">{title}</h1>
      </main>
      <Footer />
    </Shell>
  );
}
