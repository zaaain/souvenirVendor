import { useState, useMemo } from 'react'
import { SummaryCard } from '@components/card'
import { ConversionRateCard } from '@components/card'
import { VisitsByDeviceCard } from '@components/card'
import { UsersVisitsCard } from '@components/card'
import { AgeDistributionCard } from '@components/card'
import { CategoryPerformanceCard } from '@components/card'
import { SalesTrendsComparisonCard } from '@components/card'
import { RecentOrdersCard } from '@components/card'
import { useGetDashboardQuery, useGetAnalyticsSalesQuery, type AnalyticsPeriod } from '@store/features/dashboard/dashboardSlice'

const formatCurrency = (n: number) => (n == null || Number.isNaN(n) ? '$0' : `$${Number(n).toLocaleString()}`)

const Dashboard = () => {
  const [conversionRateTab, setConversionRateTab] = useState('week')
  const [salesPeriod, setSalesPeriod] = useState<AnalyticsPeriod>('month')
  const [recentOrdersPage, setRecentOrdersPage] = useState(1)
  const recentOrdersItemsPerPage = 10

  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardQuery()
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAnalyticsSalesQuery({ period: salesPeriod })

  const isLoading = dashboardLoading || analyticsLoading

  const revenueSummaryData = useMemo(() => {
    const r = dashboardData?.data?.revenue
    const total = r?.total ?? 0
    const tax = r?.tax ?? 0
    const shipping = r?.shipping ?? 0
    const net = total - tax - shipping
    return [
      { heading: 'Revenue Summary', period: 'Total', value: formatCurrency(total), barColor: '#10B981' },
      { heading: 'Tax', period: '', value: formatCurrency(tax), barColor: '#EF4444' },
      { heading: 'Shipping', period: '', value: formatCurrency(shipping), barColor: '#8B5CF6' },
      { heading: 'Net Revenue', period: 'All Time', value: formatCurrency(net), barColor: '#F59E0B' },
    ]
  }, [dashboardData?.data?.revenue])

  const ordersData = useMemo(() => {
    const o = dashboardData?.data?.orders
    const total = o?.total ?? 0
    const pending = o?.pending ?? 0
    const processing = o?.processing ?? 0
    const delivered = o?.delivered ?? 0
    return [
      { heading: 'Total Orders', period: '', value: String(total), barColor: '#06B6D4' },
      { heading: 'Pending Orders', period: '', value: String(pending), barColor: '#3B82F6' },
      { heading: 'Processing', period: '', value: String(processing), barColor: '#84CC16' },
      { heading: 'Delivered', period: '', value: String(delivered), barColor: '#14B8A6' },
    ]
  }, [dashboardData?.data?.orders])

  const recentOrdersRows = useMemo(() => {
    const fromApi = dashboardData?.data?.recentOrders
    if (!fromApi?.length) return []
    return fromApi.map((row, i) => {
      const id = row._id ?? row.orderId ?? row.orderNumber ?? ''
      const amount = row.amount ?? row.total
      const amountStr = typeof amount === 'number' ? formatCurrency(amount) : String(amount ?? '')
      return {
        rowNum: i + 1,
        orderId: row.orderId ?? row.orderNumber ?? `#${id}`,
        orderLink: `/orders/${id}`,
        customer: row.customerName ?? row.customer ?? '',
        product: row.productName ?? row.product ?? '',
        deliveryAddress: row.deliveryAddress ?? row.address ?? '',
        amount: amountStr,
        status: row.status ?? 'Pending',
        date: row.date ?? row.createdAt ?? '',
      }
    })
  }, [dashboardData?.data?.recentOrders])

  const pendingOrdersCount = dashboardData?.data?.orders?.pending ?? 0
  const salesTrendData = useMemo(() => {
    const salesData = analyticsData?.data?.salesData
    if (salesData?.length) {
      return salesData.map((t) => ({
        day: t.day ?? t.date ?? t.label ?? '',
        thisWeek: t.thisWeek ?? t.total ?? t.amount ?? 0,
        lastWeek: t.lastWeek ?? 0,
      }))
    }
    return [
      { day: 'Mon', thisWeek: 0, lastWeek: 0 },
      { day: 'Tue', thisWeek: 0, lastWeek: 0 },
      { day: 'Wed', thisWeek: 0, lastWeek: 0 },
      { day: 'Thu', thisWeek: 0, lastWeek: 0 },
      { day: 'Fri', thisWeek: 0, lastWeek: 0 },
      { day: 'Sat', thisWeek: 0, lastWeek: 0 },
      { day: 'Sun', thisWeek: 0, lastWeek: 0 },
    ]
  }, [analyticsData?.data?.salesData])
  const conversionData = useMemo(() => {
    const fromApi = analyticsData?.data?.conversionRate
    if (typeof fromApi === 'number') return `${fromApi}%`
    return '25%'
  }, [analyticsData?.data?.conversionRate])
  const conversionChartData = useMemo(() => {
    const fromApi = analyticsData?.data?.conversionChart
    if (fromApi?.length) return fromApi.map((c) => ({ name: c.name ?? '', value: c.value ?? 0, color: c.color ?? '#3B82F6' }))
    return [
      { name: 'Cart', value: 35, color: '#3B82F6' },
      { name: 'Purchase', value: 25, color: '#10B981' },
      { name: 'Checkout', value: 29, color: '#F59E0B' },
    ]
  }, [analyticsData?.data?.conversionChart])
  const visitsByDeviceItems = useMemo(() => {
    const fromApi = analyticsData?.data?.visitsByDevice
    if (fromApi?.length) return fromApi.map((v) => ({ icon: v.icon ?? 'mobile', label: v.label ?? '', percent: v.percent ?? '0%' }))
    return [
      { icon: 'mobile', label: 'Mobile', percent: '35%' },
      { icon: 'laptop', label: 'Laptop', percent: '35%' },
      { icon: 'tablet', label: 'Tablet', percent: '35%' },
      { icon: 'other', label: 'Other', percent: '35%' },
    ]
  }, [analyticsData?.data?.visitsByDevice])
  const usersVisitsValue = analyticsData?.data?.usersVisits != null ? String(analyticsData.data.usersVisits) : '2,847'
  const ageDistributionData = useMemo(() => {
    const fromApi = analyticsData?.data?.ageDistribution
    if (fromApi?.length) return fromApi.map((a) => ({ name: a.name ?? '', value: a.value ?? 0, color: a.color ?? '#10B981' }))
    return [
      { name: '0-18 years', value: 35, color: '#10B981' },
      { name: '18-30 years', value: 30, color: '#3B82F6' },
      { name: '30-40 years', value: 10, color: '#FBBF24' },
      { name: 'Other', value: 10, color: '#F59E0B' },
    ]
  }, [analyticsData?.data?.ageDistribution])
  const categoryPerformanceData = useMemo(() => {
    const fromApi = analyticsData?.data?.categoryPerformance
    if (fromApi?.length) return fromApi.map((c) => ({ name: c.name ?? '', value: c.value ?? 0, color: c.color ?? '#3B82F6' }))
    return [
      { name: 'Medications', value: 45, color: '#3B82F6' },
      { name: 'Supplements', value: 45, color: '#F59E0B' },
      { name: 'Vitamins', value: 45, color: '#10B981' },
      { name: 'Feed', value: 45, color: '#EF4444' },
    ]
  }, [analyticsData?.data?.categoryPerformance])

  return (
    <div className="dashboard-page">
      {/* Revenue Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-ManropeBold text-gray-800 mb-4">Revenue Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {revenueSummaryData.map((card, index) => (
            <SummaryCard
              key={index}
              heading={card.heading}
              period={card.period}
              value={card.value}
              barColor={card.barColor}
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="mb-8">
        <h2 className="text-xl font-ManropeBold text-gray-800 mb-4">Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {ordersData.map((card, index) => (
            <SummaryCard
              key={index}
              heading={card.heading}
              period={card.period}
              value={card.value}
              barColor={card.barColor}
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Analytics Section - Conversion Rate, Visits & Users, Age Distribution */}
      <div className="mb-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
            centerLabel={conversionData}
            data={conversionChartData}
            loading={isLoading}
          />

          {/* Middle Column - Two Separate Cards */}
          <div className="flex flex-col h-full gap-6">
            {/* Visits by Device Card */}
            <VisitsByDeviceCard
              title="Visits by Device"
              subtitle="All Time"
              items={visitsByDeviceItems}
              loading={isLoading}
            />

            {/* Users Visits Card */}
            <UsersVisitsCard
              title="Users Visits"
              subtitle="All Time"
              value={usersVisitsValue}
              loading={isLoading}
              fillHeight={true}
            />
          </div>

          {/* Age Distribution Card */}
          <AgeDistributionCard
            title="Age Distribution"
            subtitle="All Time"
            data={ageDistributionData}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Category Performance & Sales Trends Section */}
      <div className="mb-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-4">
            <CategoryPerformanceCard
              title="Category Performance"
              subtitle="This Week"
              data={categoryPerformanceData}
              loading={isLoading}
            />
          </div>
          <div className="col-span-12 xl:col-span-8">
            <SalesTrendsComparisonCard
              title="Sales Trends"
              data={salesTrendData}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mb-8">
        <RecentOrdersCard
          title="Recent Orders"
          pendingCount={pendingOrdersCount}
          seeAllHref="/orders"
          data={recentOrdersRows}
          currentPage={recentOrdersPage}
          itemsPerPage={recentOrdersItemsPerPage}
          totalResults={recentOrdersRows.length}
          onPageChange={setRecentOrdersPage}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

export default Dashboard