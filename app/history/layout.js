export const metadata = {
  title: "Batch Processing History & Download Archives",
  description: "View and re-download previously processed shipping label batches and summary archives.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function HistoryLayout({ children }) {
  return children;
}
