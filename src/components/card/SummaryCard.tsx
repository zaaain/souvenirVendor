import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export interface SummaryCardProps {
  heading: string
  period: string
  value: string
  barColor: string
  loading?: boolean
}

function SummaryCard({
  heading,
  period,
  value,
  barColor,
  loading = false,
}: SummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
        <div className="flex flex-col">
          <Skeleton height={16} width={120} className="mb-2" />
          <Skeleton height={14} width={80} className="mb-4" />
          <Skeleton height={28} width={100} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
      {/* Colored vertical bar on right */}
      <div
        className="absolute top-0 right-0 w-3 h-full rounded-r-xl"
        style={{ backgroundColor: barColor }}
      />
      
      {/* Content */}
      <div className="flex flex-col pr-4">
        <p className="text-sm font-ManropeBold text-gray-800 mb-1">{heading}</p>
        <p className="text-xs font-Manrope text-gray-500 mb-3">{period}</p>
        <p className="text-2xl font-ManropeBold text-primary">{value}</p>
      </div>
    </div>
  )
}

export default SummaryCard
