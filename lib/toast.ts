import { notifications } from "@mantine/notifications";

type ToastOpts = {
  title?: string;
  message: string;
  autoClose?: number | false;
};

/** Thin wrapper around Mantine notifications — green / red / amber. */
export const toast = {
  success({ title = "Success", message, autoClose = 4000 }: ToastOpts) {
    notifications.show({
      title,
      message,
      color: "green",
      autoClose,
    });
  },

  error({ title = "Error", message, autoClose = 6000 }: ToastOpts) {
    notifications.show({
      title,
      message,
      color: "red",
      autoClose,
    });
  },

  info({ title = "Notice", message, autoClose = 5000 }: ToastOpts) {
    notifications.show({
      title,
      message,
      color: "yellow",
      autoClose,
    });
  },
};
