import LegalDocument from "@/components/legal/LegalDocument";

export default function DataProcessingAgreementPage() {
  return (
    <LegalDocument
      title="Data Processing Agreement"
      description="Terms governing the processing of customer personal data by SmatPic when providing the Business Operations Platform."
      version="Version 1.0"
      effectiveDate="Effective date: To be confirmed"
      icon="shield"
    >
      <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium text-gray-500">
          SmatPic Legal
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Data Processing Agreement
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Version 1.0 · Effective date: To be confirmed
        </p>
      </div>

      <div className="space-y-8 text-gray-700 leading-7">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            1. Purpose
          </h2>
          <p className="mt-3">
            This Data Processing Agreement (&quot;DPA&quot;) describes the
            processing of personal data by SmatPic in connection with the
            provision of the SmatPic Business Operations Platform.
          </p>
          <p className="mt-3">
            This DPA is intended to establish responsibilities and safeguards
            applicable where SmatPic processes personal data on behalf of a
            business customer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Roles of the Parties
          </h2>
          <p className="mt-3">
            Depending on the nature of the processing activity, the business
            customer may determine the purposes and means of processing
            personal data and may therefore act as a data controller or
            equivalent role under applicable data protection law.
          </p>
          <p className="mt-3">
            SmatPic may process such personal data on behalf of the business
            customer and may therefore act as a data processor or equivalent
            role for those processing activities.
          </p>
          <p className="mt-3">
            The parties may have different roles for different categories of
            data or processing activities. The applicable role should be
            determined according to the actual processing activity and
            applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Subject Matter of Processing
          </h2>
          <p className="mt-3">
            SmatPic may process personal data necessary to provide business
            operations functionality, including customer management, sales,
            purchases, inventory, accounting, reporting, payments,
            authentication, support and related platform services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Categories of Personal Data
          </h2>
          <p className="mt-3">
            Depending on how the platform is used, personal data may include:
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Names and contact details.</li>
            <li>Business and employment-related information.</li>
            <li>Customer and supplier information.</li>
            <li>Transaction and invoice information.</li>
            <li>Payment-related references and transaction records.</li>
            <li>Account and authentication information.</li>
            <li>Technical and device information.</li>
            <li>Support and communications information.</li>
            <li>Other information entered into the platform by authorised users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            5. Categories of Data Subjects
          </h2>
          <p className="mt-3">
            Depending on customer use, data subjects may include customers,
            employees, contractors, suppliers, business contacts, platform
            users and other individuals whose information is entered into the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            6. Processing Instructions
          </h2>
          <p className="mt-3">
            SmatPic will process customer personal data only as necessary to
            provide the contracted services, maintain and secure the platform,
            provide support, comply with applicable legal obligations and
            perform other documented processing activities permitted under the
            applicable agreement.
          </p>
          <p className="mt-3">
            The business customer is responsible for ensuring that its
            instructions and use of the platform comply with applicable data
            protection requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            7. Confidentiality
          </h2>
          <p className="mt-3">
            Persons authorised by SmatPic to process customer personal data
            will be subject to appropriate confidentiality obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            8. Security Measures
          </h2>
          <p className="mt-3">
            SmatPic will maintain reasonable technical and organisational
            measures designed to protect personal data against unauthorised or
            unlawful processing and against accidental loss, destruction,
            damage, alteration or disclosure.
          </p>
          <p className="mt-3">
            Measures may include access controls, authentication controls,
            encryption where appropriate, logging, monitoring, backups,
            vulnerability management and incident response processes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            9. Subprocessors
          </h2>
          <p className="mt-3">
            SmatPic may engage third-party service providers to support the
            delivery of the platform.
          </p>
          <p className="mt-3">
            Where such providers process personal data on behalf of SmatPic,
            SmatPic will seek to impose appropriate contractual and data
            protection obligations on those providers.
          </p>
          <p className="mt-3">
            Current categories of third-party services are described in the
            SmatPic Subprocessor and Third-Party Services Notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            10. International Transfers
          </h2>
          <p className="mt-3">
            Personal data may be processed or stored in jurisdictions outside
            the customer&apos;s country where necessary for the delivery of
            third-party infrastructure or other services.
          </p>
          <p className="mt-3">
            SmatPic will apply appropriate safeguards to international
            transfers where required by applicable data protection law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            11. Data Subject Requests
          </h2>
          <p className="mt-3">
            Where SmatPic processes personal data on behalf of a business
            customer, SmatPic will provide reasonable assistance to the
            customer in responding to data subject requests, taking into
            account the nature of the processing and information available to
            SmatPic.
          </p>
          <p className="mt-3">
            Where legally appropriate, SmatPic may direct a data subject to the
            relevant business customer when that customer determines the
            purposes of the processing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            12. Personal Data Breaches
          </h2>
          <p className="mt-3">
            SmatPic will maintain processes for identifying, investigating and
            responding to suspected personal data breaches.
          </p>
          <p className="mt-3">
            Where a confirmed incident affects customer personal data and
            notification is required, SmatPic will provide information to the
            relevant customer in accordance with applicable law and contractual
            obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            13. Retention and Deletion
          </h2>
          <p className="mt-3">
            Personal data will be retained only for as long as reasonably
            necessary for the applicable purposes, contractual obligations,
            legal requirements, security requirements and legitimate
            operational needs.
          </p>
          <p className="mt-3">
            Following termination of the applicable service, customer data
            handling will be subject to the applicable agreement, SmatPic
            retention requirements and applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            14. Audits and Compliance Information
          </h2>
          <p className="mt-3">
            Where appropriate and subject to reasonable confidentiality and
            security restrictions, SmatPic may provide information reasonably
            necessary to demonstrate compliance with applicable processing
            obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            15. Customer Responsibilities
          </h2>
          <p className="mt-3">
            Customers are responsible for determining what personal data they
            enter into the platform, ensuring they have an appropriate legal
            basis for processing, providing required notices to data subjects,
            maintaining appropriate user access controls and complying with
            applicable data protection obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            16. Sensitive Personal Data
          </h2>
          <p className="mt-3">
            Customers should not upload sensitive personal data unless such
            processing is necessary, lawful and supported by appropriate
            safeguards.
          </p>
          <p className="mt-3">
            Certain categories of sensitive or highly regulated information may
            require additional contractual, technical or organisational
            safeguards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            17. Changes to this DPA
          </h2>
          <p className="mt-3">
            SmatPic may update this DPA where reasonably necessary to reflect
            changes to the platform, processing activities, service providers,
            security practices or applicable legal requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            18. Applicable Law
          </h2>
          <p className="mt-3">
            This DPA is intended to operate together with the applicable SmatPic
            Terms of Service and other contractual documents and should be
            interpreted consistently with applicable data protection law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            19. Contact
          </h2>
          <p className="mt-3">
            Data protection and privacy enquiries may be directed through the
            designated SmatPic privacy or support contact channels.
          </p>
          <p className="mt-3">
            Final corporate and privacy contact details will be published
            before production launch.
          </p>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-gray-500">
            This document is an implementation draft and should undergo final
            review by a Kenyan data protection professional or advocate before
            being adopted as a binding DPA.
          </p>
        </section>
      </div>
    </main>
    </LegalDocument>
  );
}

