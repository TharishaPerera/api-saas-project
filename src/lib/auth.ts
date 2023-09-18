import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const mustBeLoggedIn = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }
};

export const getLoggedInUser = async () => {
  const session = await getServerSession(authOptions);
  
  return session ? session : null
};
