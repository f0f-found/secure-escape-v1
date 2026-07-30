type WelcomeBannerProps = {
  fullName?: string;
};

export default function WelcomeBanner({ fullName }: WelcomeBannerProps) {
  const firstName = fullName?.split(" ")[0] ?? "Analyst";

  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome back, {firstName}
      </h1>

      <p className="mt-2 text-slate-600">
        Here's an overview of your assigned investigations for today.
      </p>
    </section>
  );
}
