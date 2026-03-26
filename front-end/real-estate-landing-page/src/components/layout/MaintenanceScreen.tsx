import type { LandingSettings } from "@/lib/landing-settings";

const MaintenanceScreen = ({
  settings,
}: {
  settings: Pick<
    LandingSettings,
    "systemName" | "systemTagline" | "supportEmail" | "supportPhone" | "brandColor"
  >;
}) => {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-background px-4 py-16 text-foreground md:px-10">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[36px] border border-border bg-card shadow-[0_24px_90px_-45px_rgba(0,0,0,0.35)]">
          <div
            className="h-3 w-full"
            style={{ backgroundColor: settings.brandColor }}
          />
          <div className="grid gap-10 px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div>
              <p
                className="mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white"
                style={{ backgroundColor: settings.brandColor }}
              >
                Maintenance Mode
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {settings.systemName} is temporarily unavailable
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                {settings.systemTagline}
              </p>
              <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
                We are applying updates and will reopen the landing experience as
                soon as the platform is stable again.
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-muted/20 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Need help now?
              </p>
              <div className="mt-5 space-y-4 text-sm text-foreground">
                <div>
                  <div className="font-medium">Support email</div>
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {settings.supportEmail}
                  </a>
                </div>
                <div>
                  <div className="font-medium">Support phone</div>
                  <a
                    href={`tel:${settings.supportPhone}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {settings.supportPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MaintenanceScreen;
