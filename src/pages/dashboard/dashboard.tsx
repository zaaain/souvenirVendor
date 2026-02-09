import { useState } from 'react'
import { SummaryCard } from '@components/card'
import { ConversionRateCard } from '@components/card'
import { VisitsByDeviceCard } from '@components/card'
import { UsersVisitsCard } from '@components/card'
import { AgeDistributionCard } from '@components/card'
import { CategoryPerformanceCard } from '@components/card'
import { SalesTrendsComparisonCard } from '@components/card'
import { RecentOrdersCard } from '@components/card'
const Dashboard = () => {
  // State for Conversion Rate tab
  const [conversionRateTab, setConversionRateTab] = useState('week')

  // State for Recent Orders pagination
  const [recentOrdersPage, setRecentOrdersPage] = useState(1)
  const recentOrdersItemsPerPage = 10

  // Revenue Summary Data - will be replaced with actual API data
  const revenueSummaryData = [
    {
      heading: 'Revenue Summary',
      period: 'Today',
      value: '$0',
      barColor: '#10B981', // Green
    },
    {
      heading: 'Revenue Summary',
      period: 'This Week',
      value: '$0',
      barColor: '#EF4444', // Red
    },
    {
      heading: 'Revenue Summary',
      period: 'This Month',
      value: '$0',
      barColor: '#8B5CF6', // Purple
    },
    {
      heading: 'Revenue Summary',
      period: 'All Time',
      value: '$0',
      barColor: '#F59E0B', // Orange
    },
  ]

  // Orders Data - will be replaced with actual API data
  const ordersData = [
    {
      heading: 'Total Orders',
      period: 'Today',
      value: '0',
      barColor: '#06B6D4', // Light Blue / Cyan
    },
    {
      heading: 'Total Orders',
      period: 'This Month',
      value: '0',
      barColor: '#3B82F6', // Royal Blue
    },
    {
      heading: 'Pending Orders',
      period: 'Today',
      value: '0',
      barColor: '#84CC16', // Lime Green
    },
    {
      heading: 'Completed Orders',
      period: 'All Time',
      value: '0',
      barColor: '#14B8A6', // Teal
    },
  ]

  return (
    <div className="dashboard-page">
      {/* Revenue Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-ManropeBold text-gray-800 mb-4">Revenue Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueSummaryData.map((card, index) => (
            <SummaryCard
              key={index}
              heading={card.heading}
              period={card.period}
              value={card.value}
              barColor={card.barColor}
              loading={false}
            />
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="mb-8">
        <h2 className="text-xl font-ManropeBold text-gray-800 mb-4">Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ordersData.map((card, index) => (
            <SummaryCard
              key={index}
              heading={card.heading}
              period={card.period}
              value={card.value}
              barColor={card.barColor}
              loading={false}
            />
          ))}
        </div>
      </div>

      {/* Analytics Section - Conversion Rate, Visits & Users, Age Distribution */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Rate Card */}
          <ConversionRateCard
            title="Conversion Rate"
            subtitle="This Week"
            tabs={[
              { value: 'week', label: 'Weekly' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            selectedTab={conversionRateTab}
            onTabChange={setConversionRateTab}
            centerLabel="25%"
            data={[
              { name: 'Cart', value: 35, color: '#3B82F6' }, // Blue
              { name: 'Purchase', value: 25, color: '#10B981' }, // Green
              { name: 'Checkout', value: 29, color: '#F59E0B' }, // Orange
            ]}
            loading={false}
          />

          {/* Middle Column - Two Separate Cards */}
          <div className="flex flex-col h-full gap-6">
            {/* Visits by Device Card */}
            <VisitsByDeviceCard
              title="Visits by Device"
              subtitle="All Time"
              items={[
                { icon: 'mobile', label: 'Mobile', percent: '35%' },
                { icon: 'laptop', label: 'Laptop', percent: '35%' },
                { icon: 'tablet', label: 'Tablet', percent: '35%' },
                { icon: 'other', label: 'Other', percent: '35%' },
              ]}
              loading={false}
            />

            {/* Users Visits Card */}
            <UsersVisitsCard
              title="Users Visits"
              subtitle="All Time"
              value="2,847"
              loading={false}
              fillHeight={true}
            />
          </div>

          {/* Age Distribution Card */}
          <AgeDistributionCard
            title="Age Distribution"
            subtitle="All Time"
            data={[
              { name: '0-18 years', value: 35, color: '#10B981' }, // Green
              { name: '18-30 years', value: 30, color: '#3B82F6' }, // Blue
              { name: '30-40 years', value: 10, color: '#FBBF24' }, // Yellow
              { name: 'Other', value: 10, color: '#F59E0B' }, // Orange
            ]}
            loading={false}
          />
        </div>
      </div>

      {/* Category Performance & Sales Trends Section */}
      <div className="mb-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Category Performance Card - 12 cols on sm/xs, 4 cols on md+ */}
          <div className="col-span-12 md:col-span-4">
            <CategoryPerformanceCard
              title="Category Performance"
              subtitle="This Week"
              data={[
                { name: 'Medications', value: 45, color: '#3B82F6' }, // Blue
                { name: 'Supplements', value: 45, color: '#F59E0B' }, // Orange
                { name: 'Vitamins', value: 45, color: '#10B981' }, // Green
                { name: 'Feed', value: 45, color: '#EF4444' }, // Red
              ]}
              loading={false}
            />
          </div>

          {/* Sales Trends Comparison Card - 12 cols on sm/xs, 8 cols on md+ */}
          <div className="col-span-12 md:col-span-8">
            <SalesTrendsComparisonCard
              title="Sales Trends"
              data={[
                { day: 'Mon', thisWeek: 800, lastWeek: 600 },
                { day: 'Tue', thisWeek: 950, lastWeek: 750 },
                { day: 'Wed', thisWeek: 1100, lastWeek: 900 },
                { day: 'Thu', thisWeek: 1050, lastWeek: 1050 },
                { day: 'Fri', thisWeek: 1200, lastWeek: 1100 },
                { day: 'Sat', thisWeek: 1000, lastWeek: 950 },
                { day: 'Sun', thisWeek: 850, lastWeek: 800 },
              ]}
              loading={false}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mb-8">
        <RecentOrdersCard
          title="Recent Orders"
          pendingCount={5}
          seeAllHref="/orders"
          data={[
            {
              rowNum: 1,
              orderId: '#ORD-2025-001',
              orderLink: '/orders/ORD-2025-001',
              customer: 'Dr. Sarah John...',
              product: 'Amoxicilin',
              deliveryAddress: '123 Main Street, City, State 12345',
              amount: '$123,000',
              status: 'Pending',
              date: 'Jan 15, 2025',
            },
            {
              rowNum: 2,
              orderId: '#ORD-2025-002',
              orderLink: '/orders/ORD-2025-002',
              customer: 'Dr. Sarah John...',
              product: 'Amoxicilin',
              deliveryAddress: '123 Main Street, City, State 12345',
              amount: '$123,000',
              status: 'Pending',
              date: 'Jan 15, 2025',
            },
            {
              rowNum: 3,
              orderId: '#ORD-2025-003',
              orderLink: '/orders/ORD-2025-003',
              customer: 'Dr. Sarah John...',
              product: 'Amoxicilin',
              deliveryAddress: '123 Main Street, City, State 12345',
              amount: '$123,000',
              status: 'Pending',
              date: 'Jan 15, 2025',
            },
          ]}
          currentPage={recentOrdersPage}
          itemsPerPage={recentOrdersItemsPerPage}
          totalResults={3}
          onPageChange={setRecentOrdersPage}
          loading={false}
        />
      </div>
    </div>
  )
}

export default Dashboard