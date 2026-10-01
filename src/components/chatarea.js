class Chatarea extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.title = this.getAttribute('title')
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

           span {
            color: white
          }

          svg {
            fill: white
          }

          
          ul,
          ol {
            margin: 0;
            padding: 0;
            list-style: none;
            color: white
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

          a {
            color: inherit;
            text-decoration: none;
          }

          
          .sidebar-main {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            position: sticky;
            top: 0;
            left: 0;
            z-index: 1002;
            background-color: #181818;
            margin-bottom: 5vh;
          }

          .sidebar-main-menu {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 0.5rem 0.5rem 0.5rem 0;
            gap: 0.5rem;
          }

          .sidebar-main-menu:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .side-main-menu:active {
            background-color: rgba(255, 255, 255, 0.2);
          }

          .sidebar-main-menu {
            width: 90%;
            display:flex;
            align-items:center;
            justify-content:flex-start;
          }

          .sidebar-main-menu span {
            font-family: "Google Sans", sans-serif;
            font-size: 1rem;
          }

          .sidebar-main-menu svg {
            width: 8%;
          }

          .sidebar-bottom {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            overflow:hidden;
            padding-left: 1rem;
            padding-right: 1rem;
          }

         .sidebar-bottom-title {
            padding-bottom: 1rem;
          }

          .sidebar-bottom-title h3 {
            font-family: "Google Sans", sans-serif;
            font-size: 1.3rem;
            text-align: left;
          }

          .sidebar-chat {
  max-height: 50vh;
  overflow-y: auto;
  overflow-x: hidden;
  cursor: pointer;
}

          .sidebar-chat::after {
            content: "";
            height: 100%;
            width: 3vh;
            background: linear-gradient(90deg, rgba(15, 15, 15, 0.51) 0%, rgba(15, 15, 15, 1) 100%);
            position: absolute;
            margin: 10rem 0 0 0;
            right: 0;
            top: 0%;
            z-index: 1001;
          }

          .sidebar-chat li {
            font-family: "Valley Sans", sans-serif;
            font-size: 1rem;
          }

          .sidebar-chat ul {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

          }

          .sidebar-chat li {
            padding: 0.5rem 0.5rem 0.5rem 0;
          }

          .sidebar-chat li:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .sidebar-chat li:active {
            background-color: rgba(255, 255, 255, 0.2);
          }
    </style>
      <div class="chatarea">
        <div class="sidebar-main">
          <div class="sidebar-main-menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>button-pointer</title>
              <path
                d="M20 20.5C20 21.3 19.3 22 18.5 22H13C12.6 22 12.3 21.9 12 21.6L8 17.4L8.7 16.6C8.9 16.4 9.2 16.3 9.5 16.3H9.7L12 18V9C12 8.4 12.4 8 13 8S14 8.4 14 9V13.5L15.2 13.6L19.1 15.8C19.6 16 20 16.6 20 17.1V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H8V12H4V4H20V12H18V14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z" />
            </svg>
            <span>Nuevo chat</span>
          </div>
        </div>

      <div class="sidebar-bottom">
          <div class="sidebar-bottom-title">
            <h3>Chats</h3>
          </div>
          <div class="sidebar-chat">
          <ul></ul>
          </div>
        </div>
      </div>
    </div>
    `

    const ul = this.shadow.querySelector('ul')

    this.data.forEach(chat => {
      const link = document.createElement('li')
      link.ul = chat.url
      link.textContent = chat.name
      ul.appendChild(link)
    })

  }
}

customElements.define('chatarea-component', Chatarea);