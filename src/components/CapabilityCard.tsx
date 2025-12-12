import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const CapabilityCard = ({ icon: Icon, title, description, delay = 0 }: CapabilityCardProps) => {
  return (
    <div
      className="glass rounded-2xl p-6 hover:glow transition-all duration-500 group cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default CapabilityCard;
