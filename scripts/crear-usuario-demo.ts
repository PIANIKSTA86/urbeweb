import { storage } from "../server/storage";

async function crearUsuarioDemo() {
  const usuario = await storage.crearUsuario({
    email: "demo@urbe.com",
    password: "demo1234",
    nombre: "Demo",
    apellido: "Usuario",
    telefono: "3001234567",
    rol_id: 1
  });
  console.log("Usuario creado:", usuario);
}

crearUsuarioDemo().catch(console.error);
