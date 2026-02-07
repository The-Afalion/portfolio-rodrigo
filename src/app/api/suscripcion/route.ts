import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import CorreoBienvenida from "@/emails/CorreoBienvenida";

const clienteResend = new Resend(process.env.RESEND_API_KEY);
const ID_AUDIENCIA = process.env.RESEND_AUDIENCE_ID;

// Expresión regular simple para validar un correo electrónico.
const expresionRegularEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(peticion: NextRequest) {
  try {
    const { email: correo } = await peticion.json();

    if (!correo || !expresionRegularEmail.test(correo)) {
      return NextResponse.json({ error: "El correo electrónico no es válido." }, { status: 400 });
    }

    if (!ID_AUDIENCIA) {
      console.error("El ID de la audiencia de Resend no está configurado en las variables de entorno.");
      return NextResponse.json({ error: "La configuración del servidor es incorrecta." }, { status: 500 });
    }

    // 1. Intentar añadir el contacto a la audiencia de Resend.
    try {
      await clienteResend.contacts.create({
        email: correo,
        audienceId: ID_AUDIencia,
        unsubscribed: false,
      });
    } catch (error: any) {
      // Si el contacto ya existe, Resend devuelve un error. Lo ignoramos y continuamos
      // para que el usuario reciba igualmente el correo de bienvenida si se suscribe de nuevo.
      if (error.name !== 'contact_already_exists') {
        console.error("Error al añadir el contacto a la audiencia de Resend:", error);
      }
    }

    // 2. Enviar el correo de bienvenida.
    await clienteResend.emails.send({
      from: "Rodrigo de rodocodes.dev <newsletter@rodocodes.dev>",
      to: [correo],
      subject: "¡Bienvenido a la comunidad de rodocodes.dev!",
      react: CorreoBienvenida({ nombre: correo.split('@')[0] }),
    });

    return NextResponse.json({ message: "¡Suscripción exitosa!" }, { status: 200 });

  } catch (error) {
    console.error("Error en el punto de acceso de suscripción:", error);
    return NextResponse.json({ error: "Ocurrió un error en el servidor." }, { status: 500 });
  }
}
