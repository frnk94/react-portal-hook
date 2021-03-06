import React, { FC, createContext, useState } from "react";
import ReactDOM from "react-dom";
import { randomId } from "./portal.util";

export interface Portal {
  close: () => void;
}

interface PrivatePortal extends Portal {
  element: React.ReactPortal;
  id: string;
}

interface OpenOptions {
  appendTo?: Element;
  onClose?: () => void;
}

type OpenFunc = (
  element: ((portal: Portal) => React.ReactElement) | React.ReactElement,
  options?: OpenOptions
) => void;

type CloseFunc = (portalId: string) => void;

export interface PortalManager {
  open: OpenFunc;
}

export const PortalContext = createContext<PortalManager | undefined>(
  undefined
);

export const PortalProvider: FC = ({ children }) => {
  const [portals, setPortals] = useState<PrivatePortal[]>([]);

  const open: OpenFunc = (element, options = {}) => {
    const { appendTo = document.body, onClose } = options;
    const portalId = randomId();

    if (!appendTo) {
      throw new Error("Trying to open a portal in a nonexistent DOM node");
    }

    const portal: Portal = {
      close: () => {
        close(portalId);
        onClose && onClose();
      }
    };

    const portalElement =
      typeof element === "function" ? element(portal) : element;

    const privatePortal: PrivatePortal = {
      ...portal,
      element: ReactDOM.createPortal(portalElement, appendTo),
      id: portalId
    };

    setPortals(oldPortals => [...oldPortals, privatePortal]);
  };

  const close: CloseFunc = portalId => {
    setPortals(oldPortals => oldPortals.filter(({ id }) => id !== portalId));
  };

  return (
    <PortalContext.Provider value={{ open }}>
      {children}
      {portals.map(({ element }) => element)}
    </PortalContext.Provider>
  );
};
