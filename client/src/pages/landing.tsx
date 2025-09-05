import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Calculator, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3,
  Shield,
  Check,
  Phone,
  Mail,
  MapPin,
  X
} from "lucide-react";

export default function Landing() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.token, data.usuario);
      setShowLoginModal(false);
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Building className="text-primary text-2xl mr-3" />
                <span className="text-2xl font-bold text-primary">URBE</span>
                <span className="text-sm text-muted-foreground ml-2">Administración Integral</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-features"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('plans')}
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-plans"
              >
                Planes
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-contact"
              >
                Contacto
              </button>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-login"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-6">
                Administración de <span className="text-primary">Propiedad Horizontal</span> 
                con Contabilidad Integrada
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plataforma completa para gestionar propiedades horizontales con módulo contable, 
                facturación, pagos en línea y reservas de zonas comunes.
              </p>
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-trial"
                >
                  Prueba Gratis 30 Días
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-demo"
                >
                  Solicitar Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Edificio residencial moderno" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <BarChart3 className="text-secondary text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiencia</p>
                    <p className="text-lg font-semibold text-foreground">+85% Mejora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Características Principales</h2>
            <p className="text-xl text-muted-foreground">Todo lo que necesitas para administrar tu propiedad horizontal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Calculator,
                title: "Contabilidad Completa",
                description: "Plan Único de Cuentas configurable, reportes financieros, conciliaciones bancarias y cumplimiento NIIF.",
                features: ["Balance General y Estado de Resultados", "Libros Auxiliares y Mayor", "Retenciones e Impuestos"],
                color: "blue"
              },
              {
                icon: Users,
                title: "Gestión de Terceros",
                description: "Administra propietarios, inquilinos y proveedores con información detallada y historial completo.",
                features: ["Base de datos de propietarios", "Unidades habitacionales", "Coeficientes y cuotas"],
                color: "green"
              },
              {
                icon: FileText,
                title: "Facturación Digital",
                description: "Genera facturas automáticas, envío por email e integración con pasarelas de pago.",
                features: ["Facturación automática", "Pagos en línea", "Seguimiento de cartera"],
                color: "red"
              },
              {
                icon: Calendar,
                title: "Reservas de Espacios",
                description: "Sistema de reservas para zonas comunes con calendario integrado y notificaciones.",
                features: ["Calendario de disponibilidad", "Confirmación automática", "Control de acceso"],
                color: "yellow"
              },
              {
                icon: BarChart3,
                title: "Reportes Avanzados",
                description: "Informes financieros detallados con gráficos interactivos y exportación a Excel/PDF.",
                features: ["Dashboards interactivos", "Filtros personalizables", "Exportación múltiple"],
                color: "purple"
              },
              {
                icon: Shield,
                title: "Seguridad Avanzada",
                description: "Control de acceso por roles, auditoría completa y respaldo automático de datos.",
                features: ["Autenticación JWT", "Roles y permisos", "Trazabilidad completa"],
                color: "orange"
              }
            ].map((feature, index) => (
              <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`bg-${feature.color}-100 p-3 rounded-full w-fit mb-4`}>
                    <feature.icon className={`text-${feature.color}-600 text-xl`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className="w-3 h-3 mr-2 text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Planes y Precios</h2>
            <p className="text-xl text-muted-foreground">Selecciona el plan que mejor se adapte a tu propiedad horizontal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Básico",
                price: "$290.000",
                popular: false,
                features: ["Hasta 50 unidades", "Contabilidad básica", "Facturación digital", "Soporte por email"]
              },
              {
                name: "Profesional",
                price: "$490.000",
                popular: true,
                features: ["Hasta 150 unidades", "Contabilidad avanzada", "Reservas de espacios", "Reportes personalizados", "Soporte telefónico"]
              },
              {
                name: "Empresarial",
                price: "$890.000",
                popular: false,
                features: ["Unidades ilimitadas", "Todas las funciones", "API personalizada", "Soporte prioritario 24/7", "Capacitación incluida"]
              }
            ].map((plan, index) => (
              <Card key={index} className={`${plan.popular ? 'border-2 border-primary relative' : 'border border-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-foreground mb-1">{plan.price}</div>
                    <div className="text-muted-foreground">COP / mes</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className="text-secondary mr-3" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid={`button-select-${plan.name.toLowerCase()}`}
                  >
                    Seleccionar Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Contáctanos</h2>
              <p className="text-xl text-muted-foreground mb-8">
                ¿Tienes preguntas? Nuestro equipo está listo para ayudarte a implementar URBE en tu propiedad horizontal.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Teléfono", value: "+57 (1) 234 5678" },
                  { icon: Mail, label: "Email", value: "ventas@urbe.com.co" },
                  { icon: MapPin, label: "Dirección", value: "Bogotá, Colombia" }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <contact.icon className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{contact.label}</div>
                      <div className="text-muted-foreground">{contact.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-muted/30">
              <CardContent className="p-8">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" placeholder="Tu nombre" data-testid="input-nombre" />
                    </div>
                    <div>
                      <Label htmlFor="empresa">Empresa</Label>
                      <Input id="empresa" placeholder="Nombre de la empresa" data-testid="input-empresa" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="email-contact">Email</Label>
                    <Input id="email-contact" type="email" placeholder="tu.email@ejemplo.com" data-testid="input-email-contact" />
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <Textarea id="mensaje" placeholder="Cuéntanos sobre tu propiedad horizontal..." data-testid="textarea-mensaje" />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-send-contact"
                  >
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Building className="mx-auto text-primary text-3xl mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">Bienvenido a URBE</div>
              <p className="text-muted-foreground font-normal">Ingresa a tu cuenta para continuar</p>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@ejemplo.com"
                required
                data-testid="input-login-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="input-login-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loginMutation.isPending}
              data-testid="button-submit-login"
            >
              {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                className="text-primary hover:text-primary/80 text-sm"
                data-testid="link-forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
          
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            data-testid="button-close-modal"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
