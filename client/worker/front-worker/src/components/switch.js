class Switch extends HTMLElement {

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
      input {
        cursor: pointer;
        margin: 1rem auto;
        position: relative;
        width: 50px;
        height: 30px;
        border-radius: 25px;
        outline: none;
        background-color: #000000;
        box-shadow: hsl(138, 74%, 39%) 0px 13px 27px -5px, hsl(138, 74%, 39%) 0px 8px 16px -8px;
        -webkit-appearance: none;
        position:aboslute;
        left:50%;
        top:50%;
        transform: translate(-50%, -50%);
      }

      input::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 30%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        height: 1.25rem;
        width: 1.25rem;
        background-color: rgb(255, 255, 255);
        transition: left .3s;
      }

      input:checked {
        background-color: rgb(0, 0, 0);
      }

      input:checked::after {
        left: 70%;
        border-radius: 50%;
        height: 1.25rem;
        width: 1.25rem;
        background-color: rgb(255, 255, 255);
      }

      body {
        transition: filter .3s;
      }

      body.invertido {
        filter: invert(1);
      }
    </style>

    <input type="checkbox" id="colorSwitch">
    `

    const switchColor = this.shadow.querySelector('#colorSwitch');

    switchColor.addEventListener('change', () => {
      document.body.classList.toggle('invertido', switchColor.checked);
    })
  }
}

customElements.define('switch-component', Switch);
