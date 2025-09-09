
import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";
import { DollarSign, CreditCard, ShoppingCart, ListChecks } from "lucide-react";

const tabs = [
	{ label: "Recaudos", key: "recaudos", icon: DollarSign },
	{ label: "Pagos", key: "pagos", icon: CreditCard },
	{ label: "Compras", key: "compras", icon: ShoppingCart },
	{ label: "Conciliaciones", key: "conciliaciones", icon: ListChecks },
];

export default function TesoreriaPage() {
	const [activeTab, setActiveTab] = useState("recaudos");
	return (
		<div className="flex">
			<SidebarNew />
			<main className="flex-1 p-8">
				<h1 className="text-2xl font-bold mb-4">Tesorería</h1>
				<div className="mb-6 flex gap-4 border-b pb-2 justify-start">
				  {tabs.map((tab) => {
				    const Icon = tab.icon;
				    return (
				      <button
				        key={tab.key}
				        className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
				        onClick={() => setActiveTab(tab.key)}
				      >
				        <Icon className="w-4 h-4" /> {tab.label}
				      </button>
				    );
				  })}
				</div>
				{activeTab === "recaudos" && (
					<section>
						<h2 className="text-xl font-bold mb-2">Gestión de Recaudos</h2>
						<p>Aquí irá la gestión de recaudos.</p>
					</section>
				)}
				{activeTab === "pagos" && (
					<section>
						<h2 className="text-xl font-bold mb-2">Gestión de Pagos</h2>
						<p>Aquí irá la gestión de pagos.</p>
					</section>
				)}
				{activeTab === "compras" && (
					<section>
						<h2 className="text-xl font-bold mb-2">Gestión de Compras</h2>
						<p>Aquí irá la gestión de compras.</p>
					</section>
				)}
				{activeTab === "conciliaciones" && (
					<section>
						<h2 className="text-xl font-bold mb-2">Conciliaciones</h2>
						<button className="bg-primary text-primary-foreground px-4 py-2 rounded mb-4">
							Nueva Conciliación
						</button>
						<div className="bg-muted rounded p-4 mb-4">
							Conciliación bancaria y de cuentas (demo)
						</div>
						<p className="text-gray-500">
							Realiza y consulta conciliaciones bancarias y contables.
						</p>
					</section>
				)}
			</main>
		</div>
	);
}
