'use client';

interface User {
  _id: string;
  name?: string;
  phone?: string;
  avatar?: string;
  rating?: {
    avg?: number;
  };
  calls?: number;
  callMinutes?: number;
  [key: string]: any;
}

interface ProfileCardProps {
  user: User | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-2 ring-gray-100">
              <span>{user.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {user.name || 'Partner'}
          </h2>
          <p className="text-gray-500 font-medium text-sm truncate">{user.phone || 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Rating</p>
          <p className="text-2xl font-bold text-gray-800 flex items-center gap-1">
            {user.rating?.avg?.toFixed(1) || '0.0'}
            <span className="text-yellow-400 text-lg">★</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Total Calls</p>
          <p className="text-2xl font-bold text-gray-800">{user.calls || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Call Minutes</p>
          <p className="text-2xl font-bold text-gray-800">
            {user.callMinutes ? Math.round(user.callMinutes) : 0}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">RPM</p>
          <p className="text-2xl font-bold text-gray-800">₹{user.rpm || 0}</p>
        </div>
      </div>
    </div>
  );
}

