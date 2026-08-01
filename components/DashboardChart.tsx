'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'

interface ChartData {
    date: string
    views: number
}

export default function DashboardChart({ data }: { data: ChartData[]}) {
    return (
        <div className="bg-[#131a2c] p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Daily Views (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="views" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}