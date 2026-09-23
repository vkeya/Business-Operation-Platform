import LegalDocument from "@/components/legal/LegalDocument";

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      description="Information about cookies and similar technologies used by SmatPic when you access or use the website and platform."
      version="Version 1.0"
      effectiveDate="Effective date: To be confirmed"
      icon="cookie"
    >
      <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted-foreground">
          SmatPic Legal
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Cookie Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Version 1.0 · Effective date: To be confirmed
        </p>
      </div>

      <div className="space-y-8 leading-7 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Purpose
          </h2>
          <p className="mt-3">
            This Cookie Policy explains how SmatPic uses cookies and similar
            technologies when you access or use the SmatPic website and
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. What Are Cookies?
          </h2>
          <p className="mt-3">
            Cookies are small text files stored on a device by a website.
            Similar technologies may include local storage, session storage,
            pixels, and other technologies used to remember preferences,
            maintain sessions, understand usage, or protect services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Essential Cookies
          </h2>
          <p className="mt-3">
            SmatPic may use cookies that are necessary for authentication,
            account security, session management, load balancing, and core
            platform functionality. Without these technologies, certain
            platform functions may not operate correctly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Preference Cookies
          </h2>
          <p className="mt-3">
            Where used, preference technologies may remember settings such as
            language, interface preferences, or other choices made by users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Analytics and Performance
          </h2>
          <p className="mt-3">
            SmatPic may use analytics technologies to understand how the
            platform is used, identify errors, measure performance, and improve
            the service. Where applicable, these technologies will be
            configured and used in accordance with applicable privacy
            requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Security
          </h2>
          <p className="mt-3">
            Cookies and similar technologies may be used to detect suspicious
            activity, protect accounts, prevent abuse, and maintain the
            security and integrity of SmatPic services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Third-Party Technologies
          </h2>
          <p className="mt-3">
            Certain third-party service providers may use cookies or similar
            technologies when providing services to SmatPic. These may include
            infrastructure, authentication, analytics, payment, security, or
            communications providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Managing Cookies
          </h2>
          <p className="mt-3">
            Most browsers allow users to view, block, delete, or restrict
            cookies through browser settings. Disabling certain cookies may
            affect the availability or functionality of parts of the SmatPic
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Changes to This Policy
          </h2>
          <p className="mt-3">
            SmatPic may update this Cookie Policy when its use of cookies or
            similar technologies changes or when required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Contact
          </h2>
          <p className="mt-3">
            Questions about cookies and similar technologies should be directed
            through the official SmatPic privacy or support contact channel.
          </p>
        </section>
      </div>
    </main>
    </LegalDocument>
  );
}

