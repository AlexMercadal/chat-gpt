class Form extends HTMLElement {

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
      button {
        all: unset;
        cursor: pointer;
      }
      
      .form{
        height:100%;
        display:flex;
        flex-direction:column;
      }

      .toolbar{
          display:flex;
          gap:5rem;
          align-items:center;
          border-bottom:1px solid #AB2309;
          justify-content:space-between;
          width:100%;
      }

      .tabs{
        display:flex;
        gap: 0.1rem;
      }

      .tab{
        font-size:1.2rem;
        background-color: hsla(10, 90%, 35%, 0.5);
        color:white;
        padding: 0.7rem 1rem;
      }

      .tab.active{
        background-color: hsla(10, 90%, 35%, 1.00);
      }

      .form-buttons{
        display:flex;
        gap:1.5rem;
        background-color:#AB2309;
        padding: 0.5rem 1rem;
        color:white;
      }

      .form-button svg{
        height:1.5rem;
        fill:white;
        cursor:pointer;
      }

      .content{
        max-height:80vh;
        background-color:white;
        padding: 1rem 0rem;
        overflow:auto;
      }

      .data{
        width:100%;
        display:none;
        gap:1rem;
        padding:1rem;
        min-height:85vh;
        max-height:85vh;
        overflow:hidden;
      }

      .data.active{
        display:flex;
      }

      .content::-webkit-scrollbar{
        width: 2px;
      }

      .content::-webkit-scrollbar-track{
        background: transparent;
      }

      .content::-webkit-scrollbar-thumb{
        background-color:#AB2309;
        border-radius: 10px;
      }

      .data.active{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
        gap: 1rem;
        align-content: start;
        grid-auto-rows: max-content;
        width:95%;
      }

      .data-form{
        display:flex;
        flex-direction:column;
        gap:0.5rem;
      }

      .data-form label{
        font-family: 'Valley Sans', sans-serif;
        font-size: 0.9rem;
      }

      .data-form input{
        padding: 0.5rem;
        font-family:'Arimo';
        font-size: 0.8rem;
        font-weight:400;
      }




    </style>

    <div class="form">
      <div class="toolbar">
        <div class="tabs">
          <button class="tab active" data-tab="General">General</button>
          <button class="tab" data-tab="Contacto">Contacto</button>
        </div>

        <div class="form-buttons">
          <div class="form-button clean-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>broom</title><path d="M19.36,2.72L20.78,4.14L15.06,9.85C16.13,11.39 16.28,13.24 15.38,14.44L9.06,8.12C10.26,7.22 12.11,7.37 13.65,8.44L19.36,2.72M5.93,17.57C3.92,15.56 2.69,13.16 2.35,10.92L7.23,8.83L14.67,16.27L12.58,21.15C10.34,20.81 7.94,19.58 5.93,17.57Z" /></svg>
          </div>
          <div class="form-button store-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>content-save-outline</title><path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" /></svg>
          </div>
        </div>
      </div>
      
      <div class="content">
        <form action="" class="form-data">
          <div class="data active" data-content="General">
            <div class="data-form">
              <label for="name">Nombre</label>
              <input type="text" id="name" name="name" >
            </div>
            
            <div class="data-form">
              <label for="email">Email</label>
              <input type="text" id="email" name="email">
            </div>
          </div>

          <div class="data" data-content="Contacto">
            <div class="data-form">
              <label for="phone">Teléfono</label>
              <input type="text" id="phone" name="phone">
            </div>
            
            <div class="data-form">
              <label for="address">Dirección</label>
              <input type="text" id="address" name="address">
            </div>
          </div>
        </form>
      </div>
    </div>
    `

    const form = this.shadow.querySelector(".form")

    form.addEventListener("click", event => {

      if (event.target.closest(".tab")) {

        const tab = event.target.closest(".tab")

        this.shadow.querySelector(".tab.active").classList.remove("active")
        tab.classList.add("active")

        this.shadow.querySelector(".data.active").classList.remove("active")
        this.shadow.querySelector(`.data[data-content="${tab.dataset.tab}"]`).classList.add("active")
      }

      if (event.target.closest('.clean-button')) {

      }

      if (event.target.closest('.store-button')) {

      }
    })
  }
}

customElements.define('form-component', Form);