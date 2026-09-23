import LegalDocument from "@/components/legal/LegalDocument";

export default function ServiceLevelPolicyPage() {
  return (
    <LegalDocument
      title="Service Availability Policy"
      description="Information about SmatPic platform availability, maintenance, service interruptions, and operational expectations."
      version="Version 1.0"
      effectiveDate="Effective date: To be confirmed"
      icon="server"
    >
       <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium text-gray-500">
          SmatPic Legal
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Service Availability Policy
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
            This Service Availability Policy describes the general availability
            and operational approach applicable to the SmatPic Business
            Operations Platform.
          </p>
          <p className="mt-3">
            SmatPic is designed to provide businesses with access to business
            operations functionality including sales, inventory, purchasing,
            accounting, reporting and related services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Availability
          </h2>
          <p className="mt-3">
            SmatPic will use commercially reasonable efforts to keep the
            platform available and operational.
          </p>
          <p className="mt-3">
            Availability may be affected by scheduled maintenance, emergency
            maintenance, infrastructure failures, third-party service
            interruptions, telecommunications failures, internet connectivity,
            security incidents, force majeure events or circumstances outside
            SmatPic&apos;s reasonable control.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Scheduled Maintenance
          </h2>
          <p className="mt-3">
            SmatPic may perform scheduled maintenance, upgrades, security
            updates, database maintenance and other operational activities.
          </p>
          <p className="mt-3">
            Where reasonably practicable, SmatPic will provide advance notice
            of material scheduled maintenance that is expected to affect
            customer access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Emergency Maintenance
          </h2>
          <p className="mt-3">
            Emergency maintenance may be performed without advance notice when
            necessary to protect the security, integrity, availability or
            performance of the platform or customer data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            5. Third-Party Dependencies
          </h2>
          <p className="mt-3">
            Certain SmatPic functionality may depend on third-party providers,
            including cloud infrastructure providers, payment providers,
            telecommunications networks, authentication providers and other
            technology services.
          </p>
          <p className="mt-3">
            Interruptions affecting such third-party services may affect
            SmatPic functionality. SmatPic will take reasonable steps to
            identify and address such dependencies but does not guarantee the
            continuous availability of third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            6. Payment Services
          </h2>
          <p className="mt-3">
            Payment functionality, including mobile-money and other supported
            payment methods, may depend on external payment providers and
            telecommunications networks.
          </p>
          <p className="mt-3">
            A temporary interruption or delay in a payment provider does not
            necessarily constitute an interruption of the SmatPic platform as a
            whole.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            7. Customer Connectivity
          </h2>
          <p className="mt-3">
            Customers are responsible for maintaining suitable internet
            connectivity, supported devices, browsers, local networks and
            other equipment required to access the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            8. Data Protection and Security
          </h2>
          <p className="mt-3">
            SmatPic will maintain reasonable technical and organisational
            measures designed to protect the platform and customer data from
            unauthorised access, loss, misuse, alteration or destruction.
          </p>
          <p className="mt-3">
            Security controls may be updated as the platform, infrastructure,
            threat environment and applicable requirements evolve.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            9. Incident Response
          </h2>
          <p className="mt-3">
            SmatPic may investigate and respond to service incidents affecting
            availability, security or integrity.
          </p>
          <p className="mt-3">
            Where an incident materially affects customer services or customer
            data and notification is required under applicable law or
            contractual obligations, SmatPic will provide appropriate
            notification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            10. No Guaranteed Uninterrupted Service
          </h2>
          <p className="mt-3">
            Unless a separate written agreement expressly provides otherwise,
            SmatPic does not guarantee uninterrupted or error-free operation
            of every feature of the platform at all times.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            11. Service Changes
          </h2>
          <p className="mt-3">
            SmatPic may add, modify, suspend or discontinue functionality where
            reasonably necessary for security, technical, operational, legal or
            commercial reasons.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            12. Contact
          </h2>
          <p className="mt-3">
            Questions concerning service availability or operational incidents
            may be directed to the SmatPic support or designated business
            contact channels.
          </p>
          <p className="mt-3">
            Final corporate contact details will be published before production
            launch.
          </p>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-gray-500">
            This document is an implementation draft and should undergo final
            legal and operational review before being adopted as a binding
            contractual policy.
          </p>
        </section>
      </div>
    </main>
    </LegalDocument>
  );
}

