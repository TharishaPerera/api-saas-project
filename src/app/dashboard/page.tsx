import { getLoggedInUser } from "@/lib/auth";
import {
  createCheckoutLink,
  createCustomer,
  hasSubscription,
  stripe,
} from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const Page = async () => {
  const stripeCustomerId = await createCustomer();
  const hasSub = await hasSubscription();
  const checkoutLink = await createCheckoutLink(String(stripeCustomerId));

  const loggedInUser = await getLoggedInUser();

  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      email: loggedInUser?.user?.email,
    },
  });

  const top10RecentLogs = await prisma.log.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      created: "desc",
    },
    take: 10,
  });

  let currentUsage = 0;

  if (hasSub) {
    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    });

    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptions.data.at(0)?.id,
    });
    
    currentUsage = invoice.amount_due
  }

  return (
    <main>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl text-center px-4 py-2 bg-emerald-400 font-medium text-sm text-white">
              You have a subscription
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl">
              <p className="text-sm text-black font-medium py-4 px-6">
                Current Usage
              </p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {currentUsage/100}
              </p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl">
              <p className="text-sm text-black font-medium py-4 px-6">
                API Key
              </p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {user?.api_key}
              </p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl">
              <p className="text-sm text-black font-medium py-4 px-6">
                Log Events
              </p>
              {top10RecentLogs.map((log, index) => (
                <div
                  className="flex items-center gap-4 justify-between"
                  key={index}
                >
                  <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                    {log.method}
                  </p>
                  <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                    {log.status}
                  </p>
                  <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                    {log.created.toDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[60vh] grid place-items-center rounded-xl px-6 py-10 bg-slate-100">
            <Link
              href={String(checkoutLink)}
              className="font-medium text-sm hover:underline"
            >
              You don't have a subscription. Checkout now!
            </Link>
          </div>
        </>
      )}
    </main>
  );
};

export default Page;
