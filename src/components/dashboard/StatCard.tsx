import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'accent';
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'accent':
        return 'text-accent';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="dashboard-stat-card fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="dashboard-stat-label">{title}</p>
            <p className={`dashboard-stat-value ${getColorClasses()}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${getColorClasses()}`}>
            <Icon className={`h-8 w-8 ${getColorClasses()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;