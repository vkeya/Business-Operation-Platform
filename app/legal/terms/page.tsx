import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  ShieldCheck,
} from "lucide-react";
import LegalDocument from "@/components/legal/LegalDocument";

export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      description="The terms governing your access to and use of the SmatPic Business Operations Platform."
      version="Version 1.0"
      effectiveDate="Effective date: To be confirmed"
      icon="file"
    >
      <div className="space-y-6">

      {/* Document */}
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                SmatPic Business Operations Platform
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Please review these Terms of Service before using SmatPic.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="max-w-4xl space-y-10">
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                1. Acceptance of These Terms
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                These Terms of Service govern access to and use of the SmatPic
                Business Operations Platform. By creating an account, accessing
                the platform, or using its services, you agree to be bound by
                these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                2. Eligibility
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                You must provide accurate information when creating an account
                and must have the legal capacity and authority required to
                enter into these Terms and use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                3. Business Accounts
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic provides business operations functionality including
                tools for managing business information, customers, products,
                inventory, purchases, sales, payments, expenses, accounting,
                reports, and related operational information.
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                You are responsible for maintaining the confidentiality of
                your account credentials and for activity conducted through
                your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                4. Customer Data
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                You remain responsible for the business and personal data that
                you enter, upload, store, or otherwise process through SmatPic.
                You must ensure that you have the necessary rights,
                permissions, notices, and lawful basis required to process
                that data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                5. Data Protection
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic processes personal data in accordance with its Privacy
                Policy and, where applicable, its Data Processing Agreement.
                Where SmatPic processes personal data on behalf of a business
                customer, the parties&apos; respective responsibilities will
                be determined by the applicable agreement and data protection
                law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                6. Acceptable Use
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                You must use SmatPic lawfully and responsibly. You must not use
                the platform for unlawful activity, unauthorized access,
                interference with the platform, fraud, abuse, or activity that
                violates the Acceptable Use Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                7. Payments and Transactions
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Where paid services or payment functionality applies, charges,
                payment processing, subscriptions, refunds, and related
                conditions are governed by the applicable Payment, Subscription
                and Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                8. Third-Party Services
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic may integrate with third-party services, including
                payment, authentication, infrastructure, communications, and
                other service providers. Your use of those services may also be
                subject to their respective terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                9. Intellectual Property
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic and its underlying software, interfaces, branding,
                documentation, and related materials are protected by
                applicable intellectual property laws. Except for rights
                expressly granted under these Terms, no ownership rights are
                transferred to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                10. Security
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic will implement reasonable technical and organizational
                measures appropriate to the services provided. You are also
                responsible for protecting your credentials, devices, and
                access to your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                11. Availability and Maintenance
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic aims to provide reliable access to the platform but
                does not guarantee uninterrupted availability. Planned
                maintenance, emergency maintenance, infrastructure failures,
                network issues, third-party failures, and circumstances outside
                reasonable control may affect availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                12. Suspension and Termination
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Access may be suspended or terminated where necessary to
                protect the platform, comply with law, address security risks,
                enforce these Terms, or respond to misuse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                13. Data Following Termination
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Treatment of data following account termination will be
                governed by the applicable service terms, Privacy Policy, Data
                Processing Agreement, and applicable legal retention
                requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                14. Disclaimers
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic provides business operations software and does not
                guarantee that the platform will satisfy every particular
                business requirement or that information generated through the
                platform will be free from error.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                15. Limitation of Liability
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                To the extent permitted by applicable law, liability arising
                from use of the platform will be subject to the limitations and
                exclusions set out in the applicable agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                16. Indemnity
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                To the extent permitted by applicable law, you may be
                responsible for claims arising from your unlawful use of the
                platform, violation of these Terms, or infringement of
                third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                17. Changes to These Terms
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmatPic may update these Terms when necessary. Where a change
                requires renewed acceptance, users may be required to review
                and accept the updated version before continuing to use
                applicable services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                18. Governing Law and Dispute Resolution
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                These Terms are intended to operate subject to the laws
                applicable to SmatPic and its customers. The final
                governing-law, jurisdiction, and dispute-resolution provisions
                should be confirmed as part of SmatPic&apos;s final legal
                review.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                19. Contact
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Questions concerning these Terms should be directed through
                the official SmatPic support or legal contact channel.
              </p>
            </section>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-5 sm:px-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/legal"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Legal & Privacy
            </Link>

            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Privacy Center
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
    </LegalDocument>
    
  );
}