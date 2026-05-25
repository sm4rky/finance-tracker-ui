export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            1. Information We Collect
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            When you use MoneyInsight, we may collect the following information:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">
                Account Information:
              </span>{" "}
              Name, email address (from Google Sign-In)
            </li>
            <li>
              <span className="font-medium text-foreground">
                Financial Information (via Plaid):
              </span>{" "}
              Bank account details (account number, type, balance), transaction
              history (merchant name, amount, date, category), and account
              metadata provided by your financial institution
            </li>
          </ul>
          <p className="text-base leading-7 text-muted-foreground">
            We do not collect your bank login credentials. All bank connections
            are handled securely by Plaid.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            We use the collected information to:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>Provide spending insights, track expenses, and generate reports</li>
            <li>Categorize transactions automatically</li>
            <li>Display account balances and net worth</li>
            <li>Improve the application (bug fixes and feature development)</li>
            <li>Provide customer support to you and your family members</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            3. Plaid Integration
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            MoneyInsight uses Plaid to connect to your financial institutions.
            When you link a bank account:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>Plaid securely handles the connection</li>
            <li>We receive an access_token from Plaid</li>
            <li>
              We only request the minimum necessary data (transactions and
              balance)
            </li>
          </ul>
          <p className="text-base leading-7 text-muted-foreground">
            For more information, please refer to{" "}
            <a
              href="https://plaid.com/legal/#end-user-privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Plaid&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            We do not sell your personal or financial data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            5. Data Storage and Security
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>
              Financial data is stored in Supabase (PostgreSQL) with Row Level
              Security (RLS), meaning each user can only access their own data.
            </li>
            <li>Plaid access_token is encrypted at rest.</li>
            <li>All data transmission uses HTTPS/TLS.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            6. Data Deletion
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>
              When you unlink a financial institution or request data deletion,
              MoneyInsight promptly requests Plaid to revoke access to the
              connected institution.
            </li>
            <li>
              MoneyInsight provides options to either retain the corresponding
              financial data for historical insights or delete that data from the
              application.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            7. Your Rights
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            You have the right to:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
            <li>Access, correct, or delete your data</li>
            <li>Revoke bank connections at any time (via &quot;Unlink Account&quot;)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
