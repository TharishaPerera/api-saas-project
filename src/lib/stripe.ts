import Stripe from "stripe";
import { getLoggedInUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

// price_1NriYyL1QNDLrxWSfDGp6i0K

const prisma = new PrismaClient();

export const stripe = new Stripe(String(process.env.STRIPE_SECRET), {
  apiVersion: "2023-08-16",
});

// create stripe customer id for current user
export const createCustomer = async () => {
  const loggedInUser = await getLoggedInUser();

  if (loggedInUser) {
    const user = await prisma.user.findFirst({
      where: {
        email: loggedInUser.user?.email,
      },
    });

    if (!user?.api_key) {
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          api_key: "secret_" + randomUUID(),
        },
      });
    }
    if (!user?.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: String(user?.email),
      });

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          stripe_customer_id: customer.id,
        },
      });
    }

    // get stripe customer id
    const stripCustomerId = await prisma.user.findFirst({
      where: {
        email: loggedInUser.user?.email,
      },
      select: {
        stripe_customer_id: true,
      },
    });
    return stripCustomerId?.stripe_customer_id;
  }
};

// create stripe checkout link for the customer
export const createCheckoutLink = async (customer: string) => {
  const MAIN_URL = process.env.MAIN_URL;

  const checkout = await stripe.checkout.sessions.create({
    success_url: `${MAIN_URL}/dashboard/billing?success=true`,
    cancel_url: `${MAIN_URL}/dashboard/billing?success=false`,
    customer: customer,
    line_items: [
      {
        price: "price_1NriYyL1QNDLrxWSfDGp6i0K",
      },
    ],
    mode: "subscription",
  });

  return checkout.url;
};

// check whether the current user has a stripe subscription or not
export const hasSubscription = async () => {
  const loggedInUser = await getLoggedInUser();

  if (loggedInUser) {
    const user = await prisma.user.findFirst({
      where: {
        email: loggedInUser.user?.email,
      },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    });

    return subscriptions.data.length > 0;
  }

  return false;
};
