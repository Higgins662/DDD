export const metadata = {
  title: "How it works",
  description: "How DropDadDeals finds and checks deals.",
};

export default function About() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1>How it works</h1>
        <p>
          Lots of "deals" online compare against a made-up original price. We do it differently: we
          check prices on a list of products from well-known brands throughout the day and keep a
          record of every price we see.
        </p>
        <p>
          A product only shows up here when its price drops meaningfully below what we've been
          seeing. Each deal page shows the price history we've collected, so you can judge for
          yourself whether it's a good time to buy.
        </p>
        <p>
          Prices move fast. If a deal ends, we mark it as ended instead of pretending it's still
          live. Always check the final price at the store before you buy.
        </p>
        <p>
          Some links on this site are affiliate links, which is how the site pays for itself. They
          never change the price you pay, and they never decide which deals we post.
        </p>
      </div>
    </div>
  );
}
