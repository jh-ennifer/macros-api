import express, { Request, Response } from 'express';
import cors from 'cors';
import { Database } from 'sqlite';
import { setupDatabase } from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

let db: Database;

// Rota de busca por nome (Ex: /alimentos?q=arroz)
app.get('/alimentos', async (req: Request, res: Response) => {
  const query = (req.query.q as string)?.trim();

  if (!query) {
    return res.status(400).json({ error: 'Informe um termo para busca' });
  }

  try {
    if (!db) {
      return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
    }

    // Busca no nome em português ou no nome em inglês (para a tabela USDA)
    const alimentos = await db.all(
      `SELECT * FROM alimentos 
       WHERE nome LIKE ? OR (nome_ingles IS NOT NULL AND nome_ingles LIKE ?) 
       LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );

    // Formata o retorno para descompactar o JSON de nutrientes e montar a estrutura original
    const resultadoFormatado = alimentos.map((item) => ({
      id: item.id,
      fonte: item.fonte,
      codigo_original: item.codigo_original,
      nome: item.nome,
      nome_ingles: item.nome_ingles,
      categoria: item.categoria,
      categoria_ingles: item.categoria_ingles,
      macros_principais: {
        energia_kcal: item.energia_kcal,
        energia_kj: item.energia_kj,
        proteina_g: item.proteina_g,
        lipideos_g: item.lipideos_g,
        carboidratos_g: item.carboidratos_g,
        fibra_g: item.fibra_g,
      },
      nutrientes_completos: item.nutrientes_completos ? JSON.parse(item.nutrientes_completos) : {},
    }));

    return res.json(resultadoFormatado);
  } catch (error) {
    console.error('Erro ao buscar alimentos:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para buscar alimento por ID (Ex: /alimentos/TACO_1)
app.get('/alimentos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!db) {
      return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
    }

    const item = await db.get('SELECT * FROM alimentos WHERE id = ?', [id]);

    if (!item) {
      return res.status(404).json({ error: 'Alimento não encontrado' });
    }

    const resultadoFormatado = {
      id: item.id,
      fonte: item.fonte,
      codigo_original: item.codigo_original,
      nome: item.nome,
      nome_ingles: item.nome_ingles,
      categoria: item.categoria,
      categoria_ingles: item.categoria_ingles,
      macros_principais: {
        energia_kcal: item.energia_kcal,
        energia_kj: item.energia_kj,
        proteina_g: item.proteina_g,
        lipideos_g: item.lipideos_g,
        carboidratos_g: item.carboidratos_g,
        fibra_g: item.fibra_g,
      },
      nutrientes_completos: item.nutrientes_completos ? JSON.parse(item.nutrientes_completos) : {},
    };

    return res.json(resultadoFormatado);
  } catch (error) {
    console.error('Erro ao buscar alimento por ID:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

//Rota para busca de alimentos por tabela (fonte) (Ex: /alimentos/tabela/TACO)
app.get('/alimentos/fonte/:fonte', async (req: Request, res: Response) => {
	const { fonte } = req.params;

	try {
		if (!db) {
			return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
		}

		const alimentos = await db.all('SELECT * FROM alimentos WHERE fonte = ?', [fonte]);

		if (alimentos.length === 0) {
			return res.status(404).json({ error: 'Nenhum alimento encontrado para a fonte especificada' });
		}

		const resultadoFormatado = alimentos.map((item) => ({
			id: item.id,
			fonte: item.fonte,
			codigo_original: item.codigo_original,
			nome: item.nome,
			nome_ingles: item.nome_ingles,
			categoria: item.categoria,
			categoria_ingles: item.categoria_ingles,
			macros_principais: {
				energia_kcal: item.energia_kcal,
				energia_kj: item.energia_kj,
				proteina_g: item.proteina_g,
				lipideos_g: item.lipideos_g,
				carboidratos_g: item.carboidratos_g,
				fibra_g: item.fibra_g,
			},
			nutrientes_completos: item.nutrientes_completos ? JSON.parse(item.nutrientes_completos) : {},
		}));

		return res.json(resultadoFormatado);
	} catch (error) {
		console.error('Erro ao buscar alimentos por fonte:', error);
		return res.status(500).json({ error: 'Erro interno no servidor' });
	}
})

// Rota para busca de alimentos por categoria (PT ou EN)
app.get('/alimentos/categoria/:categoria', async (req: Request, res: Response) => {
	const {categoria} = req.params

	try{
		if (!db) {
			return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
		}
		const alimentos = await db.all(`SELECT * FROM alimentos 
			WHERE categoria LIKE ? OR (categoria_ingles IS NOT NULL AND categoria_ingles LIKE ?)`, [`%${categoria}%`, `%${categoria}%`]);

		if (alimentos.length === 0) {
			return res.status(404).json({ error: 'Nenhum alimento encontrado para a categoria especificada' });
		}
		
		const resultadoFormatado = alimentos.map((item) => ({
			id: item.id,
			fonte: item.fonte,
			codigo_original: item.codigo_original,
			nome: item.nome,
			nome_ingles: item.nome_ingles,
			categoria: item.categoria,
			categoria_ingles: item.categoria_ingles,
			macros_principais: {
				energia_kcal: item.energia_kcal,
				energia_kj: item.energia_kj,
				proteina_g: item.proteina_g,
				lipideos_g: item.lipideos_g,
				carboidratos_g: item.carboidratos_g,
				fibra_g: item.fibra_g,
			},
			nutrientes_completos: item.nutrientes_completos ? JSON.parse(item.nutrientes_completos) : {},
		}));

		return res.json(resultadoFormatado);

	}catch(error){
		console.error("Erro ao buscar alimentos por categoria:", error)
		return res.status(500).json({error: "Erro interno no servidor"})
	}
})

// Rota para buscar dados simplificados de um alimento
app.get('/alimentos/simplificado/:name', async (req: Request, res: Response) => {
	const {name} = req.params
	
	if (!name) {
		return res.status(400).json({ error: 'Informe um termo para busca' });
	}

	try {
		if (!db) {
		return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
		}

		// Busca no nome em português ou no nome em inglês (para a tabela USDA)
		const alimentos = await db.all(
		`SELECT fonte, nome, nome_ingles, energia_kcal, energia_kj, proteina_g, lipideos_g, carboidratos_g, fibra_g FROM alimentos 
		WHERE nome LIKE ? OR (nome_ingles IS NOT NULL AND nome_ingles LIKE ?)`,
		[`%${name}%`, `%${name}%`]
		);

		const resultadoFormatado = alimentos.map((item) => ({
			fonte: item.fonte,
			nome: item.nome,
			nome_ingles: item.nome_ingles,
			macros_principais: {
				energia_kcal: item.energia_kcal,
				energia_kj: item.energia_kj,
				proteina_g: item.proteina_g,
				lipideos_g: item.lipideos_g,
				carboidratos_g: item.carboidratos_g, 
				fibra_g: item.fibra_g
			}
		}))

		return res.json(resultadoFormatado)
		
	} catch (error) {
		console.error('Erro ao buscar alimentos:', error);
    	return res.status(500).json({ error: 'Erro interno no servidor' });
	}
})

// Rota para buscar dados simplificados de um alimento + fonte específica
app.get('/alimentos/simplificado/:name/:fonte', async (req: Request, res: Response) => {
	const {name, fonte} = req.params
	
	if (!name || !fonte) {
		return res.status(400).json({ error: 'Informe os dados para busca' });
	}

	try {
		if (!db) {
		return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
		}

		// Busca no nome em português ou no nome em inglês (para a tabela USDA)
		const alimentos = await db.all(
		`SELECT fonte, nome, nome_ingles, energia_kcal, energia_kj, proteina_g, lipideos_g, carboidratos_g, fibra_g FROM alimentos 
		WHERE (nome LIKE ? OR (nome_ingles IS NOT NULL AND nome_ingles LIKE ?)) AND fonte = ?`,
		[`%${name}%`, `%${name}%`, fonte]
		);

		const resultadoFormatado = alimentos.map((item) => ({
			fonte: item.fonte,
			nome: item.nome,
			nome_ingles: item.nome_ingles,
			macros_principais: {
				energia_kcal: item.energia_kcal,
				energia_kj: item.energia_kj,
				proteina_g: item.proteina_g,
				lipideos_g: item.lipideos_g,
				carboidratos_g: item.carboidratos_g, 
				fibra_g: item.fibra_g
			}
		}))

		return res.json(resultadoFormatado)
		
	} catch (error) {
		console.error('Erro ao buscar alimentos:', error);
    	return res.status(500).json({ error: 'Erro interno no servidor' });
	}
})

// Rota para buscar dados simplificados de um alimento + fonte específica
app.get('/alimentos/:name/:fonte', async (req: Request, res: Response) => {
	const {name, fonte} = req.params
	
	if (!name || !fonte) {
		return res.status(400).json({ error: 'Informe os dados para busca' });
	}

	try {
		if (!db) {
		return res.status(503).json({ error: 'Banco de dados ainda não inicializado' });
		}

		// Busca no nome em português ou no nome em inglês (para a tabela USDA)
		const alimentos = await db.all(
		`SELECT * FROM alimentos 
		WHERE (nome LIKE ? OR (nome_ingles IS NOT NULL AND nome_ingles LIKE ?)) AND fonte = ?`,
		[`%${name}%`, `%${name}%`, fonte]
		);

		const resultadoFormatado = alimentos.map((item) => ({
		id: item.id,
		fonte: item.fonte,
		codigo_original: item.codigo_original,
		nome: item.nome,
		nome_ingles: item.nome_ingles,
		categoria: item.categoria,
		categoria_ingles: item.categoria_ingles,
		macros_principais: {
			energia_kcal: item.energia_kcal,
			energia_kj: item.energia_kj,
			proteina_g: item.proteina_g,
			lipideos_g: item.lipideos_g,
			carboidratos_g: item.carboidratos_g,
			fibra_g: item.fibra_g,
		},
		nutrientes_completos: item.nutrientes_completos ? JSON.parse(item.nutrientes_completos) : {},
		}));

		return res.json(resultadoFormatado)
		
	} catch (error) {
		console.error('Erro ao buscar alimentos:', error);
    	return res.status(500).json({ error: 'Erro interno no servidor' });
	}
})

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    db = await setupDatabase();
    console.log('Banco de dados pronto!');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

startServer();