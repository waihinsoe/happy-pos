import ReactDOM from "react-dom/client";
import "./index.css";
import AppProvider from "./contexts/AppContext.tsx";
import Router from "./routes/router.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProvider>
    <Router />
  </AppProvider>
);
