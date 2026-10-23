import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1>That deal isn't here</h1>
        <p>It may have ended or been removed. <Link prefetch={false} href="/">See the latest price drops</Link>.</p>
      </div>
    </div>
  );
}
