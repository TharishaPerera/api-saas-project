import Header from "@/components/header";
import { ReactNode } from "react";
import { mustBeLoggedIn } from "@/lib/auth";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  // user must be logged in to access dashboard. otherwise redirect to login page
  await mustBeLoggedIn();

  return (
    <div className="">
      <Header />
      <div className="max-w-7xl m-auto w-full px-4">{children}</div>
    </div>
  );
};

export default DashboardLayout;
