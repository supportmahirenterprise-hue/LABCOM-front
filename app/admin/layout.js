export const metadata = {
  title: "Admin Management Console",
  description: "Internal administration, user access management, and system monitoring.",
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

export default function AdminLayout({ children }) {
  return children;
}
