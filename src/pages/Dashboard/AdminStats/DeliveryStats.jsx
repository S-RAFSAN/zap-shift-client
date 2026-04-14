import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';

const CHART_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
];

const normalizeStatsPayload = (data) => {
  if (Array.isArray(data)) {
    return {
      byDeliveryStatus: data,
      byPaymentStatus: [],
      summary: null,
    };
  }
  if (data && typeof data === 'object') {
    return {
      byDeliveryStatus: data.byDeliveryStatus ?? [],
      byPaymentStatus: data.byPaymentStatus ?? [],
      summary: data.summary ?? null,
    };
  }
  return { byDeliveryStatus: [], byPaymentStatus: [], summary: null };
};

const SUMMARY_LABELS = {
  totalParcels: 'Total parcels',
  totalUsers: 'Registered users',
  pendingRiderApplications: 'Rider applications (pending)',
  approvedRiderApplications: 'Rider applications (approved)',
  paymentRecords: 'Payment records',
};

const DeliveryStats = () => {
  const axiosSecure = useAxiosSecure();
  const { data: rawStats } = useQuery({
    queryKey: ['delivery-status-stats'],
    queryFn: async () => {
      const res = await axiosSecure.get('/parcels/delivery-status/stats');
      return res.data;
    },
  });

  const { byDeliveryStatus, byPaymentStatus, summary } = useMemo(
    () => normalizeStatsPayload(rawStats),
    [rawStats],
  );

  const pieChartData = byDeliveryStatus.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const summaryEntries = summary
    ? Object.entries(summary).filter(
        ([, v]) => typeof v === 'number' && !Number.isNaN(v),
      )
    : [];

  const overviewPieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary)
      .filter(
        ([, v]) => typeof v === 'number' && !Number.isNaN(v) && v > 0,
      )
      .map(([key, count]) => ({
        name: SUMMARY_LABELS[key] ?? key,
        value: count,
      }));
  }, [summary]);

  return (
    <div className="space-y-10">
      {summaryEntries.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="flex flex-wrap gap-4">
              {summaryEntries.map(([key, count]) => (
                <div className="stats shadow" key={key}>
                  <div className="stat">
                    <div className="stat-title text-lg">
                      {SUMMARY_LABELS[key] ?? key}
                    </div>
                    <div className="stat-value text-2xl font-bold">{count}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full h-80 min-h-[280px] rounded-xl bg-base-100 p-4 shadow">
              {overviewPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label
                    >
                      {overviewPieData.map((entry, index) => (
                        <Cell
                          key={`overview-${entry.name}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-base-content/60 text-sm p-4">
                  All overview counts are zero — nothing to plot yet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">By delivery status</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {byDeliveryStatus.map((stat) => (
            <div className="stats shadow" key={String(stat._id)}>
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-8 w-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title text-2xl font-bold">{stat._id}</div>
                <div className="stat-value text-2xl font-bold">{stat.count}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[50vh] rounded-xl bg-base-100 p-4 shadow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {byPaymentStatus.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">By payment status</h2>
          <div className="flex flex-wrap gap-4">
            {byPaymentStatus.map((stat) => (
              <div className="stats shadow" key={String(stat._id)}>
                <div className="stat">
                  <div className="stat-title text-2xl font-bold">{stat._id}</div>
                  <div className="stat-value text-2xl font-bold">{stat.count}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DeliveryStats;
