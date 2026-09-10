import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
