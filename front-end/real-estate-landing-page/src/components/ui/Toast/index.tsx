import toast, { Toast } from "react-hot-toast";
import { Icon } from "../Icon";

const ToastCard = ({
  t,
  type,
  title,
  message,
}: {
  t: Toast;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}) => {
  const config = {
    success: {
      icon: <Icon.CheckMark className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
    },
    error: {
      icon: <Icon.TwitterX className="w-5 h-5 text-red-600" />,
      bgIcon: "bg-red-50",
    },
    info: {
      icon: <Icon.Avatar className="w-5 h-5 text-gray-800" />,
      bgIcon: "bg-gray-100",
    },
  };

  const style = config[type];

  return (
    <div
      className={`
        ${t.visible ? "animate-enter" : "animate-leave"}
        group pointer-events-auto flex w-[200px] max-w-sm items-start gap-4 
        rounded-xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
        border border-gray-100 ring-1 ring-black/5
        transition-all duration-300 hover:shadow-md
      `}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bgIcon}`}
      >
        {style.icon}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 leading-5">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-gray-500 leading-5">{message}</p>
        )}
      </div>

      <button
        onClick={() => toast.dismiss(t.id)}
        className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
      >
        <Icon.Close className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

export const showToast = {
  success: (title: string, message?: string) =>
    toast.custom((t) => (
      <ToastCard t={t} type="success" title={title} message={message} />
    )),
  error: (title: string, message?: string) =>
    toast.custom((t) => (
      <ToastCard t={t} type="error" title={title} message={message} />
    )),
  info: (title: string, message?: string) =>
    toast.custom((t) => (
      <ToastCard t={t} type="info" title={title} message={message} />
    )),
};
