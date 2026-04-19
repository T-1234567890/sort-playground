import { useTranslation } from "react-i18next";

type FooterLink = {
  label: string;
  href: string;
  route?: boolean;
};

export function Footer() {
  const { t } = useTranslation();

  const linkGroups: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: t("footer.groups.explore"),
      links: [
        { label: t("footer.allAlgorithms"), href: "/allalgo", route: true },
        { label: t("footer.labs"), href: "/labs", route: true },
        { label: t("footer.about"), href: "/about", route: true },
        { label: t("footer.contribute"), href: "/contribute", route: true },
      ],
    },
    {
      title: t("footer.groups.project"),
      links: [
        { label: t("footer.github"), href: "https://github.com/T-1234567890/sort-playground" },
        { label: t("footer.site"), href: "https://1234567890.dev" },
      ],
    },
    {
      title: t("footer.groups.legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy", route: true },
        { label: t("footer.terms"), href: "/terms", route: true },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-950/10 bg-white/45 dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="shrink-0">
          <p className="font-semibold tracking-tight">Sort Playground</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {t("footer.copyright")} · {t("footer.license")}
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("footer.tagline")}</p>
        </div>
        <nav className="grid gap-7 text-sm sm:grid-cols-3 sm:gap-10 lg:gap-14">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{group.title}</p>
              <ul className="mt-3 space-y-2.5 text-zinc-500 dark:text-zinc-400">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      data-route={link.route ? true : undefined}
                      className="transition hover:text-zinc-950 dark:hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
