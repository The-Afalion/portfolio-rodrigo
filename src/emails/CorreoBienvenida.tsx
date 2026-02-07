import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Tailwind,
} from "@react-email/components";

interface CorreoBienvenidaProps {
  nombre?: string;
}

export default function CorreoBienvenida({ nombre = "nuevo suscriptor" }: CorreoBienvenidaProps) {
  const textoPrevisualizacion = `¡Gracias por unirte a la comunidad de rodocodes.dev!`;

  return (
    <Html>
      <Head />
      <Preview>{textoPrevisualizacion}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 text-black">
          <Container className="p-8 rounded-lg shadow-lg bg-white">
            <Heading className="text-2xl font-bold">
              ¡Bienvenido a bordo!
            </Heading>
            <Text className="text-lg">
              Hola, {nombre},
            </Text>
            <Text className="text-lg">
              Gracias por suscribirte al boletín de rodocodes.dev. Estoy encantado de tenerte en la comunidad.
            </Text>
            <Text className="text-lg">
              Aquí recibirás actualizaciones sobre nuevos proyectos, artículos y experimentos en el mundo del desarrollo y la inteligencia artificial.
            </Text>
            <Text className="text-lg font-mono mt-8">
              - Rodrigo
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
