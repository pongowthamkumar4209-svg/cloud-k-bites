import { DietType } from '@/data/products';

const dietConfig: Record<DietType, { label: string; color: string; dot: string }> = {
  veg: { label: 'Veg', color: 'border-green-600', dot: 'bg-green-600' },
  egg: { label: 'Egg', color: 'border-amber-500', dot: 'bg-amber-500' },
  'non-veg': { label: 'Non-Veg', color: 'border-red-600', dot: 'bg-red-600' },
};

const DietBadge = ({ type }: { type: DietType }) => {
  const config = dietConfig[type];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 border-2 ${config.color} rounded`}>
      <span className={`w-2 h-2 rounded-sm ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default DietBadge;
