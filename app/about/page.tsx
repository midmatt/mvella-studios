import type { Metadata } from "next";
import Link from "next/link";
import About from "@/components/About";
import Credentials from "@/components/Credentials";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About — MVella Studios",
  description:
    "Matthew Vella — founder of MVella Studios. Security-minded freelance web and mobile development for small businesses, from South Florida.",
};

/**
 * Placeholder writing list. Add real posts here as `{ title, date, url }`
 * and they render automatically; leave it empty and the section shows its
 * empty state.
 */
interface Post {
  title: string;
  date: string;
  url: string;
}

const posts: Post[] = [];

function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function AboutPage() {
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
        />
      </div>
      <About />
      <Credentials />

      <section
        id="writing"
        aria-label="Writing"
        className="border-t border-steel/40 bg-ink"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; ls ./writing</p>
          <h2 className="mt-4 font-display text-h2 text-paper">Writing</h2>

          {posts.length === 0 ? (
            <p className="mono-label mt-10 border border-steel/60 px-5 py-4 text-paper/50">
              Posts coming soon
            </p>
          ) : (
            <ul className="mt-10 border-t border-steel/40">
              {posts.map((post) => {
                const external = /^https?:\/\//i.test(post.url);
                const content = (
                  <>
                    <span className="text-body text-paper transition-colors group-hover:text-phosphor">
                      {post.title}
                    </span>
                    <time
                      dateTime={post.date}
                      className="mono-label shrink-0 text-paper/50"
                    >
                      {formatDate(post.date)}
                    </time>
                  </>
                );

                const className =
                  "group flex flex-col gap-2 border-b border-steel/40 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8";

                return (
                  <li key={post.url}>
                    {external ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link href={post.url} className={className}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-16 text-body text-paper/70">
            Have a project in mind?{" "}
            <Link
              href="/contact"
              className="text-phosphor underline-offset-4 transition-colors hover:underline"
            >
              Get in touch &rarr;
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
