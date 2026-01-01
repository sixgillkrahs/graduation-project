import Image from "next/image";
import bg from "@/assets/images/auth/bg.jpg";

const Sider = () => {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
        <Image src={bg} alt="Logo" className="object-cover" fill />
      </div>
    </>
  );
};

export default Sider;
