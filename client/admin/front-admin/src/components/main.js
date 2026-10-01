class Main extends HTMLElement {

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
        box-sizing: border-box;
      }

      main{
        display: grid;
        gap: 2rem;
        grid-template-columns: 1fr 3fr;
        width: 100%;
        background-color: hsla(30, 64%, 96%, 1.00);
        padding: 2rem;
      }
    </style>

    <main>
      <slot></slot>
    </main>
    `

  }
}




customElements.define('main-component', Main);