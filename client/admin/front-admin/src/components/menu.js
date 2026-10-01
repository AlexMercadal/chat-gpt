class Menu extends HTMLElement {

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
      svg{
        width:40px;
        cursor: pointer;
        fill:white;
      }

      nav{
        background-color: hsl(0, 0%, 100%);
        right: -200px;
        position: fixed;
        width: 200px;
      }

      nav.active{
        right: 0;
      }
    </style>

    <div class="menu">
      <div class="menu-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>menu</title>
          <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
        </svg>
      </div>
      <nav>
        <ul>
          <li>Usuarios</li>
          <li>Proyectos</li>
        </ul>
      </nav>
    </div>
    `

    this.shadow.querySelector('.menu-button').addEventListener('click', () => {
    })

  }
}

customElements.define('menu-component', Menu);
