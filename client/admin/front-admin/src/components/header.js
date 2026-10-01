class Header extends HTMLElement {

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
      * {
        box-sizing: border-box;
      }

      header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding: 0 2rem;
        background-color:#AB2309;
      }
    </style>

    <header>
      <slot></slot>
    </header>
    `
  }
}




customElements.define('header-component', Header);