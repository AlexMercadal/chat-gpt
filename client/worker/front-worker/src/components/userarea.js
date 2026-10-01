class userArea extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.title = this.getAttribute('title')
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
        .sidebar-footer {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 1rem;
            position: absolute;
            z-index: 1001;
            flex-shrink: 0;
            bottom:0;
          }

          .sidebar-footer-user {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            background-color: hsl(138, 74%, 39%);
            padding: 0.2rem;
          }

          .sidebar-user {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            padding-left: 1rem;
            gap:1rem;
          }

          .sidebar-user svg {
            width: 10%;
          }

          .sidebar-user span {
            width: 90%;
            font-family: "Google Sans", sans-serif;
            font-size: 1.3rem;
          }

    </style>

    <div class="sidebar-footer">
      <div class="sidebar-footer-user">
        <div class="sidebar-user">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>account-outline</title>
            <path
              d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z" />
          </svg>
          <span>${this.title}</span>
        </div>
      </div>
    </div>
    `

  }
}

customElements.define('userarea-component', userArea);