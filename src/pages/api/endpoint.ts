import { getLoggedInUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { api_key } = req.query;

  if (!api_key) {
    res.status(401).json({
      error: "You must have a valid API key.",
    });
  }
  const user = await prisma.user.findFirst({
    where: {
      api_key: String(api_key),
    },
  });
  if (!user) {
    res.status(401).json({
      error: "There is no user with such API key.",
    });
  }

  const customer = await stripe.customers.retrieve(
    String(user?.stripe_customer_id)
  );
  const subscription = await stripe.subscriptions.list({
    customer: String(user?.stripe_customer_id),
  });
  const item = subscription.data.at(0)?.items.data.at(0);

  if (!item) {
    res.status(403).json({
      error: "You don't have a subscription.",
    });
  }

  const result = await stripe.subscriptionItems.createUsageRecord(
    String(item?.id),
    {
      quantity: 1,
    }
  );

  const data = randomUUID();

  const log = await prisma.log.create({
    data: {
      userId: String(user?.id),
      status: 200,
      method: "GET",
    },
  });

  res.status(200).json({
    status: true,
    special_key: data,
    log: log,
  });
}
