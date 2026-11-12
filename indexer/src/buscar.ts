import * as readline from 'node:readline/promises';

import {
  COLECCION,
  ORIGEN,
  conectar,
  extraerPalabrasClave,
  generarEmbeddingPalabrasClave,
} from './plugcore.ts';

async function main(): Promise<void> {
  let terminal: readline.Interface | undefined;

  try {
    const cliente = await conectar();

    const coleccion = await cliente.getCollection({
      name: COLECCION,
    });

    const modeloEmbedding =
      process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    if (
      coleccion.metadata?.origen !== ORIGEN ||
      coleccion.metadata?.modelo !== modeloEmbedding ||
      coleccion.metadata?.contenido_vector !== 'palabras_clave'
    ) {
      throw new Error(
        'La colección no coincide con la configuración del índice.'
      );
    }

    const cantidad = await coleccion.count();

    if (!cantidad) {
      throw new Error('La colección está vacía.');
    }

    terminal = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      'Buscador listo. Escribe una consulta o «salir» para terminar.'
    );

    while (true) {
      const pregunta = (await terminal.question('\n> ')).trim();

      if (pregunta.toLocaleLowerCase('es') === 'salir') break;
      if (!pregunta) continue;

      try {
        // 1. Obtener las palabras clave de la consulta.
        const palabrasClave = await extraerPalabrasClave(pregunta);

        if (!palabrasClave.length) {
          console.log('Prueba con una consulta más concreta.');
          continue;
        }

        console.log(
          `\nPalabras clave de tu consulta: ${palabrasClave.join(', ')}`
        );

        // 2. Generar el embedding de esas palabras clave.
        const vector = await generarEmbeddingPalabrasClave(
          palabrasClave
        );

        // 3. Recuperar los párrafos con vectores más cercanos.
        const resultados = await coleccion.query({
          queryEmbeddings: [vector],
          nResults: Math.min(5, cantidad),
          where: { origen: ORIGEN },
          include: ['documents', 'metadatas'],
        });

        if (!resultados.ids[0]?.length) {
          console.log('No se encontraron resultados.');
          continue;
        }

        // 4. Mostrar la vista previa y las referencias.
        for (let i = 0; i < resultados.ids[0].length; i++) {
          const metadata = resultados.metadatas?.[0]?.[i];

          if (!metadata) continue;

          const textoMetadata =
            typeof metadata.texto === 'string'
              ? metadata.texto.trim()
              : '';

          const textoDocumento =
            resultados.documents?.[0]?.[i]?.trim() || '';

          const texto = textoMetadata || textoDocumento;

          // Unificar espacios y saltos de línea para la vista previa.
          const textoLimpio = texto.replace(/\s+/g, ' ').trim();

          // Cambia este valor para mostrar más o menos caracteres.
          const limite = 450;

          const preview =
            textoLimpio.length > limite
              ? textoLimpio
                .slice(0, limite)
                .replace(/\s+\S*$/, '') + '…'
              : textoLimpio;

          console.log(`\n${i + 1}. ${metadata.titulo}`);

          if (metadata.seccion) {
            console.log(`Apartado: ${metadata.seccion}`);
          }

          console.log('\nVista previa:');

          console.log(
            preview || 'No hay texto guardado para este resultado.'
          );

          console.log(`\nPágina del PDF completo: ${metadata.pagina}`);

          if (metadata.url) {
            console.log(`Enlace: ${metadata.url}`);
          }

          console.log('────────────────────────────────────');
        }
      } catch (error) {
        console.error(
          `Error al buscar: ${error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );

    process.exitCode = 1;
  } finally {
    terminal?.close();
  }
}

void main();