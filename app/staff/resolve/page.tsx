import { StaffResolveView } from '@/components/staff/StaffResolveView';

export const metadata = {
  title: 'Resolve prediction — Staff',
  robots: { index: false, follow: false },
};

export default function StaffResolvePage() {
  return (
    <div>
      <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground mb-4">Resolve a Prediction</h1>
      <StaffResolveView />
    </div>
  );
}
