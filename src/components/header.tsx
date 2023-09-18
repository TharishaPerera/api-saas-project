import Link from "next/link";

const Header = () => {
  return (
    <nav className="max-w-7xl m-auto w-full px-4">
      <div className="flex items-center gap-8 justify-between py-2">
        <Link
          href={"/"}
          className="text-2xl font-semibold hover:opacity-80 uppercase"
        >
          Logo
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={"/#features"}
            className="font-medium text-sm text-black hover:opacity-80"
          >
            Features
          </Link>
          <Link
            href={"/#pricing"}
            className="font-medium text-sm text-black hover:opacity-80"
          >
            Pricing
          </Link>
          <Link
            href={"/dashboard"}
            className="font-medium text-sm text-white bg-black rounded-xl px-4 py-2 hover:opacity-80"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
