import React from "react";
import heroUrl from "container:///mnt/data/src/assets/0eaaabe8d2e5d9f6-operava_hero.png";
import specialistUrl from "container:///mnt/data/src/assets/2d71eead6d18f1e9-operava_ai_specialist.png";
import futureUrl from "container:///mnt/data/src/assets/5d5075bb5016bc1a-operava_future.png";

const mailtoKeep =
  "mailto:careers@yourdomain.com?subject=Keep%20my%20profile%20on%20file%20-%20AI%20Specialist%20%2F%20Engineer";
const mailtoFocus =
  "mailto:careers@yourdomain.com?subject=My%20preferred%20focus%20-%20AI%20Specialist%20%2F%20Engineer";
const mailtoGeneral = "mailto:careers@yourdomain.com";

export default function App() {
  return (
    <div
      data-safe-area-inset-root
      style={{
        boxSizing: "border-box",
        paddingTop: "var(--safe-area-inset-top)",
        minHeight: "100vh",
        background: "var(--page)",
      }}
      className="w-full overflow-x-clip"
    >
      <main className="mx-auto w-full max-w-[720px] px-3 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6D3FC9]">
            Email preview
          </p>
          <p className="text-xs text-[var(--muted)]">Operava Global Solutions · Talent Acquisition</p>
        </div>

        <article
          className="email-shadow mx-auto w-full max-w-[640px] overflow-hidden rounded-[20px] bg-[var(--card)]"
          aria-label="Email from Operava Global Solutions"
        >
          {/* Top bar */}
          <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A86A] font-display text-xl text-[#2B1055]">
                O
              </span>
              <div className="min-w-0 leading-tight">
                <p className="font-display text-[17px] font-normal text-[#2B1055] dark:text-[#F1EBFB]">
                  Operava <span className="italic">Global Solutions</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Talent Acquisition
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#EADFFB] px-3 py-1.5 text-center text-[11px] font-bold leading-tight text-[#4B21A3]">
              Technology Executive Posts
            </span>
          </header>

          {/* Hero — PNG */}
          <section className="relative overflow-hidden">
            <img
              src={heroUrl}
              alt="Dark purple AI network with gold lines and glowing connections"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="hero-overlay absolute inset-0" aria-hidden="true" />
            <div className="relative px-5 py-10 sm:px-10 sm:py-12">
              <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E4D6FF]">
                <span className="text-[#C9A86A]" aria-hidden="true">✦</span>
                Update on your application
              </p>
              <h1 className="font-display max-w-[540px] text-[clamp(1.75rem,6vw,2.25rem)] font-normal leading-[1.18] text-white">
                Your application for AI Specialist / Engineer: our decision, and the honest reason behind it
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#C9A86A]" aria-hidden="true" />
                <p className="text-sm text-[#EADFFB]">AI Specialist / Engineer · Technology Executive Posts</p>
              </div>
            </div>
          </section>

          {/* Opening */}
          <section className="px-5 pt-8 sm:px-10 sm:pt-9">
            <p className="text-base leading-7 text-[var(--ink)]">Hi [First Name],</p>
            <p className="mt-4 text-base leading-7 text-[var(--ink)]">
              Thank you for trusting Operava with your story and your work. We were genuinely glad to
              see your name among the applicants for the{" "}
              <strong>AI Specialist / Engineer</strong> position, and we read your application with
              the care it deserves.
            </p>
            <p className="mt-4 text-base leading-7 text-[var(--ink)]">
              We have finished our review, and <strong>we will not be moving your application forward
              for this position.</strong> We would rather say that plainly — and then explain why —
              because the reason matters far more than the outcome.
            </p>
          </section>

          {/* Middle image — PNG, after opening */}
          <section className="px-5 pt-7 sm:px-10">
            <figure className="m-0 overflow-hidden rounded-2xl">
              <img
                src={specialistUrl}
                alt="Professional woman in a dark office touching purple and gold AI holograms"
                className="block aspect-[16/10] w-full object-cover sm:aspect-[16/8]"
              />
              <figcaption className="bg-[#2B1055] px-5 py-3.5 text-center text-sm italic leading-6 text-[#EADFFB]">
                Your expertise is built for broader impact — not a narrow scope.
              </figcaption>
            </figure>
          </section>

          {/* Fit comparison */}
          <section className="px-5 pt-7 sm:px-10" aria-label="Fit comparison">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border-t-4 border-[#C9A86A] bg-[var(--soft)] p-5">
                <div className="mb-3 flex items-center gap-2 text-[#6D3FC9]">
                  <span aria-hidden="true">•</span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">Your profile</span>
                </div>
                <h2 className="font-display text-xl leading-7 text-[#2B1055] dark:text-[#F1EBFB]">
                  Depth that reaches beyond this brief
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-[var(--muted)]">
                  Education and expertise that go beyond what this role asks of us, and depth in AI
                  that is most valuable in a broader scope — where all of it is put to work.
                </p>
              </div>
              <div className="rounded-xl border-t-4 border-[#B9AFCB] bg-[#F6F3EE] p-5 dark:bg-[#241A38]">
                <div className="mb-3 flex items-center gap-2 text-[#5E5470] dark:text-[#BFB2D6]">
                  <span aria-hidden="true">•</span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">What this role needs now</span>
                </div>
                <h2 className="font-display text-xl leading-7 text-[#2B1055] dark:text-[#F1EBFB]">
                  A narrow, clearly defined scope
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-[var(--muted)]">
                  A very small headcount at this stage and a narrow, clearly defined scope, filled by
                  someone whose experience matches it closely.
                </p>
              </div>
            </div>
          </section>

          {/* Premium divider */}
          <div className="flex items-center gap-3 px-5 py-7 sm:px-10" aria-hidden="true">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="block h-2 w-2 rotate-45 bg-[#C9A86A]" />
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          {/* Quote */}
          <section className="px-5 sm:px-10">
            <blockquote className="m-0 rounded-r-2xl border-l-4 border-[#C9A86A] bg-[var(--lavender)] px-6 py-7 sm:px-8">
              <span className="font-display block text-5xl leading-none text-[#C9A86A]" aria-hidden="true">“</span>
              <p className="font-display -mt-3 text-[clamp(1.45rem,5.5vw,1.75rem)] leading-[1.3] text-[#2B1055] dark:text-[#F1EBFB]">
                A difference in fit and timing. Never a difference in ability.
              </p>
              <p className="mt-4 text-[15px] leading-6 text-[var(--muted)]">
                You are not unqualified, and you are not our last choice. Your background is strong.
              </p>
            </blockquote>
          </section>

          {/* Reasoning */}
          <section className="px-5 pt-7 sm:px-10">
            <p className="drop-cap m-0 text-base leading-7 text-[var(--ink)]">
              Placing you in a role that uses only part of what you know would not serve you well, and
              it would waste experience that took real effort to build. We would rather wait and
              connect your knowledge to work where it can be used fully and keep growing — with a
              specific alignment to the role — than hire you into a position that is too small for it.
            </p>
          </section>

          {/* Next steps */}
          <section className="px-5 pt-8 sm:px-10" aria-label="What you can do next">
            <div className="border-t border-[var(--line)] pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6D3FC9]">What happens next</p>
              <h2 className="font-display mt-2 text-[clamp(1.5rem,5vw,1.9rem)] leading-tight text-[#2B1055] dark:text-[#F1EBFB]">
                Three thoughtful ways to stay connected
              </h2>
            </div>

            <figure className="m-0 mt-5 overflow-hidden rounded-2xl">
              <img
                src={futureUrl}
                alt="Open glass door leading to a bright sunset path in warm purple and gold light"
                className="block aspect-[16/9] w-full object-cover sm:aspect-[16/7]"
              />
              <figcaption className="bg-[#2B1055] px-5 py-3.5 text-center text-sm italic leading-6 text-[#EADFFB]">
                The right match is worth waiting for.
              </figcaption>
            </figure>

            <div className="mt-4 grid gap-3">
              <div className="flex gap-4 rounded-2xl bg-[var(--soft)] p-5">
                <span className="font-display shrink-0 text-2xl text-[#C9A86A]">01</span>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    Stay on our radar
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-6 text-[var(--muted)]">
                    If you agree, we will keep your profile on file and review it first when a
                    technology or AI role opens with a closer match.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-[var(--soft)] p-5">
                <span className="font-display shrink-0 text-2xl text-[#C9A86A]">02</span>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    Tell us what you want
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-6 text-[var(--muted)]">
                    Reply with the kind of work you would most like to do — such as applied AI,
                    automation, or engineering leadership — and we will use that when we match roles.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-[var(--soft)] p-5">
                <span className="font-display shrink-0 text-2xl text-[#C9A86A]">03</span>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    Ask for feedback
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-6 text-[var(--muted)]">
                    If you would like specific comments on your application, just ask. If you would
                    rather we delete your details, tell us and we will do that too.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="px-5 pt-7 text-center sm:px-10">
            <a
              href={mailtoKeep}
              target="_blank"
              rel="noopener"
              className="btn-premium inline-block w-full rounded-lg px-6 py-4 text-base font-bold text-white no-underline sm:w-auto sm:min-w-[300px]"
            >
              Keep my profile on file
            </a>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Prefer to start with direction?{" "}
              <a href={mailtoFocus} target="_blank" rel="noopener" className="link-underline font-bold text-[#6D3FC9]">
                Reply with your preferred focus
              </a>
            </p>
          </section>

          {/* Trust line */}
          <section className="px-5 pt-6 sm:px-10" aria-label="How your application was handled">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-[var(--line)] py-4 text-xs font-semibold text-[var(--muted)]">
              <span>• Confidential</span>
              <span>• Reviewed with care</span>
              <span>• Human-reviewed</span>
            </div>
          </section>

          {/* Closing + signature */}
          <section className="px-5 pt-7 sm:px-10">
            <p className="m-0 text-base leading-7 text-[var(--ink)]">
              Thank you again for your interest in Operava. Please keep building on what you have.
              The right match for it is worth waiting for, and we would be glad to hear from you again.
            </p>
            <p className="mt-5 text-base text-[var(--ink)]">With respect and best wishes,</p>
            <div className="mt-5 border-t-2 border-[#C9A86A] pt-5">
              <p className="font-display m-0 text-xl text-[#2B1055] dark:text-[#F1EBFB]">[Your Name]</p>
              <p className="m-0 mt-1 text-[15px] leading-6 text-[var(--muted)]">
                [Your Title], Talent Acquisition
                <br />
                Operava Global Solutions
                <br />
                <a href={mailtoGeneral} target="_blank" rel="noopener" className="text-[#6D3FC9] underline">
                  [careers@yourdomain.com]
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 bg-[#2B1055] px-5 py-6 sm:px-10">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A86A] font-display text-base text-[#2B1055]">O</span>
              <p className="font-display text-sm text-white">Operava Global Solutions</p>
            </div>
            <p className="m-0 mt-3 text-xs leading-5 text-[#CDBFE8]">
              You are receiving this message because you applied for a position at Operava Global
              Solutions. This email and your application details are treated as confidential.
            </p>
            <p className="m-0 mt-3 text-[11px] uppercase tracking-[0.16em] text-[#8F67E8]">
              Subject: Update on your application: AI Specialist / Engineer
            </p>
          </footer>
        </article>

        <p className="mt-4 px-1 text-center text-xs leading-5 text-[var(--muted)]">
          Premium preview · Wording refined while preserving the original decision, reason, and next steps.
        </p>
      </main>
    </div>
  );
}
