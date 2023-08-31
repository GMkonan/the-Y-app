import type { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className="flex items-center justify-center bg-gray-950">
        <div className="flex h-full w-full flex-col border-x border-gray-800 md:w-[600px]">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
