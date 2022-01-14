# Spreadsheets To JSON

Projeto consiste na leitura de planilhas com informações dos bots e captura do nome e chave de cada um, passando essas informações para JSON através das configurações setadas no arquivo SpreadsheetReader.js -> método setConfigs().
OBS: Será abordado no título **Configurações** a descrição de cada configuração desse método.

## 🚀 Começando

Para iniciar basta instalar as dependências do Node.js dando o comando:
```
npm install
```
Após a instalação é necessário fazer algumas **configurações.**

## ⚙ Configurações

- Arquivo src/index.js:

| Variável     | Função           |
| ---          | ---              |
| filename | Informar o nome do arquivo que será processado |

- Arquivo src/config.json:

| Chave        | Função           |
| ---          | ---              |
| output | caminho a partir do diretório atual que será despejado os arquivos (criação de pastas) |
| filenameTemplate | Padrão de nome que será salvo os arquivos JSONs  |
| pages | Array que recebe o valor de cada página que será procurada |
| columns | Array que recebe objetos para pesquisa das colunas |
| columns:searchIndex | Valor da coluna que será procurado |
| columns:newIndexValue | Novo valor do índice que será substituído pelo valor da coluna |
| ignoreBots | Array que recebe o nome de cada bot que não será escrito nos arquivos JSONs|

**OBS: Usar sempre letra minúscula nos valores da variável de configuração.**

Após a realização dessas configurações, basta executar o programa dentro da pasta **src**, dando o comando:
```
npm index
```