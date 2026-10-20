export const metadata = {
  title: "Affiliate disclosure",
  description: "How DropDadDeals makes money.",
  alternates: { canonical: "/disclosure" },
  robots: { index: false, follow: true },
};

export default function Disclosure() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1>Affiliate disclosure</h1>
        <p>
          DropDadDeals participates in affiliate programs, including the eBay Partner Network.
          When you click a link to a store on this site and make a purchase, we may earn a
          commission. This comes at no extra cost to you.
        </p>
        <p>
          Commissions help keep the site running. They don't affect which deals we post: a deal
          appears only when our own price tracking shows a real price drop.
        </p>
        <p>
          Prices and availability are accurate as of the time we checked them and are subject to
          change. The price shown at the store at the time of purchase is the price that applies.
        </p>
        <h2>Analytics</h2>
        <p>
          We use Google Analytics to count visits and see which deals people find useful. It sets
          cookies and collects standard usage information like pages viewed, device type and rough
          location. We don't collect your name or email. You can opt out with Google's{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
            Analytics opt-out add-on
          </a>
          .
        </p>
      </div>
    </div>
  );
}
