class Chat extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.title = this.getAttribute('title')
    this.color = this.getAttribute('color')
    this.message = this.getAttribute('message')
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
      * {
        box-sizing: border-box;
      }


      body {
        margin: 0;
      }

      main {
        display: flex;
        flex-direction: column;
        gap: 10vh;
        padding-left: 5rem;
        padding-right: 5rem;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      a {
        margin: 0;
        color: white
      }

      ul,
      ol {
        margin: 0;
        padding: 0;
        list-style: none;
        color: white
      }

      span {
        color: white
      }

      svg {
        fill: white
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button {
        all: unset;
        cursor: pointer;
      }

      .main-chat {
        height: 70vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
      }

      .main-chat-title h1 {
        font-family: "Google Sans", sans-serif;
        font-size: 2rem;
        text-align: center;
      }

      .main-chat-form {
        width: 70%;
      }

      .main-chat-form input {
        width: 100%;
        height: 10vh;
        background-color: #181818;
        padding: 1rem 3rem;
        border-radius: 10px;
        position: relative;
        border: 1px solid white;
      }

      .main-chat-form input::placeholder {
        color: white;
        font-family: "Valley Sans", sans-serif;
      }

      .text {
        color: white;
        font-family: "Valley Sans", sans-serif;
      }


      .main-chat-form-icons {
        position: absolute;
        width: 47%;
        height: 10%;
        cursor: pointer;
      }

      .main-chat-form-icons :first-child {
        position: absolute;
        top: -6.3vh;
        left: 0.5rem;
      }

      .main-chat-form-icons :last-child {
        position: absolute;
        top: -6.3vh;
        right: 0;
      }

      .main-chat-form-icons svg {
        width: 2.5%;
      }

    </style>

     <div class="main-chat">
      <div class="main-chat-title">
        <h1>¿En qué puedo ayudar, Alex?</h1>
      </div>

      <div class="main-chat-form">
        <form action="">
          <input type="text" class="text" placeholder="Escribe un mensaje...">
          <div class="main-chat-form-icons">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>file-upload-outline</title>
              <path
                d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M12,12L16,16H13.5V19H10.5V16H8L12,12Z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>send-variant-outline</title>
              <path d="M3 20V4L22 12M5 17L16.85 12L5 7V10.5L11 12L5 13.5M5 17V7 13.5Z" />
            </svg>
          </div>
        </form>
      </div>
    </div>
    `
  }
}

customElements.define('chat-component', Chat);
