// src/components/dashboard/DashboardMiddle.jsx
import {
  PlusIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const DashboardMiddle = ({
  monthlyData,
  onAddStory,
  onUploadVideo,
  onManageUsers,
  onSendNewsletter,
  totalSubscribers,
  newToday,
}) => {
  const actions = [
    {
      title: "Add New Story",
      icon: PlusIcon,
      bg: "from-green-50 to-green-100",
      iconBg: "bg-green-500",
      onClick: onAddStory,
    },
    {
      title: "Upload Video",
      icon: ArrowUpTrayIcon,
      bg: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      onClick: onUploadVideo,
    },
    {
      title: "Manage Users",
      icon: UsersIcon,
      bg: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      onClick: onManageUsers,
    },
    {
      title: "Send Newsletter",
      icon: PaperAirplaneIcon,
      bg: "from-yellow-50 to-yellow-100",
      iconBg: "bg-orange-500",
      onClick: onSendNewsletter,
    },
  ];

  const defaultMonths = [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 },
  ];

  const months = monthlyData || defaultMonths;
  const maxValue = Math.max(...months.map(m => m.value), 1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Chart - 12 Months Stories Uploaded */}
      <div className="xl:col-span-6 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Stories Uploaded
          <span className="text-gray-400 font-normal text-sm">
            {" "}
            (This Year)
          </span>
        </h2>

        <div className="flex justify-between items-end h-72 mt-8">
          {months.map((item) => (
            <div key={item.month} className="flex flex-col items-center">
              <span className="text-xs font-semibold mb-2 text-gray-600">
                {item.value}
              </span>
              <div
                className="w-5 rounded-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-500 hover:scale-110"
                style={{
                  height: `${(item.value / maxValue) * 200 + 10}px`,
                  minHeight: '10px',
                }}
              ></div>
              <span className="text-xs mt-3 text-gray-500">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-5">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`bg-gradient-to-br ${action.bg}
                rounded-2xl h-36
                flex flex-col justify-center items-center
                hover:shadow-lg transition-all duration-300
                hover:-translate-y-1 border border-transparent hover:border-gray-200`}
              >
                <div
                  className={`${action.iconBg}
                  w-12 h-12 rounded-full
                  flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-700 text-center text-sm px-2">
                  {action.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Newsletter Subscribers */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="w-7 h-7 text-pink-500" />
            <h2 className="font-bold text-gray-800">
              Newsletter Subscribers
            </h2>
          </div>
          <div className="mt-8">
            <h1 className="text-5xl font-bold">
              {totalSubscribers || 0}
            </h1>
            <p className="text-gray-500 mt-2">
              Total Subscribers
            </p>
            <hr className="my-6" />
            <h2 className="text-3xl font-bold text-green-500">
              {newToday || 0}
            </h2>
            <p className="text-green-600 font-medium">
              New Today
            </p>
          </div>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/2436/2436636.png"
          alt="reading"
          className="w-36 self-end"
        />
      </div>
    </div>
  );
};

export default DashboardMiddle;