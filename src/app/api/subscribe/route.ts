import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Expresión regular para validar un correo electrónico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "El correo electrónico no es válido." }, { status: 400 });
    }

    if (!AUDIENCE_ID) {
      console.error("El ID de la audiencia de Resend no está configurado.");
      return NextResponse.json({ error: "La configuración del servidor es incorrecta." }, { status: 500 });
    }

    // 1. Intentar añadir el contacto a la audiencia
    try {
      await resend.contacts.create({
        email: email,
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
    } catch (error: any) {
      // Si el error es "contact already exists", lo ignoramos y continuamos.
      // Para cualquier otro error, lo notificamos.
      if (error.name !== 'contact_already_exists') {
        console.error("Error al añadir contacto a Resend:", error);
        // Podríamos decidir si continuar o no, pero por ahora, seguiremos para enviar el correo.
      }
    }

    // 2. Enviar el correo de bienvenida
    await resend.emails.send({
      from: "Rodrigo de rodocodes.dev <newsletter@rodocodes.dev>", // Asegúrate de que este remitente esté verificado
      to: [email],
      subject: "¡Bienvenido a la comunidad de rodocodes.dev!",
      react: WelcomeEmail({ name: email.split('@')[0] }),
    });

    return NextResponse.json({ message: "¡Suscripción exitosa!" }, { status: 200 });

  } catch (error) {
    console.error("Error en la API de suscripción:", error);
    return NextResponse.json({ error: "Algo salió mal en el servidor." }, { status: 500 });
  }
}
