import { Sparkles } from "lucide-react";
const HeroSection = () => {
  return <div className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-6">
        <Sparkles className="w-4 h-4" />
        <span>Sun'iy Intellekt Assistenti</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        <span className="text-foreground">Sizning</span>{" "}
        <span className="gradient-text">Aqlli Yordamchingiz
JBN AI man
      </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Murakkab vazifalarni hal qilish, ijodiy g'oyalar yaratish va savollaringizga 
        aniq javob olish uchun mo'ljallangan zamonaviy AI texnologiyasi.
      </p>
    </div>;
};
export default HeroSection;