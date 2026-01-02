import type { ReactNode } from "react";

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

const DropdownItem = ({
  icon,
  children,
  danger,
  onClick,
}: DropdownItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm
        ${danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};

export default DropdownItem;
