import { createHash } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CARPETA_RESULTADO,
  CARPETA_INDICES,
  COLECCION,
  ORIGEN,
  prepararDocumentos,
  extraerPalabrasClave,
  generarEmbeddingPalabrasClave,
  conectar,
} from './plugcore.ts';

async function main(): Promise<void> {
  try {
    console.log(`Leyendo los TXT de: ${CARPETA_RESULTADO}`);

    const documentos = await prepararDocumentos();

    await mkdir(CARPETA_INDICES, { recursive: true });

    const archivoIndice = join(
      CARPETA_INDICES,
      'indice-plugcore.json'
    );

    await writeFile(
      archivoIndice,
      JSON.stringify(documentos, null, 2)
    );

    console.log(`${documentos.length} párrafos preparados.`);
    console.log(`Vista previa guardada en: ${archivoIndice}`);

    // Solo prepara el JSON, sin llamar a OpenAI ni a ChromaDB.
    if (process.argv.includes('--preparar')) {
      return;
    }

    const modeloClaves = process.env.OPENAI_KEYWORDS_MODEL;

    const modeloEmbedding =
      process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    if (!process.env.OPENAI_API_KEY || !modeloClaves) {
      throw new Error(
        'Configura OPENAI_API_KEY y OPENAI_KEYWORDS_MODEL en tu .env'
      );
    }

    const cliente = await conectar();

    const coleccion = await cliente.getOrCreateCollection({
      name: COLECCION,
      embeddingFunction: null,
      metadata: {
        origen: ORIGEN,
        modelo: modeloEmbedding,
        contenido_vector: 'palabras_clave',
      },
      configuration: {
        hnsw: { space: 'cosine' },
      },
    });

    if (
      coleccion.metadata?.origen !== ORIGEN ||
      coleccion.metadata?.modelo !== modeloEmbedding ||
      coleccion.metadata?.contenido_vector !== 'palabras_clave'
    ) {
      throw new Error(
        'La colección utiliza otra configuración. Elige una colección nueva.'
      );
    }

    const anteriores = await coleccion.get({
      where: { origen: ORIGEN },
      include: ['metadatas'],
    });

    const metadatosAnteriores = new Map(
      anteriores.ids.map((id, i) => [
        id,
        anteriores.metadatas?.[i],
      ])
    );

    for (const [posicion, documento] of documentos.entries()) {
      const textoOriginal = documento.metadata.texto;

      const huella = createHash('sha256')
        .update(JSON.stringify({
          metadata: documento.metadata,
          modeloClaves,
          modeloEmbedding,
        }))
        .digest('hex');

      const anterior = metadatosAnteriores.get(documento.id);

      if (anterior?.huella === huella) {
        console.log(
          `[${posicion + 1}/${documentos.length}] Sin cambios: reutilizado.`
        );

        continue;
      }

      // Obtener las palabras clave del párrafo.
      const palabrasClave = await extraerPalabrasClave(textoOriginal);

      if (!palabrasClave.length) {
        throw new Error(
          `No se obtuvieron palabras clave para ${documento.id}`
        );
      }

      // Vectorizar únicamente las palabras clave.
      const vector = await generarEmbeddingPalabrasClave(palabrasClave);

      // Guardar el texto original, sus referencias y el vector.
      await coleccion.upsert({
        ids: [documento.id],
        documents: [textoOriginal],
        embeddings: [vector],
        metadatas: [{
          ...documento.metadata,
          texto: textoOriginal,
          palabras_clave: JSON.stringify(palabrasClave),
          modelo_claves: modeloClaves,
          huella,
        }],
      });

      console.log(
        `[${posicion + 1}/${documentos.length}] Guardado: ` +
        palabrasClave.join(', ')
      );
    }

    // Retirar registros de párrafos que ya no están en los TXT.
    const actuales = new Set(documentos.map(d => d.id));

    const obsoletos = anteriores.ids.filter(
      id => !actuales.has(id)
    );

    for (let inicio = 0; inicio < obsoletos.length; inicio += 100) {
      await coleccion.delete({
        ids: obsoletos.slice(inicio, inicio + 100),
      });
    }

    console.log(
      `Indexación finalizada en la colección "${COLECCION}".`
    );
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );

    process.exitCode = 1;
  }
}

void main();