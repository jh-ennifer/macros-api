import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import fs from 'node:fs';
import path from 'node:path';

export interface MacrosPrincipais {
  energia_kcal: number | null;
  energia_kj: number | null;
  proteina_g: number | null;
  lipideos_g: number | null;
  carboidratos_g: number | null;
  fibra_g: number | null;
}

export interface Alimento {
  id: string;
  fonte: 'TACO' | 'TBCA' | 'USDA' | string;
  codigo_original: string | number;
  nome: string;
  nome_ingles?: string;
  categoria: string;
  categoria_ingles?: string;
  macros_principais: MacrosPrincipais;
  nutrientes_completos: Record<string, unknown>;
}

let dbInstance: Database | null = null;

export async function setupDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.resolve(process.cwd(), 'nutricao.db'),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS alimentos (
      id TEXT PRIMARY KEY,
      fonte TEXT NOT NULL,
      codigo_original TEXT,
      nome TEXT NOT NULL,
      nome_ingles TEXT,
      categoria TEXT NOT NULL,
      categoria_ingles TEXT,
      energia_kcal REAL,
      energia_kj REAL,
      proteina_g REAL,
      lipideos_g REAL,
      carboidratos_g REAL,
      fibra_g REAL,
      nutrientes_completos TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_nome ON alimentos(nome);
    CREATE INDEX IF NOT EXISTS idx_fonte ON alimentos(fonte);
  `);

  const count = await dbInstance.get<{ total: number }>('SELECT COUNT(*) as total FROM alimentos');

  if (count && count.total === 0) {
    const possibleFiles = ['unified_tables.json', 'alimentos.json', 'alimentos_unificados.json'];
    let caminhoJson = '';

    for (const file of possibleFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        caminhoJson = fullPath;
        break;
      }
    }

    if (caminhoJson) {
      console.log(`Carregando dados a partir de ${path.basename(caminhoJson)}...`);
      const rawData = fs.readFileSync(caminhoJson, 'utf-8');
      const alimentos: Alimento[] = JSON.parse(rawData);

      await dbInstance.exec('BEGIN TRANSACTION');

      const stmt = await dbInstance.prepare(`
        INSERT INTO alimentos (
          id, fonte, codigo_original, nome, nome_ingles, categoria, categoria_ingles,
          energia_kcal, energia_kj, proteina_g, lipideos_g, carboidratos_g, fibra_g,
          nutrientes_completos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of alimentos) {
        await stmt.run(
          item.id,
          item.fonte,
          item.codigo_original != null ? String(item.codigo_original) : null,
          item.nome,
          item.nome_ingles ?? null,
          item.categoria,
          item.categoria_ingles ?? null,
          item.macros_principais?.energia_kcal ?? null,
          item.macros_principais?.energia_kj ?? null,
          item.macros_principais?.proteina_g ?? null,
          item.macros_principais?.lipideos_g ?? null,
          item.macros_principais?.carboidratos_g ?? null,
          item.macros_principais?.fibra_g ?? null,
          JSON.stringify(item.nutrientes_completos || {})
        );
      }

      await stmt.finalize();
      await dbInstance.exec('COMMIT');
      console.log(`Banco de dados populado com ${alimentos.length} alimentos!`);
    } else {
      console.warn('Nenhum arquivo JSON de alimentos encontrado para popular o banco.');
    }
  }

  return dbInstance;
}