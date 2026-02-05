import { ComparisonLineChart } from '@components/chart'
import type { ComparisonDataPoint } from '@components/chart'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export interface SalesTrendsComparisonCardProps {
  title?: string
  data: ComparisonDataPoint[]
  loading?: boolean
}

function SalesTrendsComparisonCard({
  title = 'Sales Trends',
  data,
  loading = false,
}: SalesTrendsComparisonCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Skeleton height={22} width={140} className="mb-4" />
        <Skeleton height={240} className="rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl h-full border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">{title}</h2>
      <ComparisonLineChart data={data} height={305} />
    </div>
  )
}

export default SalesTrendsComparisonCard
