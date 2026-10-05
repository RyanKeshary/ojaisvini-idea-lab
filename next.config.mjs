import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Page transitions use Framer Motion AnimatePresence (View Transitions API
  // has no stable Next.js config flag in 15.1; revisit on upgrade).
};

export default withNextIntl(nextConfig);
