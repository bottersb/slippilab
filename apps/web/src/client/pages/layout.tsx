import { NavLink, Outlet, useRouteData } from "@solidjs/router";
import { Match, Show, Switch } from "solid-js";

import { LocalProgress } from "~/client/components/app/LocalProgress";
import { LayoutData } from "~/client/pages/layout.data";
import { lastWatched } from "~/client/state/watch";

export default function Layout() {
  const data = useRouteData<typeof LayoutData>();
  return (
    <>
      <div class="border-b">
        <nav class="container py-2 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <NavLink class="flex items-center gap-1 mr-4" href="/">
              <div class="i-gg-shape-hexagon text-primary text-3xl" />
              <div class="text-lg text-foreground font-medium">slippilab</div>
              <div class="self-start text-xs text-primary">beta</div>
            </NavLink>
            <NavLink
              href="/browse"
              class="font-medium"
              activeClass="text-foreground/90"
              inactiveClass="text-foreground/60 hover:text-foreground/80"
            >
              Browse
            </NavLink>
            <NavLink
              href="/personal"
              class="font-medium"
              activeClass="text-foreground/90"
              inactiveClass="text-foreground/60 hover:text-foreground/80"
            >
              Personal
            </NavLink>
            <Show when={lastWatched()}>
              <NavLink
                href={`/watch/${lastWatched()}`}
                class="font-medium"
                activeClass="text-foreground/90"
                inactiveClass="text-foreground/60 hover:text-foreground/80"
              >
                Watch
              </NavLink>
            </Show>
          </div>
          <div class="flex justify-between items-center gap-12">
            <div class="flex items-center gap-3">
              <a
                href="https://github.com/frankborden/slippilab"
                target="_blank"
                class="flex items-center"
              >
                <div class="i-mdi-github text-2xl text-foreground/80 hover:text-foreground" />
              </a>
              <a
                href="https://twitter.com/slippilab"
                target="_blank"
                class="flex items-center"
              >
                <div class="i-mdi-twitter text-2xl text-foreground/80 hover:text-foreground" />
              </a>
            </div>
            <div class="flex items-center gap-3">
              <Show when={data()} fallback="Loading...">
                {(data) => (
                  <Switch>
                    <Match when={data().user}>
                      <a
                        href="/api/logout"
                        class="font-medium text-foreground/80 hover:text-foreground"
                      >
                        Logout
                      </a>
                    </Match>
                    <Match when={!data().user}>
                      <a
                        href="/api/login/discord"
                        class="font-medium text-foreground/80 hover:text-foreground"
                      >
                        Login
                      </a>
                    </Match>
                  </Switch>
                )}
              </Show>
            </div>
          </div>
        </nav>
      </div>
      <LocalProgress />
      <main class="mt-8 container">
        <Outlet />
      </main>
    </>
  );
}
