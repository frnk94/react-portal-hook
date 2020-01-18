import React, { FC, createContext, useState } from "react";
import ReactDOM from "react-dom";
import { randomId } from "./portal.util";

interface Portal {
  close: () => void;
}

interface PrivatePortal extends Portal {
  element: React.ReactPortal;
  id: string;
}

interface OpenOptions {
  shouldQueue?: boolean;
  shouldStack?: boolean;
  appendTo?: Element;
}

type OpenFunc = (
  Component: React.ReactElement,
  options?: OpenOptions
) => Portal;

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
    const { appendTo = document.body } = options;
    const portalId = randomId();

    if (!appendTo) {
      throw new Error("Trying to open a portal in a nonexistent DOM node");
    }

    const portal: Portal = {
      close: () => close(portalId)
    };

    const privatePortal: PrivatePortal = {
      ...portal,
      element: ReactDOM.createPortal(element, appendTo),
      id: portalId
    };

    setPortals(oldPortals => [...oldPortals, privatePortal]);

    return portal;
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
