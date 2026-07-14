import CustomerFlowClient from "./CustomerFlowClient";

// Required for Next.js static export (output: "export").
// Generates a single placeholder page at /r/_/ that Render's
// rewrite rules will serve for all /r/<restaurantId>/ URLs.
export function generateStaticParams() {
  return [{ restaurantId: "_" }];
}

export default function CustomerFlowPage() {
  return <CustomerFlowClient />;
}
