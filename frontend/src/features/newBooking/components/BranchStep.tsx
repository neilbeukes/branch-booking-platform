import { useQuery } from '@tanstack/react-query';
import { branches } from '../../../api/client';
import type { Branch } from '../../../types';
import { Button } from '../../../components/Button';

interface BranchStepProps {
  onSelect: (branch: Branch) => void;
}

export function BranchStep({ onSelect }: BranchStepProps) {
  const { data: branchList, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: branches.list,
  });

  if (isLoading) return <p className="text-gray-600">Loading branches...</p>;
  if (error) return <p className="text-red-600">Failed to load branches: {error.message}</p>;
  if (!branchList?.length) return <p className="text-gray-600">No branches available.</p>;

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {branchList.map((b) => (
          <li key={b.id}>
            <Button
              variant="secondary"
              onClick={() => onSelect(b)}
              className="w-full justify-start text-left h-auto py-4 flex flex-col items-stretch"
            >
              <span className="font-medium text-gray-900">{b.name}</span>
              <span className="block text-sm text-gray-500 mt-1">{b.address}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
