# Rodrigo Alonso - Portafolio de Ingeniero de Software

Este repositorio contiene el código fuente de mi portafolio personal, una aplicación web construida para demostrar competencias en prácticas modernas de desarrollo web, arquitectura de software y diseño de interfaces de usuario (UI/UX) interactivas.

## Descripción de la Arquitectura

La aplicación es un proyecto integral desarrollado con Next.js 14, aprovechando su sistema de rutas (App Router) para una arquitectura robusta y escalable. Las decisiones arquitectónicas clave incluyen:

*   **Renderizado en el Servidor (SSR) y Generación de Sitios Estáticos (SSG):** Las páginas principales se generan de forma estática para optimizar el rendimiento y el posicionamiento en buscadores (SEO), mientras que las funcionalidades dinámicas utilizan el renderizado en el servidor.
*   **Interfaz de Usuario Basada en Componentes:** La interfaz de usuario está construida con React, siguiendo un enfoque modular basado en componentes para asegurar la reutilización y la facilidad de mantenimiento.
*   **Funciones sin Servidor (Serverless):** La lógica del lado del servidor, como el servicio de suscripción al boletín, se gestiona a través de las rutas de API de Next.js, que se ejecutan en un entorno sin servidor.

## Aspectos Técnicos Destacados

*   **Gráficos 3D Interactivos:** Se utiliza `react-three-fiber` y `drei` para crear escenas 3D de alto rendimiento, aceleradas por GPU. Este enfoque declarativo para Three.js se integra de manera nativa con el modelo de componentes de React.
*   **Lógica Algorítmica en el Cliente:** Incluye un motor de ajedrez implementado en TypeScript con `chess.js`, demostrando la resolución algorítmica de problemas y la gestión de estado en el lado del cliente.
*   **Servicio de Correo Transaccional:** Se integra con la API de Resend para gestionar las suscripciones al boletín, incluyendo validación en el servidor y el envío de correos de bienvenida basados en plantillas de React Email.
*   **Animaciones Fluidas y Microinteracciones:** Se emplea Framer Motion para implementar animaciones fluidas y microinteracciones que mejoran la experiencia del usuario sin comprometer el rendimiento.

## Tecnologías Utilizadas

*   **Entorno de trabajo:** Next.js 14
*   **Lenguaje:** TypeScript
*   **Biblioteca de UI:** React
*   **Estilos:** Tailwind CSS
*   **Gráficos 3D:** Three.js, React Three Fiber, Drei
*   **Animación:** Framer Motion
*   **Servicios de servidor:** API de Resend
*   **Análisis de código:** ESLint

## Estructura del Proyecto

La base del código está organizada para mantener una clara separación de responsabilidades:

```
src/
├── app/              # Rutas de la aplicación, páginas y puntos de acceso de la API
├── components/       # Componentes reutilizables de React (UI, escenas, formularios)
├── emails/           # Plantillas de correo con React Email
├── utils/            # Funciones de utilidad y hooks personalizados
└── types/            # Definiciones de tipos e interfaces de TypeScript
```

## Puesta en Marcha

Para ejecutar el proyecto en un entorno de desarrollo local, por favor sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/The-Afalion/portfolio-rodrigo.git
    cd portfolio-rodrigo
    ```

2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar las Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y proporciona las claves de API necesarias.
    ```env
    # API de Resend para la funcionalidad del boletín
    RESEND_API_KEY=TU_CLAVE_DE_API_DE_RESEND
    RESEND_AUDIENCE_ID=TU_ID_DE_AUDIENCIA_DE_RESEND
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## Licencia

Este proyecto está distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
Rodrigo