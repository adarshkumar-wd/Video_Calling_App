import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SocketContextProvider } from "./context/SocketContext.tsx";
import App from "./App.tsx";
import "./index.css"

import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </BrowserRouter>
);
