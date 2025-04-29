# Scraper de Produtos com Puppeteer e Vercel

Este projeto permite baixar informações de produtos, especificações, frontend do site e imagens usando Puppeteer e Vercel Serverless Functions.

## Funcionalidades

- Extração de informações de produtos de qualquer site de e-commerce
- Captura de imagens de produtos
- Download do HTML da página do produto
- Captura de screenshot da página inteira
- Extração de especificações técnicas
- Interface amigável para inserir URLs e visualizar resultados

## Requisitos

Para usar este projeto, você precisará:

1. Uma conta no [Browserless.io](https://www.browserless.io/sign-up-cloud-unit/) para obter um token de API
2. Node.js 14+ instalado localmente para desenvolvimento

## Configuração

1. Clone este repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Edite o arquivo `.env.local` e adicione seu token do Browserless:
   ```
   BLESS_TOKEN=seu_token_aqui
   ```

## Desenvolvimento Local

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Como Usar

1. Acesse a aplicação no navegador
2. Insira a URL de um produto (de qualquer site de e-commerce)
3. Clique em "Baixar Produto"
4. Aguarde enquanto o sistema extrai as informações
5. Visualize e baixe os dados extraídos, incluindo:
   - Título do produto
   - Preço
   - Descrição
   - Especificações técnicas
   - Imagens
   - Screenshot da página
   - HTML da página
   - Dados em formato JSON

## Implantação na Vercel

A maneira mais fácil de implantar este aplicativo é usar a [Plataforma Vercel](https://vercel.com/new).

1. Faça o upload do projeto para um repositório GitHub
2. Importe o projeto na Vercel
3. Adicione a variável de ambiente `BLESS_TOKEN` com seu token do Browserless
4. Implante!

## Personalização

Você pode personalizar os seletores CSS usados para extrair informações de produtos no arquivo `src/pages/api/scrape-product.ts`. Os seletores atuais são genéricos e funcionam com muitos sites de e-commerce, mas você pode precisar ajustá-los para sites específicos.

## Limitações

- O Browserless.io tem limites de uso em sua camada gratuita
- Alguns sites podem bloquear web scrapers
- A extração de dados depende da estrutura HTML do site, que pode mudar

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [Puppeteer](https://pptr.dev/)
- [Browserless.io](https://www.browserless.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.

