import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-10">
        <ShieldAlert className="mx-auto text-navy-900" size={40} />
        <h1 className="text-2xl font-bold text-navy-900 mt-4">Access restricted</h1>
        <p className="text-gray-600 mt-3">
          Your account doesn&apos;t have access to this page, or your enrollment is not
          yet active. If you believe this is a mistake, please contact the programme
          admin.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 text-sm font-semibold text-navy-900 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
