import { SidebarNew } from "@/components/layout/sidebar-new";
import { useState } from "react";

const tabs = [
	{ label: "Gestión de Recaudos", key: "recaudos" },
	{ label: "Gestión de Pagos", key: "pagos" },
	{ label: "Gestión de Compras", key: "compras" },
	{ label: "Conciliaciones", key: "conciliaciones" },
];

export default function TesoreriaPage() {
	const [activeTab, setActiveTab] = useState("recaudos");
	return (
		<div className="flex">
			<SidebarNew />
			<main className="flex-1 p-8">
				<h1 className="text-2xl font-bold mb-4">Tesorería</h1>
				<div className="mb-6 flex gap-4 border-b pb-2">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							className={`px-4 py-2 rounded-t font-semibold ${
								activeTab === tab.key
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
							onClick={() => setActiveTab(tab.key)}
						>
							{tab.label}
						</button>
					))}
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
