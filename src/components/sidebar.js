class Sidebar extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.title = this.getAttribute('title')
    this.color = this.getAttribute('color')
    this.message = this.getAttribute('message')
    this.data = []
  }

  connectedCallback() {
    this.loadData()
    this.render()
  }

  loadData() {
    this.data = [
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },
      {
        name: 'Lorem',
        url: '#',
      },

    ]
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


          aside {
            display: flex;
            flex-direction: column;
            width: 20%;
            z-index: 1001;
            background-color: hsl(0, 0%, 6%);
            height:100vh;
          }

          .aside-right {
            left: 0;
            position: fixed;
            top: 0;
            transition: all 1s ease;
            z-index:1001;
          }

          .aside-right.inactive {
            background-color: red;
          }

          .aside-left {
            width: 2%;
            position: fixed;
            left: -10%;
            height: 100%;
            overflow: hidden;
            transition: all 0.5s ease;
          }


          .aside-left.active {
            left: 0%;
          }

          .aside-right.inactive {
            left: -100%;
          }

          .sidebar-active::-webkit-scrollbar-thumb,
          .sidebar-active::-webkit-scrollbar-thumb {
            background-color: #181818;
          }

          .sidebar-active::-webkit-scrollbar,
          .sidebar-active::-webkit-scrollbar {
            width: 5px;
            height: 8px;
            background-color: white;
          }

          .sidebar-active::-webkit-scrollbar:horizontal,
          .sidebar-active::-webkit-scrollbar:horizontal {
            display: none;
          }

          .sidebar-active::-webkit-scrollbar-thumb:active,
          .sidebar-active::-webkit-scrollbar-thumb:active {
            background-color: #313131;
          }

          .sidebar-active::-webkit-scrollbar-thumb:hover,
          .sidebar-active::-webkit-scrollbar-thumb:hover {
            background-color: #313131;
          }


          .sidebar-left {
            cursor: pointer;
          }

          .sidebar-active {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            padding-left: 1rem;
            padding-right: 1rem;
            height:100vh;
            overflow:scroll;
          }

          .sidebar-top {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }

          .sidebar-top h2 {
            font-family: "Google Sans", sans-serif;
            font-size: 1rem;
          }

          .sidebar-top-title {
            width: 60%;
          }

          .sidebar-top-icons {
            width: 40%;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            cursor: pointer;
          }

          .sidebar-top-icons svg {
            width: 20%;
          }

          .sidebar-fixed {
            width: 100%;
            height: 20vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 0.2rem;
          }

          .sidebar-fixed-title {
            width: 100%;
          }

          .sidebar-fixed-title h3 {
            font-family: "Google Sans", sans-serif;
            font-size: 1.3rem;
            text-align: left;
          }

          .sidebar-inactive {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 1rem;

          }

          .sidebar-inactive svg {
            width: 100%;
          }

    </style>

  <aside class="aside-right">
    <div class="sidebar-active">
      <div class="sidebar-top">
        <div class="sidebar-top-title">
          <h2>Chat GPT</h2>
        </div>
        <div class="sidebar-top-icons">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>magnify</title>
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <svg class="sidebar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>inbox</title>
            <path
              d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
          </svg>
        </div>
      </div>
    </div>
    <chatarea-component></chatarea-component>
    <userarea-component title="Usuario"></userarea-component>
  </aside>


  <aside class="aside-left">
    <div class="sidebar-inactive">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>magnify</title>
        <path
          d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
      </svg>
      <svg class="sidebar-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>inbox</title>
        <path
          d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>folder-outline</title>
        <path
          d="M20,18H4V8H20M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z" />
      </svg>
    </div>
  </aside>
    `

    this.shadow.querySelector('.sidebar').addEventListener("click", () => {
      this.shadow.querySelector('.aside-right').classList.toggle('inactive');
      this.shadow.querySelector('.aside-left').classList.toggle('active');
      this.shadow.querySelector('main').classList.toggle('active');
    })

    this.shadow.querySelector('.sidebar-left').addEventListener("click", () => {
      this.shadow.querySelector('.aside-right').classList.toggle('inactive');
      this.shadow.querySelector('.aside-left').classList.toggle('active');
      this.shadow.querySelector('main').classList.toggle('active');
    })
  }
}

customElements.define('sidebar-component', Sidebar);
