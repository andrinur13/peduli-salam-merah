import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  id: string;
  title: string;
  image: string;
  description: string;
  target: number;
  collected: number;
  daysLeft: number;
}

const CampaignCard = ({ id, title, image, description, target, collected, daysLeft }: CampaignCardProps) => {
  const progress = (collected / target) * 100;
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link to={`/campaign/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border-border/80">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{daysLeft} hari lagi</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <Progress value={progress} className="h-2 bg-muted" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-primary font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>{progress.toFixed(0)}%</span>
              </div>
              <span className="text-muted-foreground">dari {formatRupiah(target)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-border/80">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Terkumpul</div>
                <div className="text-lg font-bold text-primary">{formatRupiah(collected)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="text-lg font-bold text-foreground">{formatRupiah(target)}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CampaignCard;
