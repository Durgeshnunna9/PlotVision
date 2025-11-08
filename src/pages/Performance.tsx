import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Target,
  IndianRupee,
  Building,
  Calendar,
  Star,
  BarChart as BarChartIcon,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const Performance = () => {
  const { user } = useAuth()
  const [performance, setPerformance] = useState<any>(null)
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // 🟢 Fetch main performance summary
        const perfRes = await fetch(`http://localhost:8090/api/performance/user/${user.userId}`)
        if (!perfRes.ok) throw new Error("Failed to fetch performance data")
        const perfData = await perfRes.json()
        console.log("Performance summary:", perfData)
        setPerformance(perfData)

        // 🟢 Fetch monthly chart data
        const chartRes = await fetch(`http://localhost:8090/api/performance/user/${user.userId}/monthly`)
        if (!chartRes.ok) throw new Error("Failed to fetch monthly performance")
        const chartData = await chartRes.json()
        console.log("Monthly data:", chartData)
        setMonthlyPerformance(chartData)
      } 
      catch (error) {
        console.error("Error loading performance:", error)
        setPerformance(null)
        setMonthlyPerformance([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return <div className="text-center text-muted-foreground mt-10">Loading performance data...</div>
  }

  if (!performance) {
    return <div className="text-center text-muted-foreground mt-10">No performance data found.</div>
  }

  // 🧩 Goals (sample logic)
  const goals = [
    {
      title: "Monthly Sales Target",
      current: performance.totalSales ?? 0,
      target: 500000,
      percentage: ((performance.totalSales ?? 0) / 500000) * 100,
      icon: IndianRupee,
      color: "text-primary",
    },
    {
      title: performance.role === "MANAGER" ? "Managed Properties" : "Listings",
      current:
        performance.role === "MANAGER"
          ? performance.managedProperties ?? 0
          : performance.listings ?? 0,
      target: 10,
      percentage:
        ((performance.role === "MANAGER"
          ? performance.managedProperties ?? 0
          : performance.listings ?? 0) / 10) * 100,
      icon: Building,
      color: "text-success",
    },
    {
      title: "Customer Rating",
      current: performance.rating ?? 4.2,
      target: 5,
      percentage: ((performance.rating ?? 4.2) / 5) * 100,
      icon: Star,
      color: "text-warning",
    },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Performance</h1>
          <p className="text-muted-foreground">
            Track your personal metrics and achievements
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary px-4 py-2 text-lg hover:bg-gray-200">
        {performance.rating || 0.0} / 5.0
        </Badge>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sales */}
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{(performance.totalSales ?? 0).toLocaleString()}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Managed/Listed Properties */}
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {performance.role === "MANAGER" ? "Managed Properties" : "Listings"}
                </p>
                <p className="text-2xl font-bold text-success">
                  {performance.role === "MANAGER"
                    ? performance.managedProperties
                    : performance.listings}
                </p>
              </div>
              <Building className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-warning">
                  {performance.pendingTasks ?? 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {goals.map((goal, i) => {
              const Icon = goal.icon
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${goal.color}`} />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {goal.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={goal.percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{goal.current}</span>
                    <span>{goal.target}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  name="Commission"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              Monthly Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="deals"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                  name="Deals Closed"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Performance
