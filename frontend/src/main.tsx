
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // Suppress TypeScript error for side-effect CSS import when no d.ts is provided
  // @ts-ignore: TS cannot find module for CSS side-effect import
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  