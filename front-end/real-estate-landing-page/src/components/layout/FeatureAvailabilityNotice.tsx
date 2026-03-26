const FeatureAvailabilityNotice = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <section className="w-full rounded-[32px] border border-border bg-card p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-5 h-2 w-20 rounded-full bg-primary" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </section>
    </div>
  );
};

export default FeatureAvailabilityNotice;
