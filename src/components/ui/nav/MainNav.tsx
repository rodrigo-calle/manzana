import Image from "next/image";

const MainNav = () => {
  return (
    <nav className="w-full h-14 border-b-slate-400 fixed top-0 flex flex-row items-center justify-center">
      <div className="flex flex-row items-center w-11/12">
        <Image src="/images/apple.png" width={32} height={32} alt="manzanita"/>
        <h1 className="text-slate-800 font-bold text-lg mt-2">Manzana</h1>
      </div>
    </nav>
  );
};

export default MainNav;
