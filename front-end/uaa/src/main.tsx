import App from "./App.tsx";
import { store } from "./store";
import { HeroUIProvider } from "@heroui/react";
import { queryClient } from "@shared/queryClient.ts";
import "@styles/index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onOfflineReady() {
    console.log("onOfflineReady");
  },
  immediate: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <ReactQueryDevtools initialIsOpen={true} />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HeroUIProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);

updateSW();
