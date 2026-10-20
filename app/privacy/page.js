import Link from "next/link";

export const metadata = {
  title: "Privacy policy",
  description: "How DropDadDeals collects, uses and protects information.",
  alternates: { canonical: "/privacy" },
  // Keep legal pages out of search results; Meta and visitors can still open them.
  robots: { index: false, follow: true },
};

const EFFECTIVE = "October 16, 2026";

export default function Privacy() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1>Privacy policy</h1>
        <p className="prose-meta">Effective {EFFECTIVE}</p>

        <p>
          This policy explains what information DropDadDeals ("we", "us") collects when you use our
          website and our Facebook Page, how we use it, and the choices you have. DropDadDeals
          shares price drops on products sold by other stores. We don't sell products, we don't
          offer accounts, and we don't ask you to sign up for anything.
        </p>

        <h2>Information we collect</h2>
        <p>
          <strong>Information you give us.</strong> We only receive personal information if you
          choose to contact us, for example by sending a message to our Facebook Page. In that case
          we receive what you send, such as your name and the content of your message.
        </p>
        <p>
          <strong>Usage information.</strong> When you visit the website, we and our service
          providers automatically collect standard technical information, such as the pages you
          view, the links you click, your browser and device type, your approximate location
          (city or region, based on IP address), and the website that referred you.
        </p>
        <p>
          <strong>Cookies.</strong> We use cookies and similar technologies for analytics (see
          Google Analytics below). Stores we link to may also set cookies when you click through to
          them, so they can credit us for referrals.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>To run, maintain and improve the website and our Facebook Page.</li>
          <li>To understand which deals and pages are useful, in aggregate.</li>
          <li>To reply to messages you send us.</li>
          <li>To publish deal posts to our own Facebook Page.</li>
          <li>To keep the site secure and comply with the law.</li>
        </ul>
        <p>We do not sell your personal information, and we don't use it for advertising profiles.</p>

        <h2>Facebook</h2>
        <p>
          We use a Facebook app, through Meta's Graph API, only to publish posts to the DropDadDeals
          Facebook Page and manage that Page. The app does not offer Facebook Login on our website
          and does not collect information about people who view or interact with our posts. If you
          comment on or message our Page, that information is handled by Meta under{" "}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">
            Meta's Privacy Policy
          </a>
          , and we can see it in the same way any Page owner can. We don't copy it out of Facebook
          or store it elsewhere.
        </p>

        <h2>Service providers we use</h2>
        <ul>
          <li>
            <strong>Google Analytics</strong> counts visits and shows how the site is used. Google's
            practices are described in{" "}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
              how Google uses information from sites that use its services
            </a>
            . You can opt out with the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
              Google Analytics opt-out add-on
            </a>
            .
          </li>
          <li>
            <strong>Affiliate programs</strong>, including the eBay Partner Network. When you click a
            link to a store, that store and the affiliate network may record the click so we can be
            credited for a purchase. Their own privacy policies apply once you're on their sites.
          </li>
          <li>
            <strong>Vercel</strong> hosts the website and may keep short-term server logs, such as IP
            addresses, for security and reliability.
          </li>
          <li>
            <strong>Supabase</strong> stores our product and price data. It does not store
            information about website visitors.
          </li>
        </ul>

        <h2>How long we keep information</h2>
        <p>
          Analytics data is kept according to our Google Analytics retention setting (no more than
          14 months). Messages you send us are kept only as long as needed to respond. Hosting logs
          are kept for a short period by our hosting provider.
        </p>

        <h2 id="data-deletion">Your choices and deleting your data</h2>
        <p>
          You can block or delete cookies in your browser settings and opt out of Google Analytics
          with the add-on linked above. You can also ask us what information we hold about you, or
          ask us to delete it.
        </p>
        <p>
          <strong>To request deletion of your data</strong>, including any data related to our
          Facebook app, send a message to the DropDadDeals Facebook Page with the subject "Delete my
          data". Tell us the name or account you used to contact us. We'll delete what we hold within
          30 days and confirm once it's done. Because our Facebook app doesn't collect data from
          people who interact with our Page, in most cases there will be nothing to delete beyond
          the conversation itself, which you can also delete from Facebook Messenger.
        </p>

        <h2>Children</h2>
        <p>
          The website is meant for adults and isn't directed at children under 13. We don't
          knowingly collect personal information from children. If you believe a child has sent us
          personal information, contact us and we'll delete it.
        </p>

        <h2>Security</h2>
        <p>
          We use reputable service providers and limit access to the data we hold. No method of
          transmission or storage is completely secure, but we work to protect the information we
          have.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we do, we'll change the effective date
          at the top of this page.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy or your data? Send a message to the DropDadDeals Facebook
          Page. See also our <Link href="/disclosure">affiliate disclosure</Link>.
        </p>
      </div>
    </div>
  );
}
