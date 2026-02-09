import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'

export interface ComparisonDataPoint {
  day: string
  thisWeek: number
  lastWeek: number
}

interface ComparisonTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    payload?: { day?: string }
  }>
  onActiveChange: (day: string | null) => void
}

function ComparisonTooltipContent({
  active,
  payload,
  onActiveChange,
}: ComparisonTooltipContentProps) {
  useEffect(() => {
    if (active && payload?.[0]?.payload?.day != null) {
      onActiveChange(payload[0].payload!.day!)
    } else {
      onActiveChange(null)
    }
  }, [active, payload, onActiveChange])

  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-lg border border-gray-100">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-Manrope text-gray-800">
            {entry.name}: ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export interface ComparisonLineChartProps {
  data: ComparisonDataPoint[]
  height?: number
  thisWeekColor?: string
  lastWeekColor?: string
  yDomain?: [number, number]
  xAxisLabels?: string[]
}

function ComparisonLineChart({
  data,
  height = 240,
  thisWeekColor = '#3B82F6', // Blue
  lastWeekColor = '#10B981', // Green
  yDomain = [0, 1400],
  xAxisLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}: ComparisonLineChartProps) {
  const [activeDay, setActiveDay] = useState<string | null>(null)

  function formatYAxis(value: number): string {
    if (value >= 1000) return `$${value / 1000}k`
    return `$${value}`
  }

  // Transform data to include day labels
  const chartData = data.map((point, index) => ({
    ...point,
    dayLabel: xAxisLabels[index] || point.day,
  }))

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal vertical={false} />
          <XAxis
            dataKey="dayLabel"
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'Manrope' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            domain={yDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'Manrope' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            content={<ComparisonTooltipContent onActiveChange={setActiveDay} />}
            cursor={{ stroke: '#94a3b8', strokeDasharray: '5 5', strokeWidth: 1 }}
          />
          {activeDay && (
            <ReferenceLine
              x={activeDay}
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
          )}
          <Legend
            wrapperStyle={{ paddingTop: '8px' }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-Manrope text-gray-600">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="thisWeek"
            stroke={thisWeekColor}
            strokeWidth={2}
            dot={{ r: 4, fill: thisWeekColor }}
            activeDot={{ r: 6, fill: thisWeekColor, stroke: '#fff', strokeWidth: 2 }}
            name="This Week"
          />
          <Line
            type="monotone"
            dataKey="lastWeek"
            stroke={lastWeekColor}
            strokeWidth={2}
            dot={{ r: 4, fill: lastWeekColor }}
            activeDot={{ r: 6, fill: lastWeekColor, stroke: '#fff', strokeWidth: 2 }}
            name="Last Week"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComparisonLineChart
