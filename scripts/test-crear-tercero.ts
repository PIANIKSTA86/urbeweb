import axios from "axios";

async function testCrearTercero() {
  const tercero = {
    tipoPersona: "natural",
    tipoTercero: "propietario",
    tipoContribuyente: "no_declarante",
    tipoIdentificacion: "cc",
    numeroIdentificacion: "1234567890",
    primerNombre: "Juan",
    segundoNombre: "Carlos",
    primerApellido: "Pérez",
    segundoApellido: "Gómez",
    razonSocial: null,
    direccion: "Calle 123 #45-67",
    pais: "Colombia",
    departamento: "Cundinamarca",
    municipio: "Bogotá",
    telefono: "3001234567",
    movil: "3109876543",
    email: "juan.perez@example.com"
  };

  try {
    const res = await axios.post("http://localhost:5000/api/terceros", tercero);
    console.log("Tercero creado:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error de API:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

testCrearTercero();
