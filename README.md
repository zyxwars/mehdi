<div align='center'>
 <img src="assets/logo-simple.svg" width=300 height=300/>

# Mehdi

### Barebones html templating engine

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## Setup

```
npm install mehdi
```

## Run

Compile all templates one time

```
npx mehdi
```

Populate template on change

```
npx mehdi watch
```

## Project Structure

By default mehdi will use these folders, relative to current working directory

```javascript
watchDir: "./src"; // put your templates here
snippetDir: "./src/snippets"; // put your snippets here
distDir: "./dist"; // templates will be compiled here
```

You can customize these by creating <strong>mehdi.config.json</strong> in the current working directory

```json
{
  "watchDir": "./src",
  "snippetDir": "./src/snippets",
  "distDir": "./dist"
}
```

</div>
