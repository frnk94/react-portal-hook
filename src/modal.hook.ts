import { useContext } from "react";
import { ModalContext } from "./modal.provider";

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalRoot");
  }

  return context;
};
