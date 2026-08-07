import Image from "next/image";
import Link from "next/link";
import { DIRECT_EMAIL } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="border-t border-steel/40 bg-panel">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <Image
          src="/brand/mvella-wordmark-dark.svg"
          alt="MVella Studios"
          width={158}
          height={60}
        />

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="https://github.com/midmatt"
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label text-paper/70 transition-colors hover:text-phosphor"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/matthew-vella-234189326/"
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label text-paper/70 transition-colors hover:text-phosphor"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${DIRECT_EMAIL}`}
              className="mono-label text-paper/70 transition-colors hover:text-phosphor"
            >
              {DIRECT_EMAIL}
            </a>
            <Link
              href="/legal"
              className="mono-label text-paper/50 transition-colors hover:text-phosphor"
            >
              Legal
            </Link>
            <Link
              href="/terms"
              className="mono-label text-paper/50 transition-colors hover:text-phosphor"
            >
              Terms
            </Link>
          </nav>

          <p className="mono-label text-paper/50">
            © {new Date().getFullYear()} MVella Studios · Based in South Florida
          </p>
        </div>
      </div>
    </footer>
  );
}
