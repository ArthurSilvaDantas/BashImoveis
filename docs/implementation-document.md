<h1 align="center">
  Documentação de Implantação
</h1>

## 1 Documento

Este Documento de Implantação descreve um guia passo a passo para colocar o sistema em funcionamento. Seja no ambiente de desenvolvimento, homologação ou produção. O objetivo é fornecer informações claras e concisas para facilitar a instalação e configuração do sistema.

## 2 Local

Para o ambiente de desenvolvimento, independente do sistema operacional, é necessário ter o Node.js instalado globalmente em sua máquina, assim como o [Vue](https://vuejs.org/). Para isso, siga as instruções de instalação do Node.js em [nodejs.org](https://nodejs.org/).

Após instalar o Node.js, você pode verificar se a instalação foi bem-sucedida, após isso, clone o repositório do projeto do GitHub. Para uma facilidade maior, crie na raiz do projeto um arquivo chamado `.env` e adicione as seguintes variáveis de ambiente, disponivel em `.env.example` na raiz do projeto.

As variaveis fornecidas para o ambiente de desenvolvimento é de carater interno, ou seja, não sera disponibilizado para o ambiente de produção. O arquivo `.env` não deve ser enviado para o repositório remoto, e não compartilhado nenhuma variavel de ambiente. Trata-se de um arquivo de configuração que contém informações sensíveis, sendo assim, não deve ser compartilhado publicamente.

Voltando para a execução do projeto, após clonar o repositório, entre na pasta do projeto e execute os seguintes comandos:

```bash
# Instala as dependências do projeto
npm install

# Executa o projeto
npm run dev
```

## 3 Produção

O ambiente de produção é implantado a partir da main, ou seja, o código que está na branch main é o código que está em produção. Diante disso, é necessário garantir que o código esteja sempre atualizado e funcionando corretamente, dessa forma evita-se quebrar a aplicação em produção.

Durante o desenvolvimento de uma nova funcionalidade, é obrigatório criar uma branch específica para esse fim. O padrão de nomenclatura das branches deve seguir o mesmo utilizado nos commits, ou seja, utilizando prefixos como `feat/`, `fix/`, `chore/`, `docs/`, entre outros. O nome da branch deve ser descritivo e indicar claramente qual funcionalidade está sendo desenvolvida. Por exemplo, se você estiver trabalhando em uma nova funcionalidade de login, a branch pode ser nomeada como `feat/login`.

Após o desenvolvimento, deve-se criar um pull request para a branch main, onde o código será revisado pelo Code Review. O Code Review é um processo de revisão do código por outros desenvolvedores da equipe, com o objetivo de garantir a qualidade do código e evitar erros. Durante o Code Review, o revisor deve verificar se o código está seguindo as boas práticas de programação, se está bem estruturado e se não há erros lógicos ou de sintaxe.

Após a aprovação do pull request, o código será mesclado na branch main e implantado em produção.
