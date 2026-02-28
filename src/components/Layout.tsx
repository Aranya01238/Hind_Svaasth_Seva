import { ReactNode } from "react";
import Navbar from "./Navbar";
import NurseMaya from "./NurseMaya";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <NurseMaya />
    </>
  );
};

export default Layout;
