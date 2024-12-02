import clsx from "clsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { CircleAlert, CircleCheck, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import { useAlert } from "@/hooks";
import { clearAlert } from "@/state";
import { useBooleanParam } from "@/util/query";

const Alert = () => {
  const [print] = useBooleanParam("print");
  const dispatch = useDispatch();
  const alert = useAlert();

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(clearAlert());
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [alert, dispatch]);

  const type = alert.type || (alert.progress >= 100 ? "success" : "info");
  const done = !alert.progress || alert.progress >= 100;
  const Icon = type === "success" ? CircleCheck : CircleAlert;

  if (print || !alert.open) {
    return null;
  }

  return (
    <div
      className={clsx(
        "print:hidden fixed z-50 bottom-0 left-0 md:left-auto right-0 border rounded-xl m-8 py-2 px-4 bg-muted md:w-96",
        {
          "border-success": type === "success",
          "border-info": type === "info",
          "border-warning": type === "warning",
          "border-error": type === "error",
        },
      )}
      onClick={() => dispatch(clearAlert())}
    >
      <div className="flex flex-row justify-start items-center gap-2 text-2xl">
        <Icon
          className={clsx("w-6 h-6", {
            "text-success": type === "success",
            "text-info": type === "info",
            "text-warning": type === "warning",
            "text-error": type === "error",
          })}
        />
        <p>{alert.title}</p>
      </div>
      {alert.progress && (
        <div className="my-2">
          <Progress value={alert.progress} />
        </div>
      )}
      <div>{alert.message}</div>
      {done && <X className="absolute right-2 top-2" />}
    </div>
  );
};

export default Alert;
