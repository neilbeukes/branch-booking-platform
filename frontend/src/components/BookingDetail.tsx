import type { ReactNode } from 'react';

export interface BookingDetailData {
  confirmationReference: string;
  branch: string;
  branchAddress?: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail?: string;
  status?: string;
}

interface BookingDetailProps {
  data: BookingDetailData;
  children?: ReactNode;
}

/** Reusable booking summary (reference, branch, date/time, customer). Used in confirmation and manage pages. */
export function BookingDetail({ data, children }: BookingDetailProps) {
  return (
    <div className="space-y-4">
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-gray-500">Reference</dt>
          <dd className="font-mono font-medium text-gray-900">{data.confirmationReference}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Branch</dt>
          <dd className="text-gray-900">{data.branch}</dd>
          {data.branchAddress && <dd className="text-gray-500">{data.branchAddress}</dd>}
        </div>
        <div>
          <dt className="text-gray-500">Date & time</dt>
          <dd className="text-gray-900">{data.date} at {data.time}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Name</dt>
          <dd className="text-gray-900">{data.customerName}</dd>
        </div>
        {data.customerEmail != null && (
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{data.customerEmail}</dd>
          </div>
        )}
        {data.status != null && (
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">{data.status}</dd>
          </div>
        )}
      </dl>
      {children}
    </div>
  );
}
