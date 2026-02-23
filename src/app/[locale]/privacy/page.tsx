export const metadata = {
  title: 'Privacy Policy — FacelessHub',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-text-secondary mb-10">Last updated: February 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-text-secondary text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">1. Who We Are</h2>
          <p>
            FacelessHub (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{' '}
            <a href="https://facelesschannel.net" className="text-primary hover:underline">
              facelesschannel.net
            </a>{' '}
            and provides SaaS tools for YouTube content creators. This Privacy Policy explains how we
            collect, use, and protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-text-primary">Account information</strong> — your name, email
              address, and profile picture obtained via Google OAuth when you sign in.
            </li>
            <li>
              <strong className="text-text-primary">Payment information</strong> — billing details
              are processed by Creem (our payment processor). We store only your subscription status
              and plan level; we do not store credit card numbers.
            </li>
            <li>
              <strong className="text-text-primary">YouTube data</strong> — when you use the YouTube
              Translator tool, we access your YouTube channel data (video titles, descriptions) via
              the YouTube Data API solely to perform the translation service. We do not store your
              video content.
            </li>
            <li>
              <strong className="text-text-primary">Usage data</strong> — we track daily tool usage
              counts (e.g., number of generations) to enforce plan limits. This data resets daily.
            </li>
            <li>
              <strong className="text-text-primary">Log data</strong> — standard server logs
              including IP address, browser type, and pages visited for security and debugging
              purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and operate our services</li>
            <li>To manage your subscription and process payments</li>
            <li>To enforce plan usage limits</li>
            <li>To send transactional emails (e.g., keyword monitor alerts)</li>
            <li>To improve our tools and fix bugs</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">4. Third-Party Services</h2>
          <p className="mb-3">We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-text-primary">Google OAuth</strong> — for authentication</li>
            <li><strong className="text-text-primary">YouTube Data API</strong> — for the Translator tool</li>
            <li><strong className="text-text-primary">Creem</strong> — for payment processing</li>
            <li><strong className="text-text-primary">Supabase</strong> — for database hosting</li>
            <li><strong className="text-text-primary">Vercel</strong> — for website hosting</li>
            <li><strong className="text-text-primary">Google Gemini API</strong> — for AI-powered content generation</li>
            <li><strong className="text-text-primary">Replicate</strong> — for image processing (Object Remover)</li>
            <li><strong className="text-text-primary">Cloudflare Turnstile</strong> — for bot protection</li>
          </ul>
          <p className="mt-3">
            Each third-party service has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">5. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active. You may request
            deletion of your data at any time by contacting us. Usage counters reset daily. Keyword
            monitor history is retained to provide the video feed feature and is deleted upon account
            closure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">6. Cookies</h2>
          <p>
            We use session cookies for authentication (managed by NextAuth.js). We also use Google
            Analytics cookies to understand site usage. You can disable cookies in your browser
            settings, though some features may not work correctly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">7. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, or delete your
            personal data. To exercise these rights, contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">8. Contact</h2>
          <p>
            For privacy-related questions, contact us at:{' '}
            <a href="mailto:support@facelesschannel.net" className="text-primary hover:underline">
              support@facelesschannel.net
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
