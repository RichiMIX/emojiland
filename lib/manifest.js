(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Emojiland",
    tagline: "Copia y pega emojis gratis, sin registro",
    domain: "emojiland",

    combos: [
      { icon: "\u{1F382}", title: "Cumpleaños", emojis: "\u{1F389}\u{1F973}\u{1F382}\u{1F381}\u{1F388}", text: "Para felicitar en redes o tarjetas" },
      { icon: "\u{1F48D}", title: "Boda", emojis: "\u{1F48D}\u{1F470}\u{1F935}\u{2764}️\u{1F339}", text: "Invitaciones y felicitaciones" },
      { icon: "\u{1F38A}", title: "Fiesta", emojis: "\u{1F38A}\u{1F389}\u{1F37E}\u{1F942}\u{1F483}", text: "Para anunciar o celebrar" },
      { icon: "\u{1F495}", title: "Amor", emojis: "❤️\u{1F60D}\u{1F495}\u{1F618}\u{1F498}", text: "Mensajes románticos" },
      { icon: "☀️", title: "Buenos días", emojis: "☀️\u{1F60A}☕\u{1F305}✨", text: "Saludo matutino" },
      { icon: "\u{1F319}", title: "Buenas noches", emojis: "\u{1F319}✨\u{1F634}\u{1F4A4}⭐", text: "Despedida nocturna" },
      { icon: "\u{1F389}", title: "Felicidades", emojis: "\u{1F389}\u{1F44F}\u{1F64C}⭐\u{1F3C6}", text: "Para celebrar un logro" },
      { icon: "✈️", title: "Viaje", emojis: "✈️\u{1F9F3}\u{1F30D}\u{1F4F8}\u{1F5FA}️", text: "Publicaciones de viajes" },
      { icon: "\u{1F32E}", title: "Comida mexicana", emojis: "\u{1F32E}\u{1F336}️\u{1F1F2}\u{1F1FD}\u{1F525}\u{1F951}", text: "Para tu carta o publicación" },
      { icon: "\u{1F384}", title: "Navidad", emojis: "\u{1F384}\u{1F385}\u{1F381}❄️⛄", text: "Felicitaciones navideñas" },
      { icon: "\u{1F383}", title: "Halloween", emojis: "\u{1F383}\u{1F47B}\u{1F987}\u{1F578}️\u{1F36C}", text: "Publicaciones de Halloween" },
      { icon: "⚽", title: "Deportes", emojis: "⚽\u{1F3C6}\u{1F947}\u{1F4AA}\u{1F525}", text: "Para resultados o motivación" },
      { icon: "\u{1F4BC}", title: "Trabajo", emojis: "\u{1F4BC}\u{1F4CA}✅\u{1F4BB}\u{1F4C8}", text: "Publicaciones profesionales" },
      { icon: "\u{1F43E}", title: "Mascotas", emojis: "\u{1F436}\u{1F431}\u{1F43E}❤️\u{1F9B4}", text: "Publicaciones sobre mascotas" },
      { icon: "\u{1F498}", title: "San Valentín", emojis: "\u{1F498}\u{1F490}\u{1F339}\u{1F618}\u{1F49D}", text: "14 de febrero" },
      { icon: "\u{1F393}", title: "Graduación", emojis: "\u{1F393}\u{1F4DA}\u{1F389}\u{1F44F}⭐", text: "Felicitaciones de graduación" },
      { icon: "\u{1F476}", title: "Bebé", emojis: "\u{1F476}\u{1F37C}\u{1F380}\u{1F499}\u{1F9F8}", text: "Baby shower o nacimiento" },
      { icon: "\u{1F3D6}️", title: "Playa", emojis: "\u{1F3D6}️☀️\u{1F379}\u{1F30A}\u{1F576}️", text: "Vacaciones de verano" }
    ],

    usos: [
      { icon: "\u{1F37D}️", title: "Cartas de restaurantes", text: "Añade emojis junto a cada plato (\u{1F335} vegano, \u{1F336}️ picante, ⭐ recomendado) para que la carta se lea de un vistazo, en papel o en la carta digital con QR." },
      { icon: "⭐", title: "Reseñas y testimonios", text: "Ilustra valoraciones de clientes con caritas y estrellas que refuercen el mensaje sin ocupar espacio extra en redes sociales o en tu web." },
      { icon: "\u{1F511}", title: "Llaveros para eventos", text: "Genera combinaciones de emojis únicas para identificar mesas, entradas o grupos en bodas, congresos y fiestas — fáciles de imprimir en llaveros o tarjetas." },
      { icon: "\u{1F4F6}", title: "Carteles de wifi para alojamientos", text: "Copia el emoji de wifi \u{1F4F6} y combínalo con la contraseña en el cartel de tu hotel, apartamento turístico o cafetería." },
      { icon: "\u{1F4AC}", title: "Redes sociales y chats", text: "Copia y pega emojis directamente en Instagram, WhatsApp, TikTok o Twitter/X sin depender del teclado limitado de tu móvil o del selector de tu ordenador." },
      { icon: "\u{1F4CA}", title: "Presentaciones y documentos", text: "Añade emojis a diapositivas, informes o documentos de trabajo para destacar ideas clave sin insertar imágenes ni iconos externos." },
      { icon: "\u{1F3AB}", title: "Invitaciones y tarjetas", text: "Diseña invitaciones de cumpleaños, bodas o eventos con emojis temáticos que le dan un toque personal sin necesidad de diseño gráfico." },
      { icon: "\u{1F4E7}", title: "Email marketing", text: "Los emojis en el asunto del correo aumentan la tasa de apertura; cópialos aquí y pégalos directamente en tu plataforma de email." }
    ],

    faqs: [
      { q: "¿Es gratis copiar emojis en esta web?", a: "Sí, completamente gratis y sin límite de uso. No hace falta crear una cuenta ni instalar ninguna aplicación: entras, buscas el emoji que necesitas y lo copias." },
      { q: "¿Cómo copio un emoji para pegarlo después?", a: "Haz clic o toca el emoji que quieras. Se copia automáticamente a tu portapapeles y verás un aviso de confirmación. Después solo tienes que pegarlo (Ctrl+V o mantener pulsado y elegir «Pegar») donde quieras usarlo." },
      { q: "¿Los emojis se ven igual en todos los dispositivos?", a: "El diseño del emoji (colores y forma exactos) depende del sistema operativo o la app donde lo pegues — iOS, Android, WhatsApp o Windows pueden mostrar una versión ligeramente distinta del mismo emoji, pero el significado y el código son siempre los mismos." },
      { q: "¿Puedo usar los emojis en mi negocio o proyecto comercial?", a: "Sí. Los emojis son caracteres Unicode estándar, de uso libre en cualquier contexto personal o comercial: cartas de restaurantes, redes sociales, marketing, papelería, etc." },
      { q: "¿Por qué no se copia el emoji al hacer clic?", a: "Algunos navegadores antiguos o configuraciones de privacidad muy estrictas bloquean el acceso automático al portapapeles. Si ves que no se copia, prueba a recargar la página o a mantener pulsado el emoji durante un instante." },
      { q: "¿Necesito instalar un teclado de emojis?", a: "No. Esta web funciona como un selector de emojis online que sustituye al teclado de emojis del móvil u ordenador — útil sobre todo en ordenadores de escritorio, donde buscar un emoji concreto suele ser incómodo." },
      { q: "¿Puedo buscar un emoji por su nombre?", a: "Sí, usa el buscador de la parte superior de la herramienta y escribe una palabra clave (por ejemplo «corazón» o «pizza») para filtrar al instante entre todas las categorías." },
      { q: "¿Qué es la lista de favoritos y para qué sirve?", a: "Al pulsar la estrella de un emoji lo guardas en tus favoritos (solo en tu navegador). Desde ahí puedes descargar tu selección como archivo de texto para guardarla o compartirla." }
    ],

    steps: [
      { icon: "\u{1F50D}", title: "Busca o navega", text: "Escribe una palabra clave en el buscador o navega por las categorías con las pestañas, igual que en el selector de emojis de tu móvil." },
      { icon: "\u{1F446}", title: "Toca el emoji", text: "Haz clic o toca el emoji que quieras usar. Se copia al instante a tu portapapeles — verás una confirmación en pantalla." },
      { icon: "\u{1F4CB}", title: "Pégalo donde quieras", text: "Ve a tu chat, documento, red social o carta digital y pega el emoji con Ctrl+V (o mantén pulsado y elige «Pegar» en el móvil)." }
    ]
  };
})();
