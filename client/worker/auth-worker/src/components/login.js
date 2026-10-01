class Login extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
      *{
        margin:0;
      }

      h1{
        color: hsla(10, 90%, 35%, 1.00);
        cursor:default;
        font-size:1.5rem;
        font-family:'Valley Sans';
      }

      form{
       width:100%;
      }

      .login-form{
        background-color:hsla(30, 64%, 96%, 1.00);
        height:100vh;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:2rem;
        
      }

      form{
        display:flex;
        flex-direction:column;
        gap:0.9rem;
        align-items:center;
        justify-content:flex-start;
      }

      .login-element{
        display:flex;
        flex-direction:column;
        gap:0.5rem;
        width:15%;
      }

      input{
        padding:0.3rem;
        font-family:'Arimo';
        border:1px solid hsla(10, 90%, 35%, 1.00);
      }

      label{
        color:hsla(10, 90%, 35%, 1.00);
        font-family:'Valley Sans';
      }

      .buttons{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:1rem;
        width:100%;
      }

      button{
        all:unset;
      }

      .send-button{
        background-color:hsla(10, 90%, 35%, 1.00);
        padding:0.4rem 0;
        width:15%;
        border-radius:0.5rem;
        text-align:center;
        color:white;
        cursor:pointer;
        font-family:'Valley Sans';
        font-size:0.9rem;
      }

      .password-button{
        color:hsla(10, 90%, 35%, 1.00);
        cursor:pointer;
        font-family:'Valley Sans';
        font-size:0.9rem;
      }

    </style>
      <div class="login-form">
        <form>
          <div class="title">
            <h1>${this.title}</h1>
          </div>

          <div class="login-element">
            <label for="email">Email</label>
            <input type="text" id="email" name="email">
          </div>

          <div class="login-element">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password">
          </div>

          <div class="buttons">
            <div class="send-button">
              <button>Enviar</button>
            </div>
            <div class="password-button">
              <button>Olvidé mi contraseña</button>
            </div>  
          </div>
        </form>
      </div>
      
    `
    this.shadow.querySelector('.send-button').addEventListener('click', () => {
      alert("hola")
    })


  }
}

customElements.define('login-component', Login);