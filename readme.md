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

- Arquivo index.js:

| Variável     | Função           |
| ---          | ---              |
| filename | Informar o nome do arquivo que será processado |

- Arquivo SpreadsheetReader.js -> Método setConfigs() -> atributo this.configs:

| Chave        | Função           |
| ---          | ---              |
| path | caminho a partir do diretório atual que será salvo os arquivos (criação de pastas) |
| filenameTemplate | Padrão de nome que será salvo os arquivos JSONs  |
| columnBotName | Nome da coluna que está salvo o nome de cada bot |
| columnBotKey | Nome da coluna que está salvo a chave de cada bot |
| pages | Array que recebe o valor de cada página que será procurada |
| pages | Array que recebe o nome de cada bot que não será escrito nos arquivos JSONs|

**OBS: Usar sempre letra minúscula nos valores da variável de configuração.**

Após a realização dessas configurações, basta executar o programa dando o comando:
```
npm index
```