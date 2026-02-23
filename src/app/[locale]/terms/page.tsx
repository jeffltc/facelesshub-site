export const metadata = {
  title: 'Terms of Service — FacelessHub',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Terms of Service</h1>
      <p className="text-sm text-text-secondary mb-10">Last updated: February 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-text-secondary text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FacelessHub (&quot;the Service&quot;) at{' '}
            <a href="https://facelesschannel.net" className="text-primary hover:underline">
              facelesschannel.net
            </a>
            , you agree to be bound by these Terms of Service. If you do not agree, please do not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">2. Description of Service</h2>
          <p className="mb-3">
            FacelessHub provides SaaS tools for YouTube content creators, including:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>TD Generator — AI-powered YouTube title and description generator</li>
            <li>Object Remover — AI-powered image background/object removal tool</li>
            <li>YouTube Translator — Batch video title and description translator</li>
            <li>Keyword Monitor — YouTube keyword monitoring with email alerts</li>
            <li>Thumbnail Downloader — YouTube thumbnail download utility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">3. Subscription Plans</h2>
          <p className="mb-3">
            FacelessHub offers the following subscription plans:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-text-primary">Free</strong> — Limited access with daily usage
              caps. No credit card required.
            </li>
            <li>
              <strong className="text-text-primary">Pro</strong> — $9/month or $84/year. Increased
              limits across all tools.
            </li>
            <li>
              <strong className="text-text-primary">Max</strong> — $19/month or $180/year. Unlimited
              usage and early access to new tools.
            </li>
          </ul>
          <p className="mt-3">
            Subscriptions are billed in advance on a monthly or annual basis. Prices are in USD and
            exclusive of applicable taxes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">4. Cancellation and Refunds</h2>
          <p>
            You may cancel your subscription at any time from your billing portal. Upon cancellation,
            your plan remains active until the end of the current billing period. We do not offer
            prorated refunds for partial billing periods. If you experience a technical issue
            preventing access to the Service, contact us within 7 days for a case-by-case review.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">5. Acceptable Use</h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the Service to generate spam, misleading, or harmful content</li>
            <li>Attempt to circumvent usage limits or access controls</li>
            <li>Reverse engineer, copy, or resell any part of the Service</li>
            <li>Use the Service in violation of YouTube&apos;s Terms of Service</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">6. YouTube API Services</h2>
          <p>
            FacelessHub uses YouTube API Services. By using our Translator tool, you also agree to
            the{' '}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              YouTube Terms of Service
            </a>
            . Google&apos;s Privacy Policy is available at{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              policies.google.com/privacy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">7. Intellectual Property</h2>
          <p>
            Content generated by AI tools (titles, descriptions, translations) is provided for your
            use. You retain ownership of your original input content. FacelessHub retains ownership
            of the platform, codebase, and brand.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. AI-generated
            content may not always be accurate or suitable for your needs. We do not guarantee
            specific results from using our tools.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, FacelessHub shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service. Our total
            liability shall not exceed the amount you paid us in the 3 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify users of material changes via
            email or a notice on the website. Continued use of the Service after changes constitutes
            acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">11. Contact</h2>
          <p>
            For questions about these Terms, contact us at:{' '}
            <a href="mailto:support@facelesschannel.net" className="text-primary hover:underline">
              support@facelesschannel.net
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
