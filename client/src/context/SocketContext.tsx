import { createContext, useMemo, useContext, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

const socketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

export const useSocket = () => {
  const socket = useContext(socketContext);
  return socket;
};

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({
  children,
}: SocketContextProviderProps) => {

  const socket = useMemo(() => io("http://localhost:3000"), []);

  return (
    <socketContext.Provider value={socket}>{children}</socketContext.Provider>
  );
};
