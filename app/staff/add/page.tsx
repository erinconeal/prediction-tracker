import { StaffAddView } from '@/components/staff/StaffAddView';

export const metadata = {
  title: 'Add prediction — Staff',
  robots: { index: false, follow: false },
};

export default function StaffAddPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground mb-4">Add a Prediction</h1>
      <StaffAddView />
    </div>
  );
}
