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

interface WelcomeEmailProps {
  name?: string;
}

export default function WelcomeEmail({ name = "nuevo suscriptor" }: WelcomeEmailProps) {
  const previewText = `¡Gracias por unirte a la comunidad de rodocodes.dev!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 text-black">
          <Container className="p-8 rounded-lg shadow-lg bg-white">
            <Heading className="text-2xl font-bold">
              ¡Bienvenido a bordo!
            </Heading>
            <Text className="text-lg">
              Hola, {name},
            </Text>
            <Text className="text-lg">
              Gracias por suscribirte a la newsletter de rodocodes.dev. Estoy encantado de tenerte en la comunidad.
            </Text>
            <Text className="text-lg">
              Aquí recibirás actualizaciones sobre nuevos proyectos, artículos y experimentos en el mundo del desarrollo y la IA.
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
