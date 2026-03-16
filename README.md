## Weather App

Um aplicativo de clima elegante construído com **JavaScript Vanilla, HTML e CSS**. A interface é inspirada nas tendências modernas de design glassmorphism do macOS e iOS, com microanimações suaves, acompanhamento dinâmico de nascer e pôr do sol e dados meteorológicos em tempo real.

![Weather App Preview](/public/assets/weather-app-ui-preview.png) 

---

## Funcionalidades

**Interface moderna**

* Gradientes profundos em tons de índigo
* Cartões com efeito de vidro fosco (glassmorphism)
* Estrelas com efeito parallax
* Iluminação suave na interface

**Geolocalização automática**

Solicita a localização do usuário para mostrar imediatamente o clima da região.

**Integração com a API OpenWeather**

Inclui:

* Condições atuais

  * Temperatura
  * Máxima e mínima
  * Descrição do clima

* Previsão por hora

  * Próximas 24 horas
  * Cards roláveis

* Previsão semanal de 5 dias

  * Barras dinâmicas de temperatura máxima e mínima

* Índice de Qualidade do Ar (AQI)

* Índice UV com barra de gradiente dinâmica

* Bússola do vento

  * Rosa dos ventos em SVG que gira para mostrar a direção do vento

* Rastreamento do nascer e pôr do sol

  * Visualizado em um arco dinâmico

**Busca por cidade**

Busca em tempo real com debounce para pesquisar o clima de qualquer cidade do mundo.

---

## Tecnologias Utilizadas

**Vite**
Ferramenta extremamente rápida para desenvolvimento.

**HTML5 e CSS3 puros**
Sem frameworks CSS como Tailwind ou Bootstrap. Utiliza:

* CSS Variables
* backdrop-filter blur
* Flexbox e Grid
* animações com keyframes

**JavaScript Vanilla (ES6+)**

Sem uso de React ou Vue. Utiliza recursos modernos como:

* async / await
* Promise.allSettled()
* manipulação direta do DOM

---

## Como começar

### 1. Requisitos

Node.js instalado.

---

### 2. Clonar e instalar o projeto

```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
npm install
```

---

### 3. Configuração da API

Este projeto utiliza a API gratuita do OpenWeatherMap.

1. Crie uma conta em
   [https://openweathermap.org/](https://openweathermap.org/)

2. Crie um arquivo `.env` na raiz do projeto.

3. Adicione sua chave de API:

```env
VITE_OPENWEATHER_API_KEY=sua_api_key_aqui
```

---

### 4. Rodar o projeto

```bash
npm run dev
```

Abra no navegador:

```
http://localhost:5173
```

---

## Estrutura do Projeto

**index.html**

Estrutura principal da aplicação. Contém SVGs e elementos que são manipulados pelo JavaScript.

**style.css**

Contém todo o sistema de estilos, variáveis, resets e animações.

**main.js**

Responsável pela lógica da aplicação:

* atualização do DOM
* busca com debounce
* renderização de componentes

**api.js**

Camada responsável pelas requisições para a API do OpenWeather.

**public**

Contém arquivos estáticos como imagens, ícones e recursos visuais.

---

## Licença

Este projeto é open source e está disponível sob a licença MIT.




