import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";
import { LogOut, Truck, User } from "lucide-react";
import Link from "next/link";

const actionCards = [
  {
    href: "/entrada",
    title: "Entrada",
    description: "Registrar una nueva visita general.",
    icon: <User className="h-12 w-12" />,
  },
  {
    href: "/entrada-transportistas",
    title: "Entrada Transportistas",
    description: "Registrar una entrada de transportista.",
    icon: <Truck className="h-12 w-12" />,
  },
  {
    href: "/salida",
    title: "Salida",
    description: "Registrar la salida de un visitante.",
    icon: <LogOut className="h-12 w-12" />,
  },
];

export default function Home() {
  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight">
          Bienvenido a VisitWise
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Seleccione una opción para gestionar las visitas de la empresa de forma rápida y segura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {actionCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card className="h-full group hover:border-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="mb-4 text-primary group-hover:text-accent transition-colors duration-300">
                  {card.icon}
                </div>
                <CardTitle className="font-headline text-3xl mb-2">{card.title}</CardTitle>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
