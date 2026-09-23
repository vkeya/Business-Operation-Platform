import LegalDocument from "@/components/legal/LegalDocument";

export default function PaymentRefundPolicyPage() {
  return (
    <LegalDocument
      title="Payment, Subscription & Refund Policy"
      description="Terms relating to payments, subscriptions, charges, refunds, and payment-related services provided through SmatPic."
      version="Version 1.0"
      effectiveDate="Effective date: To be confirmed"
      icon="payment"
    >
      <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted-foreground">
          SmatPic Legal
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Payment, Subscription and Refund Policy
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
            This policy explains the general rules governing payments,
            subscriptions, transaction processing, refunds, and payment-related
            services provided through SmatPic.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Service Charges
          </h2>
          <p className="mt-3">
            Applicable SmatPic subscription, service, transaction, or other
            charges will be communicated to customers before the relevant
            charge is incurred. Prices may be presented in the currency
            applicable to the customer's account or transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Payment Methods
          </h2>
          <p className="mt-3">
            SmatPic may support payment methods and payment providers made
            available through the platform. Available payment methods may vary
            depending on the customer's location, business configuration, and
            the services being purchased.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. M-Pesa and Payment Providers
          </h2>
          <p className="mt-3">
            Where M-Pesa or another third-party payment provider is supported,
            payment processing may involve that provider's systems and terms.
            SmatPic may receive transaction information necessary to confirm,
            reconcile, record, or report payment status.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Customer Payment Information
          </h2>
          <p className="mt-3">
            SmatPic will process payment-related information necessary to
            operate payment functionality. Users should not provide payment
            credentials through channels that SmatPic does not designate for
            payment processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Payment Authorization
          </h2>
          <p className="mt-3">
            A payment request may require authorization by the relevant payment
            provider. A payment is considered successfully completed only when
            SmatPic or the applicable provider receives confirmation of the
            transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Failed or Reversed Payments
          </h2>
          <p className="mt-3">
            Transactions may fail, expire, be reversed, or remain pending due
            to payment-provider responses, insufficient funds, network issues,
            account restrictions, fraud controls, or other circumstances.
            SmatPic may update transaction status based on information
            received from the relevant payment provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Refunds
          </h2>
          <p className="mt-3">
            Refunds are subject to the applicable service terms, transaction
            circumstances, and any applicable refund rules communicated at the
            time of purchase. Where a refund is approved, processing may
            require the participation of the relevant payment provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Business Transaction Refunds
          </h2>
          <p className="mt-3">
            Where SmatPic provides transaction management functionality to a
            business, the business remains responsible for determining whether
            a customer transaction should be refunded, subject to applicable
            law and the business's own terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Subscription Changes
          </h2>
          <p className="mt-3">
            Where subscription services are offered, SmatPic may provide
            different plans or service levels. Changes to a subscription may
            affect the applicable price, functionality, limits, or billing
            cycle as communicated before the change takes effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            11. Taxes
          </h2>
          <p className="mt-3">
            Applicable taxes, duties, levies, or other government charges may
            apply to SmatPic services or transactions where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            12. Chargebacks and Disputes
          </h2>
          <p className="mt-3">
            Customers should contact SmatPic promptly regarding disputed
            charges. Payment providers may have separate dispute or chargeback
            procedures that also apply.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            13. Fraud Prevention
          </h2>
          <p className="mt-3">
            SmatPic and its payment providers may use reasonable fraud
            detection, transaction monitoring, and security controls. A
            transaction may be delayed, rejected, or restricted where required
            for security, legal, or fraud-prevention reasons.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            14. Payment Records
          </h2>
          <p className="mt-3">
            SmatPic may retain payment and transaction records for accounting,
            reconciliation, customer support, fraud prevention, dispute
            management, security, and legal or regulatory requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            15. Changes to This Policy
          </h2>
          <p className="mt-3">
            SmatPic may update this policy when payment functionality,
            commercial terms, payment providers, or applicable legal
            requirements change.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            16. Contact
          </h2>
          <p className="mt-3">
            Payment questions, refund requests, and billing disputes should be
            submitted through the official SmatPic support or billing contact
            channel.
          </p>
        </section>
      </div>
    </main>
    </LegalDocument>
  );
}

