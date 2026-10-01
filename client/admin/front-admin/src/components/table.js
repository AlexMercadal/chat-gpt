class Table extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.data = []
    this.labels = JSON.parse(this.getAttribute('labels'))
  }

  connectedCallback() {
    this.loadData()
    this.render()
  }

  loadData() {
    this.data = [
      {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      },
      {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }, {
        name: 'Carlos',
        email: 'carlossedagambin@gmail.com',
        createdAt: '22-09-2026',
        updatedAt: '22-09-2026',
      }
    ]
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
      .table{
        display:flex;
        flex-direction:column;
      }

      .toolbar{
        display:flex;
        align-items:center;
        border-bottom:1px solid #AB2309;
        justify-content:space-between;
        width:100%;
        align-items:center;
      }

      .toolbar-left{
        cursor:pointer;
        background-color:#AB2309;
        fill:white;
        padding: 0.5rem 1rem;

      }

      .toolbar-left svg{
        height: 1.5rem;
      }

      .toolbar-right{
        display:flex;
        gap:1rem;
        background-color:#AB2309;
        padding: 0.8rem 1rem;
        color:white;
      }

      .toolbar-right-arrow{
        display:flex;
        align-items:center;
      }

      .toolbar-right-arrow svg{
        height:1rem;
        fill:white;
        cursor:pointer;
      }

      .table-body{
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 80vh;
        max-height: 80vh;
        overflow: auto;
        padding: 0 1rem;
      }

      .table-body::-webkit-scrollbar{
        width: 2px;
      }

      .table-body::-webkit-scrollbar-track{
        background: transparent;
      }

      .table-body::-webkit-scrollbar-thumb{
        background-color:#AB2309;
        border-radius: 10px;
      }

      .data{
        border: 1px solid #AB2309;
        background-color:white;
        display:flex;
        flex-direction:column;
        gap:1rem;
      }

      .data ul li{
        font-family:'Arimo', sans-serif;
        list-style:none;
        font-size: 0.9rem;
      }

      li span{
        font-family:'Valley Sans';
      }

      li span::after{
        content: ":";
        margin-right: 0.2rem;
      }


    </style>
    <div class="table">
      <div class="toolbar">
        <div class="toolbar-left">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>filter-outline</title><path d="M15,19.88C15.04,20.18 14.94,20.5 14.71,20.71C14.32,21.1 13.69,21.1 13.3,20.71L9.29,16.7C9.06,16.47 8.96,16.16 9,15.87V10.75L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L15,10.75V19.88M7.04,5L11,10.06V15.58L13,17.58V10.05L16.96,5H7.04Z" /></svg>
        </div>
        <div class="toolbar-right">
          <div class="toolbar-right-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-left-bold-outline</title><path d="M13,22L3,12L13,2V8H21V16H13V22M6,12L11,17V14H19V10H11V7L6,12Z" /></svg>
          </div>
          <div class="toolbar-right-center">
            <span>1/1</span>
          </div>
          <div class="toolbar-right-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-right-bold-outline</title><path d="M11,16H3V8H11V2L21,12L11,22V16M13,7V10H5V14H13V17L18,12L13,7Z" /></svg>
          </div>
        </div>
      </div>
      <div class="table-body"></div>
    </div>  
    `
    const tableBody = this.shadow.querySelector('.table-body')

    this.data.forEach(element => {

      const data = document.createElement('div')
      data.classList.add('data')
      tableBody.appendChild(data)

      const ul = document.createElement('ul')
      data.appendChild(ul)


      Object.entries(element).forEach(([key, value]) => {
        const li = document.createElement('li')
        ul.appendChild(li)
        li.textContent = value

        const label = document.createElement('span')
        label.textContent = this.labels[key]
        li.prepend(label)
      })

    })

  }
}




customElements.define('table-component', Table);