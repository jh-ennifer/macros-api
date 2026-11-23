# 🥗 API de Tabela de Alimentos & Macronutrientes

Uma API RESTful em **Node.js** e **TypeScript** para consulta de dados nutricionais unificados de alimentos a partir das tabelas de referência **TACO** (Tabela Brasileira de Composição de Alimentos), **TBCA** (Tabela Brasileira de Composição de Alimentos - USP) e **USDA** (U.S. Department of Agriculture).

---

## 📌 O que é e para que serve?

Esta API fornece acesso a uma base unificada com mais de **6.600 alimentos**. Ela permite que aplicações (como apps de dieta, contadores de calorias, plataformas de nutrição ou estudos acadêmicos) realizem buscas rápidas por nome ou por código identificador para obter:

- **Informações básicas**: ID, tabela de origem, código original, nome e categoria.
- **Macronutrientes Principais**: Energia (kcal/kJ), Proteínas (g), Lipídios (g), Carboidratos (g) e Fibra Alimentar (g).
- **Nutrientes Completos**: Composição detalhada incluindo vitaminas, minerais, ácidos graxos, colesterol e aminoácidos.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** (v18 ou superior)
- **TypeScript**
- **Express.js** (Framework HTTP)
- **SQLite3 & sqlite** (Banco de dados relacional em arquivo local)
- **CORS** (Cross-Origin Resource Sharing)
- **TSX** (Executor e watcher TypeScript rápido para desenvolvimento)

---

## 🚀 Como Instalar e Rodar

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (v18+) e o **npm** instalados na sua máquina.

### 2. Clonar o repositório e acessar a pasta
```bash
git clone https://github.com/jh-ennifer/macros-api.git
cd macros-api
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Executar em modo de desenvolvimento
```bash
npm run dev
```
> 💡 **Nota:** Na primeira execução, a API irá ler automaticamente o arquivo `unified_tables.json` e popular o banco de dados `nutricao.db` com os 6.628 alimentos. Nas execuções seguintes, o banco já estará pronto e o carregamento será instantâneo.

O servidor estará rodando em: `http://localhost:3000`

---

## 📦 Compilando para Produção

Para gerar o código JavaScript otimizado para produção:

```bash
# Compila o TypeScript para a pasta ./dist
npm run build

# Executa o servidor em produção
node dist/index.js
```

---

## 📡 Endpoints da API

### 1. Buscar Alimentos por Nome
Realiza a busca de alimentos pelo nome (em português ou inglês). Retorna até 20 resultados correspondentes.

- **Método:** `GET`
- **Rota:** `/alimentos`
- **Parâmetros de Query:** `q` (obrigatório) - Termo a ser pesquisado.

#### Exemplo de Requisição:
```http
GET http://localhost:3000/alimentos?q=arroz
```

#### Exemplo de Resposta (`200 OK`):
```json
[
  {
    "id": "TACO_1",
    "fonte": "TACO",
    "codigo_original": "1",
    "nome": "Arroz, integral, cozido",
    "nome_ingles": null,
    "categoria": "Cereais e derivados",
    "categoria_ingles": null,
    "macros_principais": {
      "energia_kcal": 123.53,
      "energia_kj": 516.87,
      "proteina_g": 2.59,
      "lipideos_g": 1.00,
      "carboidratos_g": 25.81,
      "fibra_g": 2.75
    },
    "nutrientes_completos": {
      "Umidade (%)": 70.14,
      "Cálcio (mg)": 5.204,
      "Ferro (mg)": 0.262,
      "Sódio (mg)": 1.24
    }
  }
]
```

---

### 2. Buscar Alimento por ID
Retorna todas as informações detalhadas de um alimento específico usando o seu código único.

- **Método:** `GET`
- **Rota:** `/alimentos/:id`

#### Exemplo de Requisição:
```http
GET http://localhost:3000/alimentos/TACO_1
```

#### Exemplo de Resposta (`200 OK`):
```json
{
  "id": "TACO_1",
  "fonte": "TACO",
  "codigo_original": "1",
  "nome": "Arroz, integral, cozido",
  "nome_ingles": null,
  "categoria": "Cereais e derivados",
  "categoria_ingles": null,
  "macros_principais": {
    "energia_kcal": 123.53,
    "energia_kj": 516.87,
    "proteina_g": 2.59,
    "lipideos_g": 1.00,
    "carboidratos_g": 25.81,
    "fibra_g": 2.75
  },
  "nutrientes_completos": {
    "Umidade (%)": 70.14,
    "Energia (kcal)": 123.53,
    "Energia (kJ)": 516.87,
    "Proteína (g)": 2.59,
    "Lipídios (g)": 1.00,
    "Carboidratos (g)": 25.81,
    "Fibra alimentar (g)": 2.75,
    "Cálcio (mg)": 5.204,
    "Magnésio (mg)": 58.702,
    "Fósforo (mg)": 105.853,
    "Ferro (mg)": 0.262,
    "Sódio (mg)": 1.244,
    "Potássio (mg)": 75.15
  }
}
```

---

## 📄 Licença

Este projeto está licenciado sob a licença **ISC**.
