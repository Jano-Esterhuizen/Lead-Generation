import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Leads',
  description: 'Manage and track your potential business opportunities.',
};

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 